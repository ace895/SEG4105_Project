import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getServerUrl } from "../utils/api";
import { Platform } from "react-native";

export default function ReviewMealLoader() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const sendImage = async () => {
    try {
      const baseUrl = getServerUrl();
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

      const res = await fetch(`${baseUrl}/process-meal-image`, {
        method: "POST",
        body: formData,

      });

      if (!res.ok) {
        console.error("Upload failed", await res.text());
        return;
      }

      const data = await res.json();

      const ingredients = Object.entries(data).map(([name, info]: any) => ({
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
          imageUri,
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
