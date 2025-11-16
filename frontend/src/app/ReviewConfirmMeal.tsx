import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

import IngredientCard, { Ingredient } from "../components/IngredientCard";
import IngredientEditModal from "../components/EditIngredientModal";
import AddIngredientModal from "../components/AddIngredientModal";

export default function ReviewMealPage() {
  // ------------------ READ PARAMS FROM ROUTER ------------------
  const { imageUri, ingredients: ingredientString } = useLocalSearchParams();

  // Parse ingredient JSON from navigation
  let parsedIngredients: Ingredient[] = [];
  try {
    if (ingredientString && typeof ingredientString === "string") {
      parsedIngredients = JSON.parse(ingredientString);
    }
  } catch (e) {
    console.warn("Failed to parse ingredients:", e);
    parsedIngredients = [];
  }

  // ------------------ LOCAL STATE ------------------
  const [ingredients, setIngredients] = useState<Ingredient[]>(parsedIngredients);
  const [liked, setLiked] = useState<"up" | "down" | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);

  const safe = (arr: Ingredient[]) => (Array.isArray(arr) ? arr : []);

  // ------------------ TOTALS ------------------
  const totalCalories = safe(ingredients).reduce((s, i) => s + (i.calories || 0), 0);
  const totalWeight = safe(ingredients).reduce((s, i) => s + (i.weight || 0), 0);
  const totalProteins = safe(ingredients).reduce((s, i) => s + (i.proteins || 0), 0);
  const totalFats = safe(ingredients).reduce((s, i) => s + (i.fats || 0), 0);
  const totalCarbs = safe(ingredients).reduce((s, i) => s + (i.carbs || 0), 0);

  // ------------------ EDITING ------------------
  const openEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setEditVisible(true);
  };

  const saveIngredient = (updated: Ingredient) => {
    setIngredients((prev) =>
      prev.map((i) => (i.name === editingIngredient?.name ? updated : i))
    );
  };

  const addIngredient = (ing: Ingredient) => {
    setIngredients((prev) => [...prev, ing]);
  };

  // ------------------ RENDER ------------------
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>

        <View style={styles.thumbsRow}>
          <TouchableOpacity onPress={() => setLiked("up")}>
            <Ionicons
              name="thumbs-up"
              size={28}
              color={liked === "up" ? "#27ae60" : "#888"}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setLiked("down")} style={{ marginLeft: 18 }}>
            <Ionicons
              name="thumbs-down"
              size={28}
              color={liked === "down" ? "#c0392b" : "#888"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* IMAGE */}
      <View style={styles.imageWrapper}>
        {imageUri ? (
          <Image source={{ uri: imageUri as string }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text>No Image</Text>
          </View>
        )}
      </View>

      {/* INGREDIENT CARDS */}
      <View style={{ marginTop: 10 }}>
        {ingredients.map((ing, index) => (
          <IngredientCard
            key={index}
            ingredient={ing}
            onEdit={() => openEdit(ing)}
          />
        ))}
      </View>

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

      {/* BUTTON ROW */}
      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="camera-reverse" size={30} color="#27ae60" />
          <Text style={styles.bottomLabel}>Retake Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="camera" size={30} color="#2980b9" />
          <Text style={styles.bottomLabel}>Add Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="checkmark-circle" size={30} color="#e67e22" />
          <Text style={styles.bottomLabel}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* MODALS */}
      {editingIngredient && (
        <IngredientEditModal
          visible={editVisible}
          ingredient={editingIngredient}
          onClose={() => setEditVisible(false)}
          onSave={saveIngredient}
        />
      )}

      <AddIngredientModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onSave={addIngredient}
      />
    </ScrollView>
  );
}

// ------------------ STYLES ------------------
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F7F7F7",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 20,
  },
  thumbsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageWrapper: {
    alignItems: "center",
  },
  image: {
    width: "80%",
    height: 180,
    borderRadius: 12,
  },
  placeholder: {
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  summaryColumn: {
    width: "48%",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
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
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    marginBottom: 20,
  },
  bottomButton: {
    alignItems: "center",
    width: "30%",
  },
  bottomLabel: {
    marginTop: 6,
    color: "#444",
    fontSize: 13,
  },
});
