import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DietaryFormModal, { DietaryFormData } from '../components/DietaryFormModal';
import GoalsFormModal from '../components/GoalsFormModal';
import NameFormModal, {NameFormData} from '../components/NameFormModal';

//Mock User Model
interface User {
  name?: string;
  email: string;
  height?: number;
  weight?: number;
  age?: number;
  diet?: string;
  activity?: string;
  allergies?: string[];
  goal?: string;
}

interface ProfileProps {
  user: User;
}

export default function Profile({ user: propUser }: { user?: User }) {
  const [user, setUser] = useState<User>(
    propUser ?? 
    //Mock User for Testing
    {
    name: 'John Doe',
    email: 'john.doe@example.com',
    height: 175,
    weight: 70,
    age: 25,
    diet: 'Balanced',
    activity: 'Moderate',
    allergies: ['Peanuts', 'Dairy'],
  });

  const allergyList = user.allergies?.join(', ') || 'None';

  const [modalVisible, setModalVisible] = useState(false);

  const handleSaveDietary = (updated: DietaryFormData) => {
    // merge new data into user state
    setUser((prev) => ({
      ...prev,
      ...updated,
      allergies: updated.allergies?.split(',').map((a) => a.trim()) || [],
    }));
  };

  const [nameModalVisible, setNameModalVisible] = useState(false);

  const handleSaveName = (updated: NameFormData) => {
  setUser((prev) => ({
    ...prev,
    ...updated,
  }));
};

  const [goalModalVisible, setGoalModalVisible] = useState(false);

  const handleSaveGoal = (goal: string) => {
    setUser((prev) => ({
      ...prev,
      goal,
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      {/* User Info */}
      <View style={styles.section}>
        <View style={styles.userRow}>
          <View>
            <Text style={styles.userName}>{user.name ?? "-"}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => setNameModalVisible(true)}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>

          <NameFormModal
            visible={nameModalVisible}
            onClose={() => setNameModalVisible(false)}
            onSave={handleSaveName}           
            initialData={{ name: user.name }}
          />
        </View>
      </View>

      {/* Dietary Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Profile</Text>
        <Text style={styles.infoText}>
          Height: {user.height ?? '-'}   Weight: {user.weight ?? '-'}   Age: {user.age ?? '-'}
        </Text>
        <Text style={styles.infoText}>
          Diet: {user.diet ?? '-'}   Activity: {user.activity ?? '-'}
        </Text>
        <Text style={styles.infoText}>Allergies: {allergyList}</Text>

        <TouchableOpacity style={styles.actionButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Edit Details</Text>
        </TouchableOpacity>
        <DietaryFormModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveDietary}
          initialData={{
            height: user.height,
            weight: user.weight,
            age: user.age,
            allergies: user.allergies?.join(', '),
          }}
        />
      </View>

      {/* Goals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Goals</Text>
         <Text style={styles.infoText}>{user.goal ?? 'No goal selected'}</Text>

        <TouchableOpacity style={styles.actionButton} onPress={() => setGoalModalVisible(true)}>
          <Text style={styles.buttonText}>Add Goals</Text>
        </TouchableOpacity>

        <GoalsFormModal
          visible={goalModalVisible}
          onClose={() => setGoalModalVisible(false)}
          onSave={handleSaveGoal}
          initialGoal={user.goal}
        />
      </View>

      {/* Advanced Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advanced Settings</Text>

        <TouchableOpacity style={styles.linkRow}>
          <Text style={styles.linkText}>Notifications</Text>
          <Text style={styles.subText}>Manage reminders & meal alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow}>
          <Text style={[styles.linkText, { color: 'red' }]}>Delete Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
  flex: 1,
  backgroundColor: '#f9f9f9',
},
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    justifyContent: 'flex-start',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  userEmail: {
    color: '#777',
  },
  editButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  editText: {
    color: '#fff',
    fontWeight: '500',
  },
  infoText: {
    color: '#555',
    marginBottom: 5,
  },
  actionButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
  linkRow: {
    marginTop: 10,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500',
  },
  subText: {
    color: '#888',
    fontSize: 13,
  },
});