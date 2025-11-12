import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export interface Meal {
  name: string;
  calories: number;
  weight: number;
  proteins: number;
  fats: number;
  carbs: number;
  time: string;
  imageUri?: string;
}

interface MealCardProps {
  meal: Meal;
}

export default function MealCard({ meal }: MealCardProps) {
  return (
    <View style={styles.card}>
      {/* Left side: Image and text */}
      <View style={styles.leftSection}>
        {meal.imageUri ? (
          <Image source={{ uri: meal.imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{meal.name}</Text>
          <Text style={styles.time}>{meal.time}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.badgeGreen}>
              <Text style={styles.badgeText}>{meal.calories} cal</Text>
            </View>

            <View style={styles.badgeBlue}>
              <Text style={styles.badgeText}>{meal.weight}g</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Right side: Macronutrients */}
      <View style={styles.rightSection}>
        <Text style={styles.macroText}>
          <Text style={styles.bold}>{meal.proteins}g proteins</Text>
        </Text>
        <Text style={styles.macroText}>
          <Text style={styles.bold}>{meal.fats}g fats</Text>
        </Text>
        <Text style={styles.macroText}>
          <Text style={styles.bold}>{meal.carbs}g carbs</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
  },
  placeholder: {
    backgroundColor: '#eee',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 13,
    color: '#777',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badgeGreen: {
    backgroundColor: '#d9f8e3',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  badgeBlue: {
    backgroundColor: '#e3f0f9',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  badgeText: {
    fontWeight: '600',
    color: '#222',
    fontSize: 13,
  },
  rightSection: {
    backgroundColor: '#f9e3e3',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  macroText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '600',
  },
});
