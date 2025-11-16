import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getServerUrl } from "../utils/api";

export default function ReviewMealLoader() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sendImage = async () => {
      const baseUrl = getServerUrl();
      const formData = new FormData();

      formData.append("image", {
        uri: imageUri,
        name: "meal.jpg",
        type: "image/jpeg",
      } as any);

      const res = await fetch(`${baseUrl}/process-meal-image`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await res.json();

      // Format backend response into ingredient array
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
        params: { imageUri, ingredients: JSON.stringify(ingredients) },
      });
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
