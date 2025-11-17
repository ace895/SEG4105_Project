"""
Processes images to identify food and get its weight, calorie count, and macronutrient count
"""
from pathlib import Path
from PIL import Image
from io import BytesIO

import requests
import os
import torch
from dotenv import load_dotenv



load_dotenv()
USE_AWS=False
USDA_API_KEY = os.getenv("USDA_API_KEY")
USDA_API_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

if USE_AWS:
    import sagemaker
    import boto3
    from sagemaker.huggingface import HuggingFaceModel

    #Create AWS client
    try:
        role = sagemaker.get_execution_role()
    except ValueError:
        iam = boto3.client('iam')
        role = iam.get_role(RoleName='sagemaker_execution_role')['Role']['Arn']

    #-- Object classification model (for weight estimation) --
    #Configuration - https://huggingface.co/IDEA-Research/grounding-dino-base
    hub = {
        'HF_MODEL_ID':'IDEA-Research/grounding-dino-base',
        'HF_TASK':'zero-shot-object-detection'
    }

    #Create Hugging Face Model Class
    huggingface_model = HuggingFaceModel(
        transformers_version='4.51.3',
        pytorch_version='2.6.0',
        py_version='py312',
        env=hub,
        role=role, 
    )

    #Deploy model to SageMaker Inference
    dino_predictor = huggingface_model.deploy(
        initial_instance_count=1, # number of instances
        instance_type='ml.m5.xlarge' # ec2 instance type
    )

    #-- Image classification model (for ingredient identification)
    #Configuration - https://huggingface.co/openai/clip-vit-base-patch32
    hub = {
        'HF_MODEL_ID':'openai/clip-vit-base-patch32',
        'HF_TASK':'zero-shot-image-classification'
    }

    #Create Hugging Face Model Class
    huggingface_model = HuggingFaceModel(
        transformers_version='4.51.3',
        pytorch_version='2.6.0',
        py_version='py312',
        env=hub,
        role=role, 
    )

    #Deploy model to SageMaker Inference
    clip_predictor = huggingface_model.deploy(
        initial_instance_count=1, # number of instances
        instance_type='ml.m5.xlarge' # ec2 instance type
    )

else:
    #Load ingrediants
    INGREDIENT_CANDIDATES = []
    current_dir = Path.cwd() / "app" / "utils"
    with open(current_dir / 'ingredients.txt', 'r') as file:
        INGREDIENT_CANDIDATES = [line.strip() for line in file.readlines()]

    #Load image classification model
    from transformers import CLIPProcessor, CLIPModel
    clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
    clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

    #Load object detection mode 
    from transformers import AutoProcessor, AutoModelForZeroShotObjectDetection
    device = "cuda" if torch.cuda.is_available() else "cpu"
    dino_processor = AutoProcessor.from_pretrained("IDEA-Research/grounding-dino-base")
    dino_model = AutoModelForZeroShotObjectDetection.from_pretrained("IDEA-Research/grounding-dino-base").to(device)

def detect_ingredients(image_bytes):
    """
    Detect ingredients in an image.

    Returns:
        (list): List of ingrediants
    """
    if USE_AWS:
        #Get response from deployed model
        response = clip_predictor.predict({
            "inputs": {
                "image": list(image_bytes),
                "candidate_labels": INGREDIENT_CANDIDATES
            }
        })
        scores = [r["score"] for r in response[0]]

        #Compute mean and std
        probs_tensor = torch.tensor(scores)
        mean = probs_tensor.mean()
        std = probs_tensor.std()

    else:
        #Get response from local model
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        inputs = clip_processor(text=INGREDIENT_CANDIDATES, images=image, return_tensors="pt", padding=True)
        with torch.no_grad():
            outputs = clip_model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = logits_per_image.softmax(dim=1)

        #Compute mean and std
        mean = probs[0].mean()
        std = probs[0].std()

    #Use z-score to retrieve ingredients
    z_threshold = 0.8
    detected = [INGREDIENT_CANDIDATES[i] for i, p in enumerate(probs[0]) if p > mean + z_threshold*std]
    return detected

def get_nutrition(ingredient_name):
    """
    Uses the USDA FoodData Central API to get nutrition data for an ingredient.
    Returns a dictionary with calorie, fat, protein, and carb.

    Returns:
        (dict): Dictionary of nutrition information with the following keys:
            calorie, fat, protein, carb
    """
    params = {"query": ingredient_name, "pageSize": 1, "api_key": USDA_API_KEY}
    try:
        #Send request to USDA's API
        res = requests.get(USDA_API_URL, params=params)
        data = res.json()
        if "foods" not in data or len(data["foods"]) == 0:
            return None

        #Extract required nutrition data
        food = data["foods"][0]
        nutrients = {n["nutrientName"]: n["value"] for n in food.get("foodNutrients", [])}

        calorie = nutrients.get("Energy", nutrients.get("Energy (kcal)", 0))
        fat = nutrients.get("Total lipid (fat)", 0)
        protein = nutrients.get("Protein", 0)
        carb = nutrients.get("Carbohydrate, by difference", 0)

        return {
            "calorie": round(calorie, 1),
            "fat": round(fat, 1),
            "protein": round(protein, 1),
            "carb": round(carb, 1)
        }

    except Exception as e:
        print(f"Error getting nutrition for {ingredient_name}: {e}")
        return None

def get_average_weight(ingredient_name):
    """
    Looks up approximate weight for an ingredient from USDA.
    Returns weight in grams for a typical serving, trying multiple results until one has servingSize.
    """
    params = {
        "query": ingredient_name,
        "pageSize": 10, 
        "requireAllWords": False,
        "sortBy": "score",
        "api_key": USDA_API_KEY
    }

    try:
        res = requests.get(USDA_API_URL, params=params)
        data = res.json()
        foods = data.get("foods", [])
        if not foods:
            return None

        #Loop through all results until one has servingSize
        for food in foods:
            serving_weight = food.get("servingSize")
            if serving_weight:
                print(f"Found serving size for '{ingredient_name}': ({serving_weight}g)")
                return serving_weight

        #If none had servingSize, log and return None
        print(f"No serving size info for '{ingredient_name}'")
        return None

    except Exception as e:
        print(f"USDA lookup failed for {ingredient_name}: {e}")
        return None

USDA_WEIGHT_CACHE = {}

def estimate_weights(image_path, detected_ingredients):
    """
    Estimates weights for ingredients in an image using normalized object area fractions
    and cached USDA serving sizes for scale.

    Args:
        image_path (str): Path to the input image.
        detected_ingredients (list[str]): List of ingredients identified by classifier.

    Returns:
        dict: Mapping of ingredients to estimated weight in grams (None if unknown).
    """
    image = Image.open(image_path).convert("RGB")

    #Create text prompt from detected ingredients
    text_prompt = ". ".join([ing.lower() for ing in detected_ingredients]) + "."

    #Run object detection model
    if USE_AWS:
        with open(image_path, "rb") as f:
            image_bytes = f.read()
        response = dino_predictor.predict({
            "inputs": {"image": list(image_bytes), "text": text_prompt}
        })
        res = response[0]
        boxes = torch.tensor(res["boxes"])
        scores = torch.tensor(res["scores"])
        labels = res["labels"]
        results = [{"boxes": boxes, "scores": scores, "text_labels": labels}]
    else:
        inputs = dino_processor(images=image, text=text_prompt, return_tensors="pt").to(device)
        with torch.no_grad():
            outputs = dino_model(**inputs)
        results = dino_processor.post_process_grounded_object_detection(
            outputs,
            inputs.input_ids,
            threshold=0.4,
            text_threshold=0.3,
            target_sizes=[image.size[::-1]],
        )

    #Parse model results
    detected_objects = {}
    res = results[0]
    boxes = res["boxes"]
    labels = res["text_labels"]
    width, height = image.width, image.height

    #Get area of each ingredient
    for i, label in enumerate(labels):
        label = label.lower()
        box = boxes[i]
        box_width = box[2].item() - box[0].item()
        box_height = box[3].item() - box[1].item()
        area_fraction = (box_width * box_height) / (width * height)
        detected_objects[label] = max(area_fraction, detected_objects.get(label, 0))

    print("Detected objects:", detected_objects)

    weights = {}
    usda_weights = {}

    #Cache USDA serving weights
    for ingredient in detected_ingredients:
        key = ingredient.lower()
        if key in USDA_WEIGHT_CACHE:
            w = USDA_WEIGHT_CACHE[key]
        else:
            w = get_average_weight(ingredient)
            USDA_WEIGHT_CACHE[key] = w
        usda_weights[ingredient] = w

    #Map model provided labels to ingredients 
    label_to_ings = {}
    for label, frac in detected_objects.items():
        matched = [ing for ing in detected_ingredients if ing.lower() in label]
        if matched:
            label_to_ings[label] = matched

    #Compute per-ingredient area fractions
    ingredient_area = {ing: 0.0 for ing in detected_ingredients}
    for label, matched_ings in label_to_ings.items():
        frac = detected_objects[label]
        if len(matched_ings) == 1:
            ingredient_area[matched_ings[0]] += frac
        else:
            #Use USDA weights to estimate average portion sizes 
            weights_for_label = [usda_weights[ing] or 0 for ing in matched_ings]
            total_w = sum(weights_for_label)
            if total_w == 0: #USDA doesn't have any of the detected ingredients 
                share = frac / len(matched_ings)
                for ing in matched_ings:
                    ingredient_area[ing] += share
            else:
                for ing, w in zip(matched_ings, weights_for_label):
                    ingredient_area[ing] += frac * (w / total_w)

    matched_ings = [ing for ing, a in ingredient_area.items() if a > 0]
    unmatched_ings = [ing for ing in detected_ingredients if ing not in matched_ings]

    #Normalize fractions for all ingredients  allocate scaled weights
    total_matched_area = sum(ingredient_area[ing] for ing in matched_ings)
    if matched_ings and total_matched_area > 0:
        normalized = {ing: ingredient_area[ing] / total_matched_area for ing in matched_ings}
        valid_usda_weights = [usda_weights[ing] for ing in matched_ings if usda_weights[ing] is not None]
        total_expected_weight_matched = sum(valid_usda_weights) if valid_usda_weights else None

        #Calculate final weight based on normalized area and average portion
        for ing in matched_ings:
            if total_expected_weight_matched is not None:
                weight = normalized[ing] * total_expected_weight_matched
                weights[ing] = round(weight, 1)
                print(f"Calculated weight for {ing}: {weight:.1f}g (scaled; normalized fraction {normalized[ing]:.3f})")
            else:
                weights[ing] = None
    else:
        for ing in detected_ingredients:
            weights[ing] = usda_weights[ing]

    #Fallback for unmatched ingredients
    for ing in unmatched_ings:
        weights[ing] = usda_weights[ing]
        if weights[ing] is None:
            print(f"Fallback weight for {ing}: None (no USDA info)")
        else:
            print(f"Fallback weight for {ing}: {weights[ing]:.1f}g (USDA)")

    return weights

import math

def to_python_number(value):
    """Convert numpy numbers → Python float. Replace NaN/inf with None."""
  
    if hasattr(value, "item"):
        value = value.item()

    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None

    return value

def process_image(image_path):
    """
    Runs ingredient detection and nutrition lookup, then returns results.

    Returns:
        (dict): Dictionary mapping ingredient names to nutrition info and weight (None if not found)
            e.g. {"bread": {"calorie": 70, "fat": 1, "protein": 2, "carb": 15, "weight": 15}}
    """
    with open(image_path, "rb") as f:
        image_bytes = f.read()
    #Find ingredients
    detected = detect_ingredients(image_bytes)
    print(f"Detected ingredients: {detected}")

    #Find their weights
    weights = estimate_weights(image_path, detected)
    print(f"Estimated weights: {weights}")

    #Structure output
    results = {}

    for ingredient in detected:
        nutrition = get_nutrition(ingredient)

        # If USDA gives nothing, skip
        if not nutrition:
            continue


        cleaned_nutrition = {
            k: to_python_number(v) for k, v in nutrition.items()
        }

        cleaned_nutrition["weight"] = to_python_number(weights.get(ingredient))

        results[ingredient] = cleaned_nutrition

    return results

#Test model
if __name__ == "__main__":
    image_paths = ["pizza.jpeg", "burger.jpeg", "fish_chips.jpg", "bowl.jpg"]
    for image_path in image_paths:
        result = process_image(image_path)
        print(result)
        print()
