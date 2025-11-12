import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Recommendation {
  name: string;
  description: string;
  calorie: number;
  protein: number;
  fat: number;
  carb: number;
  type: string;
  image_url: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onPress?: () => void;
}

export default function RecommendationCard({ recommendation, onPress }: RecommendationCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: recommendation.image_url }} style={styles.image} />

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{recommendation.name}</Text>
          <Text style={styles.nutrition}>
            {recommendation.calorie} cal, {recommendation.protein}P/{recommendation.carb}C/{recommendation.fat}F
          </Text>
        </View>

        <Text style={styles.description}>{recommendation.description}</Text>

        <View style={styles.footerRow}>
          <Ionicons
            name={recommendation.type === 'Salad' ? 'leaf' : 'barbell'}
            size={18}
            color={recommendation.type === 'Salad' ? 'green' : 'orange'}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.type}>{recommendation.type}</Text>

          <View style={{ flex: 1 }} />
          <Ionicons name="chevron-forward" size={20} color="#555" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  image: {
    width: '100%',
    height: 150,
  },
  infoContainer: {
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  nutrition: {
    fontSize: 13,
    color: '#555',
  },
  description: {
    color: '#666',
    marginVertical: 4,
    fontSize: 13,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  type: {
    fontSize: 13,
    color: '#333',
  },
});
