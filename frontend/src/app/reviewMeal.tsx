import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getServerUrl, getMLServerUrl } from "../utils/api";
import { Platform } from "react-native";

export default function ReviewMealLoader() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sendImage = async () => {
      try {
        // Use LOCAL ML server for image processing (real CLIP + DINO models)
        const mlServerUrl = getMLServerUrl();
        const formData = new FormData();

        let fileToUpload: any;

        if (Platform.OS === "web") {
          // Convert blob URI to File for web uploads
          const blob = await fetch(imageUri as string).then((r) => r.blob());

          fileToUpload = new File([blob], "meal.jpg", { type: blob.type });
        } else {
          // Native upload (Expo Go / iOS / Android)
          fileToUpload = {
            uri: imageUri,
            name: "meal.jpg",
            type: "image/jpeg",
          };
        }

        formData.append("image", fileToUpload);

        // Send image to LOCAL backend ML server for processing
        const res = await fetch(`${mlServerUrl}/process-meal-image`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          console.error("ML processing failed", await res.text());
          return;
        }

        const data = await res.json();


        // Use S3 image_url from backend response. If backend returns a filename
        const ingredientsData = data.ingredients || data;
        let s3ImageUrl = data.image_url || imageUri;
        if (s3ImageUrl && !s3ImageUrl.startsWith("http")) {
          const filename = s3ImageUrl.includes("/")
            ? s3ImageUrl.split("/").pop()
            : s3ImageUrl;
          s3ImageUrl = `${getServerUrl()}/get-meal-image/${filename}`;
        }

        const ingredients = Object.entries(ingredientsData).map(([name, info]: any) => ({
          name,
          calories: info.calorie,
          weight: info.weight,
          proteins: info.protein,
          fats: info.fat,
          carbs: info.carb,
        }));

        router.push({
          pathname: "/reviewconfirmmeal",
          params: {
            imageUri: s3ImageUrl, // Use S3 image URL for display and saving
            ingredients: JSON.stringify(ingredients),
          },
        });

      } catch (err) {
        console.error("Error uploading meal image:", err);
      }
    };

    sendImage();
  }, []);

  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" />
      <Text>Analyzing Your Meal...</Text>
      <Image source={{ uri: imageUri }} style={styles.preview} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingTop: 100,
    alignItems: "center",
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginTop: 20,
  },
});
