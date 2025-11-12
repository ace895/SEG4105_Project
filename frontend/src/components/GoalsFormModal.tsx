import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GoalsFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (goal: string) => void;
  initialGoal?: string;
}

export default function GoalsFormModal({
  visible,
  onClose,
  onSave,
  initialGoal,
}: GoalsFormModalProps) {
  const [selectedGoal, setSelectedGoal] = useState<string>(initialGoal ?? '');

  const handleSelect = (goal: string) => {
    setSelectedGoal(goal);
  };

  const handleSave = () => {
    if (selectedGoal) {
      onSave(selectedGoal);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>Select Your Goal</Text>

          {/* Goal Options */}
          {['Muscle Gain', 'Weight Loss'].map((goal) => (
            <TouchableOpacity
              key={goal}
              style={[
                styles.optionButton,
                selectedGoal === goal && styles.optionSelected,
              ]}
              onPress={() => handleSelect(goal)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedGoal === goal && styles.optionTextSelected,
                ]}
              >
                {goal}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.save]} onPress={handleSave}>
              <Text style={[styles.buttonText, { color: 'white' }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 6,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  cancel: {
    backgroundColor: '#eee',
    marginRight: 10,
  },
  save: {
    backgroundColor: '#333',
  },
  buttonText: {
    fontWeight: '600',
  },
});
