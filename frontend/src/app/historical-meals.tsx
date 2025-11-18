import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import MealCard, { Meal } from "../components/MealCard";
import { useUser } from "../context/UserContext";
import { getServerUrl } from "../utils/api";
import { useLocalSearchParams, router } from "expo-router";

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d); // LOCAL date (no timezone shift)
}

export default function HistoricalMealsPage() {
  const { email: userEmail } = useUser();
  const { date } = useLocalSearchParams<{ date: string }>();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);

  const localDateObj = date ? parseLocalDate(date) : new Date();

  useEffect(() => {
    if (!userEmail || !date) return;

    const fetchMeals = async () => {
      try {
        const baseUrl = getServerUrl();
        const url = `${baseUrl}/get-meals?email=${encodeURIComponent(userEmail)}&date=${date}`;

        const res = await fetch(url);
        const data = await res.json();

        const parsedMeals: Meal[] = [];

        Object.entries(data).forEach(([time, mealData]: any, index) => {
          const ingredientArray = Object.entries(mealData)
            .filter(([k]) => k !== "image_filename")
            .map(([name, info]: any) => ({
              name,
              calories: info.calorie,
              weight: info.weight,
              proteins: info.protein,
              fats: info.fat,
              carbs: info.carb,
            }));

          parsedMeals.push({
            id: `${date}-${index}`,
            name: ingredientArray.map((i) => i.name).join(", "),
            time,
            calories: ingredientArray.reduce((a, b) => a + b.calories, 0),
            weight: ingredientArray.reduce((a, b) => a + b.weight, 0),
            proteins: ingredientArray.reduce((a, b) => a + b.proteins, 0),
            fats: ingredientArray.reduce((a, b) => a + b.fats, 0),
            carbs: ingredientArray.reduce((a, b) => a + b.carbs, 0),
            ingredients: ingredientArray,
            imageUri: mealData.image_filename
              ? `${getServerUrl()}/uploads/${mealData.image_filename}`
              : "",
          });
        });

        setMeals(parsedMeals);

        const totals = parsedMeals.reduce(
          (acc, m) => ({
            calories: acc.calories + m.calories,
            protein: acc.protein + m.proteins,
            fat: acc.fat + m.fats,
            carbs: acc.carbs + m.carbs,
          }),
          { calories: 0, protein: 0, fat: 0, carbs: 0 }
        );

        setTotalCalories(totals.calories);
        setTotalProtein(totals.protein);
        setTotalFat(totals.fat);
        setTotalCarbs(totals.carbs);
      } catch (err) {
        console.error("Error fetching meals:", err);
      }
    };

    fetchMeals();
  }, [userEmail, date]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/dashboard")}
      >
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>

      <Text style={styles.dateText}>
        {localDateObj.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </Text>

      <Text style={styles.sectionHeader}>You consumed</Text>

      <View style={styles.totalsRow}>
        <View style={[styles.totalBox, styles.greenBox]}>
          <Text style={styles.calorieNumber}>{totalCalories}</Text>
          <Text style={styles.calorieLabel}>calories</Text>
        </View>

        <View style={[styles.totalBox, styles.pinkBox]}>
          <View style={styles.macrosRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroNumber}>{totalProtein}</Text>
              <Text style={styles.macroLabel}>grams protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroNumber}>{totalFat}</Text>
              <Text style={styles.macroLabel}>grams fat</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroNumber}>{totalCarbs}</Text>
              <Text style={styles.macroLabel}>grams carbs</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.mealsTitle}>Meals</Text>

      {meals.map((meal, i) => (
        <MealCard key={meal.id} meal={meal} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  dateText: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
    color: "#444",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  totalBox: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  greenBox: {
    backgroundColor: "#d9f8e3",
    alignItems: "center",
  },
  pinkBox: {
    backgroundColor: "#f9e3e3",
    justifyContent: "center",
  },
  calorieNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#222",
  },
  calorieLabel: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroItem: {
    alignItems: "center",
    flex: 1,
  },
  macroNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
  },
  macroLabel: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    marginTop: 2,
  },
  mealsTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "600",
  },
});
