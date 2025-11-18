import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getServerUrl } from '../utils/api';  //IP helper for expo go
import RecommendationCard, { Recommendation } from '../components/RecommendationCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import { router } from 'expo-router';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { email: userEmail } = useUser();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const baseUrl = getServerUrl();
        const response = await fetch(`${baseUrl}/get-recommendations?email=${userEmail}`); 

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setRecommendations(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push("/dashboard")}
              >
                <Text style={styles.backButtonText}>Back to Dashboard</Text>
              </TouchableOpacity>


      <Text style={styles.title}>Recommendations</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 30 }} />
      ) : recommendations.length > 0 ? (
        recommendations.map((item, i) => (
          <RecommendationCard
            key={i}
            recommendation={item}
            onPress={() => console.log('Clicked:', item.name)} //Need to add link here
          />
        ))
      ) : (
        <Text style={styles.emptyText}>No recommendations available.</Text>
      )}
    </ScrollView>
    </SafeAreaView>
  );
  
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
  },
   safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
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
