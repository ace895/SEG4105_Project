import { View, ScrollView, StyleSheet, Text, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import IngredientCard, { Ingredient } from "../../components/IngredientCard";
import { router } from "expo-router";


export default function MealDetailsPage() {
  const { ingredients, imageUri, name, date } = useLocalSearchParams();

  const imgUri = Array.isArray(imageUri) ? imageUri[0] : imageUri;

  let ingredientList: Ingredient[] = [];
  try {
    if (typeof ingredients === "string") {
      ingredientList = JSON.parse(ingredients);
    }
  } catch {}

  // Totals
  const totalCalories = ingredientList.reduce((s, i) => s + i.calories, 0);
  const totalWeight = ingredientList.reduce((s, i) => s + i.weight, 0);
  const totalProteins = ingredientList.reduce((s, i) => s + i.proteins, 0);
  const totalFats = ingredientList.reduce((s, i) => s + i.fats, 0);
  const totalCarbs = ingredientList.reduce((s, i) => s + i.carbs, 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>      
          <TouchableOpacity
      style={styles.backButton}
      onPress={() =>
        router.push({pathname: "/dashboard",
        })
      }
    >
      <Text style={styles.backButtonText}>Back to Dashboard</Text>
    </TouchableOpacity>


      {imgUri ? (
        <Image source={{ uri: imgUri }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text>No Image</Text>
        </View>
      )}

      <Text style={styles.title}>{name}</Text>

      {ingredientList.map((item, index) => (
        <IngredientCard key={index} ingredient={item} onEdit={() => {}} />
      ))}

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Totals</Text>
        <Text>{totalCalories} calories</Text>
        <Text>{totalWeight} grams</Text>
        <Text>{totalProteins}g proteins</Text>
        <Text>{totalFats}g fats</Text>
        <Text>{totalCarbs}g carbs</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  placeholder: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  summary: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  summaryTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },

   backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "600",
  },
});
