import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import MealCard, { Meal } from "../components/MealCard";

export default function HistoricalMealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);

  // Mock data (matches the format used by MealCard)
  const MOCK_DATA: Meal[] = [
    {
      name: "Greek Salad",
      calories: 200,
      weight: 300,
      proteins: 10,
      fats: 20,
      carbs: 20,
      time: "08:00 AM",
      imageUri: "https://via.placeholder.com/100",
    },
    {
      name: "Burger",
      calories: 400,
      weight: 200,
      proteins: 30,
      fats: 40,
      carbs: 50,
      time: "01:30 PM",
      imageUri: "https://via.placeholder.com/100",
    },
    {
      name: "Fish & Chicken",
      calories: 700,
      weight: 320,
      proteins: 50,
      fats: 10,
      carbs: 0,
      time: "07:45 PM",
      imageUri: "https://via.placeholder.com/100",
    },
  ];

  useEffect(() => {
    // simulate "fetching" meals — replace later with backend fetch
    setMeals(MOCK_DATA);

    // compute totals
    const totals = MOCK_DATA.reduce(
      (acc, m) => {
        acc.calories += m.calories;
        acc.protein += m.proteins;
        acc.fat += m.fats;
        acc.carbs += m.carbs;
        return acc;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );

    setTotalCalories(totals.calories);
    setTotalProtein(totals.protein);
    setTotalFat(totals.fat);
    setTotalCarbs(totals.carbs);
  }, []);

  const date = "2025-07-07"; // mock date

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Date */}
      <Text style={styles.dateText}>
        {new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </Text>

      {/* Totals */}
       <Text style={styles.sectionHeader}>You consumed</Text>

<View style={styles.totalsRow}>

  {/* Green Calories Box */}
  <View style={[styles.totalBox, styles.greenBox]}>
    <Text style={styles.calorieNumber}>{totalCalories}</Text>
    <Text style={styles.calorieLabel}>calories</Text>
  </View>

  {/* Pink Macros Box */}
    <View style={[styles.totalBox, styles.pinkBox]}>
        <View style={styles.macrosRow}>
        <View style={styles.macroItem}>
            <Text style={styles.macroNumber}>{totalProtein}</Text>
            <Text style={styles.macroLabel}>grams of protein</Text>
        </View>

        <View style={styles.macroItem}>
            <Text style={styles.macroNumber}>{totalFat}</Text>
            <Text style={styles.macroLabel}>grams of fats</Text>
        </View>

        <View style={styles.macroItem}>
            <Text style={styles.macroNumber}>{totalCarbs}</Text>
            <Text style={styles.macroLabel}>grams of carbs</Text>
        </View>
        </View>
    </View>

    </View>

      {/* Meals list */}
      <Text style={styles.mealsTitle}>Meals</Text>

      {meals.map((meal, i) => (
        <MealCard key={i} meal={meal} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  dateText: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 15,
  },
  summaryBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    justifyContent: "space-between",
  },
  summaryItem: {
    width: "45%",
    backgroundColor: "#f9e3e3",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: "700",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  mealsTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
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
  backgroundColor: "#d9f8e3", // light green
  alignItems: "center",
},

pinkBox: {
  backgroundColor: "#f9e3e3", // light pink
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
});
