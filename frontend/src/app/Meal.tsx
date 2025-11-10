import React from 'react';
import { View, ScrollView, StyleSheet, Image, Text } from 'react-native';
import IngredientCard, {Ingredient} from '../components/IngredientCard';

interface MealDetailsProps {
  ingredients: Ingredient[];
  imageUri?: string;
}

export default function MealDetails({ ingredients, imageUri }: MealDetailsProps) {
  // Sum totals dynamically
  const totalCalories = ingredients.reduce((sum, item) => sum + item.calories, 0);
  const totalWeight = ingredients.reduce((sum, item) => sum + item.weight, 0);
  const totalProteins = ingredients.reduce((sum, item) => sum + item.proteins, 0);
  const totalFats = ingredients.reduce((sum, item) => sum + item.fats, 0);
  const totalCarbs = ingredients.reduce((sum, item) => sum + item.carbs, 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {imageUri ? (
    <Image source={{ uri: imageUri }} style={styles.image} />
    ) : (
    <View style={[styles.image, styles.placeholder]}>
        <Text style={styles.placeholderText}>No image available</Text>
    </View>
    )}

      {ingredients.map((item, i) => (
        <IngredientCard key={i} ingredient={item} />
      ))}

      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryTitle}>Totals</Text>
          <Text style={styles.text}>{totalCalories} calories</Text>
          <Text style={styles.text}>{totalWeight} grams</Text>
        </View>

        <View>
          <Text style={styles.summaryTitle}>Macro-nutrients</Text>
          <Text style={styles.text}>{totalProteins}g proteins</Text>
          <Text style={styles.text}>{totalFats}g fats</Text>
          <Text style={styles.text}>{totalCarbs}g carbs</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  image: {
  width: '100%',
  height: 180,
  borderRadius: 12,
  marginBottom: 15,
},
placeholder: {
  backgroundColor: '#eee',
  justifyContent: 'center',
  alignItems: 'center',
},
placeholderText: {
  color: '#777',
  fontStyle: 'italic',
},
  summary: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
  },
  text: {
    color: '#333',
  },
});
