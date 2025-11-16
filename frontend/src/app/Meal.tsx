import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Image, Text } from 'react-native';
import IngredientCard, { Ingredient } from '../components/IngredientCard';
import IngredientEditModal from '../components/EditIngredientModal';

interface MealDetailsProps {
  ingredients: Ingredient[];
  imageUri?: string;
}

export default function MealDetails({ ingredients, imageUri }: MealDetailsProps) {
  const [ingredientList, setIngredientList] = useState<Ingredient[]>(ingredients);

  const [editVisible, setEditVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  // Dynamic totals based on current ingredientList
  const totalCalories = ingredientList.reduce((sum, item) => sum + item.calories, 0);
  const totalWeight = ingredientList.reduce((sum, item) => sum + item.weight, 0);
  const totalProteins = ingredientList.reduce((sum, item) => sum + item.proteins, 0);
  const totalFats = ingredientList.reduce((sum, item) => sum + item.fats, 0);
  const totalCarbs = ingredientList.reduce((sum, item) => sum + item.carbs, 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Image */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>No image available</Text>
        </View>
      )}

      {/* Ingredient Cards */}
      {ingredientList.map((item, index) => (
        <IngredientCard
          key={index}
          ingredient={item}
          onEdit={() => {
            setEditingIngredient(item);
            setEditingIndex(index);
            setEditVisible(true);
          }}
        />
      ))}

      {/* Edit Ingredient Modal */}
      {editingIngredient && (
        <IngredientEditModal
          visible={editVisible}
          ingredient={editingIngredient}
          onClose={() => setEditVisible(false)}
          onSave={(updated) => {
            if (editingIndex !== null) {
              const updatedList = [...ingredientList];
              updatedList[editingIndex] = {
                ...updated,
                calories: Number(updated.calories),
                weight: Number(updated.weight),
                proteins: Number(updated.proteins),
                fats: Number(updated.fats),
                carbs: Number(updated.carbs),
              };
              setIngredientList(updatedList);
            }
            setEditVisible(false);
          }}
        />
      )}

      {/* Totals */}
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
