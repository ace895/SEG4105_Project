import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import IngredientCard, { Ingredient } from "../components/IngredientCard";
import IngredientEditModal from "../components/EditIngredientModal";
import AddIngredientModal from "../components/AddIngredientModal";
import { useUser } from "../context/UserContext";
import { getServerUrl } from "../utils/api";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import { ActivityIndicator } from "react-native";

export default function ReviewConfirmMeal() {
  const { email: userEmail } = useUser();
  const [loading, setLoading] = useState(false);

  const { imageUri, ingredients: ingredientString } = useLocalSearchParams();

  // Parse ingredient JSON coming from ReviewMealLoader
  let parsedIngredients: Ingredient[] = [];
  try {
    if (ingredientString && typeof ingredientString === "string") {
      parsedIngredients = JSON.parse(ingredientString);
    }
  } catch { }

  const [ingredients, setIngredients] = useState<Ingredient[]>(parsedIngredients);
  const [currentImage, setCurrentImage] = useState(imageUri as string);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);

  // "retake" | "add" | null
  const [pickerMode, setPickerMode] = useState<"retake" | "add" | null>(null);

  // ---- PROCESS IMAGE THROUGH BACKEND AGAIN ----
  const processNewImage = async (uri: string) => {
    const baseUrl = getServerUrl();
    const formData = new FormData();

    let fileToUpload: any;

    if (Platform.OS === "web") {
      const blob = await fetch(uri).then((r) => r.blob());
      fileToUpload = new File([blob], "meal.jpg", { type: blob.type });
    } else {
      fileToUpload = {
        uri,
        name: "meal.jpg",
        type: "image/jpeg",
      };
    }

    formData.append("image", fileToUpload);

    const res = await fetch(`${baseUrl}/process-meal-image`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.error("Upload failed", await res.text());
      return null;
    }

    const data = await res.json();
    const ingredientsData = data.ingredients || data;
    const s3ImageUrl = data.image_url || uri;

    const newIngredients = Object.entries(ingredientsData).map(([name, info]: any) => ({
      name,
      calories: info.calorie,
      weight: info.weight,
      proteins: info.protein,
      fats: info.fat,
      carbs: info.carb,
    }));

    // Return both new ingredients and the S3 image URL
    return { newIngredients, s3ImageUrl };
  };

  // ---- HANDLE RETAKE OR ADD PHOTO ACTION ----
  const handleImage = async (uri: string) => {
    setLoading(true);
    const result = await processNewImage(uri);
    setLoading(false);
    if (!result) return;
    const { newIngredients, s3ImageUrl } = result;

    if (pickerMode === "retake") {
      // Replace everything
      setCurrentImage(s3ImageUrl);
      setIngredients(newIngredients);
    } else if (pickerMode === "add") {
      // Append ingredients
      setCurrentImage(s3ImageUrl); // Always update to latest image
      setIngredients((prev) => [...prev, ...newIngredients]);
    }

    setPickerMode(null);
  };

  // ---- CAMERA ----
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      alert("Camera permission required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      handleImage(result.assets[0].uri);
    }
  };

  // ---- GALLERY ----
  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      alert("Media library permission required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      handleImage(result.assets[0].uri);
    }
  };

  // ---- FINISH MEAL ----
  const handleDone = async () => {
    if (!userEmail) {
      alert("Login required.");
      return;
    }

    const ingredientObject: any = {};
    ingredients.forEach((i) => {
      ingredientObject[i.name] = {
        calorie: i.calories,
        protein: i.proteins,
        fat: i.fats,
        carb: i.carbs,
        weight: i.weight,
      };
    });

    // Create timestamp with local timezone offset to preserve local date/time
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localTime = new Date(now.getTime() - timezoneOffset).toISOString().slice(0, -1);

    const payload = {
      email: userEmail,
      time: localTime + 'Z', // Treat local time as if it were UTC so backend saves it correctly
      ingredients: ingredientObject,
      image_url: currentImage, // Include S3 image URL
      edited: false,
      before_edit: {},
      after_edit: ingredientObject,
    };

    try {
      const res = await fetch(`${getServerUrl()}/add-meal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Meal saved!");
        router.push("/dashboard");
      } else {
        alert("Failed to save meal.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  // TOTALS
  const safe = (arr: Ingredient[]) => (Array.isArray(arr) ? arr : []);
  const totalCalories = safe(ingredients).reduce((s, i) => s + (i.calories || 0), 0);
  const totalWeight = safe(ingredients).reduce((s, i) => s + (i.weight || 0), 0);
  const totalProteins = safe(ingredients).reduce((s, i) => s + (i.proteins || 0), 0);
  const totalFats = safe(ingredients).reduce((s, i) => s + (i.fats || 0), 0);
  const totalCarbs = safe(ingredients).reduce((s, i) => s + (i.carbs || 0), 0);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={{ marginTop: 12, fontSize: 16 }}>Processing image...</Text>
      </View>
    );
  }

  return (


    <ScrollView contentContainerStyle={styles.container}>

      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.push("/dashboard")}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* IMAGE */}
      <View style={styles.imageWrapper}>
        {currentImage ? (
          <Image source={{ uri: currentImage }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text>No Image</Text>
          </View>
        )}
      </View>

      {/* INGREDIENT LIST */}
      {ingredients.map((ing, index) => (
        <IngredientCard
          key={index}
          ingredient={ing}
          onEdit={() => {
            setEditingIngredient(ing);
            setEditVisible(true);
          }}
        />
      ))}



      {/* TOTALS */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryTitle}>Totals</Text>

          <View style={styles.greenBadgeLarge}>
            <Text style={styles.summaryNumber}>{totalCalories}</Text>
            <Text style={styles.summaryLabel}>calories</Text>
          </View>

          <View style={styles.blueBadgeLarge}>
            <Text style={styles.summaryNumber}>{totalWeight}</Text>
            <Text style={styles.summaryLabel}>grams</Text>
          </View>
        </View>

        <View style={styles.summaryColumn}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.summaryTitle}>Macro-nutrients</Text>

            <TouchableOpacity
              onPress={() => setAddVisible(true)}
              style={styles.addCircle}
            >
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.macroBadge}>
            <Text style={styles.macroLabelLarge}>{totalProteins}g proteins</Text>
          </View>

          <View style={styles.macroBadge}>
            <Text style={styles.macroLabelLarge}>{totalFats}g fats</Text>
          </View>

          <View style={styles.macroBadge}>
            <Text style={styles.macroLabelLarge}>{totalCarbs}g carbs</Text>
          </View>
        </View>
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => setPickerMode("retake")}
        >
          <Ionicons name="camera-reverse" size={30} color="#27ae60" />
          <Text>Retake Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => setPickerMode("add")}
        >
          <Ionicons name="camera" size={30} color="#2980b9" />
          <Text>Add Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomButton} onPress={handleDone}>
          <Ionicons name="checkmark-circle" size={30} color="#e67e22" />
          <Text>Done</Text>
        </TouchableOpacity>
      </View>

      {/* IMAGE PICKER MODAL */}
      <Modal visible={pickerMode !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {pickerMode === "retake" ? "Retake Meal Photo" : "Add Meal Photo"}
            </Text>

            <TouchableOpacity style={styles.modalBtn} onPress={openCamera}>
              <Text style={styles.modalText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBtn} onPress={openGallery}>
              <Text style={styles.modalText}>Choose From Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: "#eee" }]}
              onPress={() => setPickerMode(null)}
            >
              <Text style={{ color: "red" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODALS */}
      {editingIngredient && (
        <IngredientEditModal
          visible={editVisible}
          ingredient={editingIngredient}
          onClose={() => setEditVisible(false)}
          onSave={(updated) =>
            setIngredients((prev) =>
              prev.map((i) => (i.name === editingIngredient.name ? updated : i))
            )
          }
        />
      )}

      <AddIngredientModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onSave={(ing) => setIngredients((prev) => [...prev, ing])}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  headerRow: { flexDirection: "row", marginBottom: 20 },
  imageWrapper: { alignItems: "center" },
  image: { width: "80%", height: 180, borderRadius: 10 },
  placeholder: {
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  summary: { marginTop: 20 },
  summaryTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  bottomButton: { alignItems: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: 280,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  modalBtn: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: "center",
  },
  modalText: { fontSize: 16 },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingTop: 80,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  summaryColumn: {
    width: "48%",
  },
  greenBadgeLarge: {
    backgroundColor: "#d9f8e3",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  blueBadgeLarge: {
    backgroundColor: "#e3f0f9",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
  },
  summaryLabel: {
    color: "#555",
  },
  macroBadge: {
    backgroundColor: "#f9e3e3",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  macroLabelLarge: {
    fontSize: 16,
    fontWeight: "700",
  },
  addCircle: {
    backgroundColor: "#a76df2",
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
});
