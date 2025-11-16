import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Ingredient {
  name: string;
  calories: number;
  weight: number;
  proteins: number;
  fats: number;
  carbs: number;
}

interface IngredientCardProps {
  ingredient: Ingredient;
  onEdit?: () => void; 
}

export default function IngredientCard({ ingredient, onEdit }: IngredientCardProps) {
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{ingredient.name}</Text>

        <View style={styles.row}>
          <View style={styles.badgeGreen}>
            <Text style={styles.badgeText}>{ingredient.calories} cal</Text>
          </View>

          <View style={styles.badgeBlue}>
            <Text style={styles.badgeText}>{ingredient.weight}g</Text>
          </View>

          <View style={styles.badgeRed}>
            <Text style={styles.badgeTextSmall}>{ingredient.proteins}g proteins</Text>
            <Text style={styles.badgeTextSmall}>{ingredient.fats}g fats</Text>
            <Text style={styles.badgeTextSmall}>{ingredient.carbs}g carbs</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={onEdit} style={styles.editButton}>
        <Ionicons name="pencil" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    flexDirection: 'row',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeGreen: {
    backgroundColor: '#d9f8e3',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeBlue: {
    backgroundColor: '#e3f0f9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeRed: {
    backgroundColor: '#f9e3e3',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontWeight: '600',
    color: '#222',
  },
  badgeTextSmall: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  editButton: {
    justifyContent: 'center',
    paddingLeft: 10,
  },
});
