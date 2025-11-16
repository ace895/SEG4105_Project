import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getServerUrl } from "../utils/api";

interface DietaryFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updated: DietaryFormData) => void;
  initialData?: DietaryFormData;
  userEmail: string;     // ← REQUIRED FOR BACKEND
}

export interface DietaryFormData {
  height?: number;
  weight?: number;
  age?: number;
  allergies?: string;
}

export default function DietaryFormModal({ 
  visible, 
  onClose, 
  onSave, 
  initialData,
  userEmail
}: DietaryFormModalProps) {

  const [formData, setFormData] = useState<DietaryFormData>(initialData ?? {});
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof DietaryFormData, value: string) => {
    if (['height', 'weight', 'age'].includes(field)) {
      const numeric = value.replace(/[^0-9]/g, '');
      const parsed = numeric === '' ? undefined : Math.max(1, parseInt(numeric, 10));
      setFormData({ ...formData, [field]: parsed });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const baseUrl = getServerUrl();

      await fetch(`${baseUrl}/edit-dietary-info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          height: formData.height,
          weight: formData.weight,
          age: formData.age,
          allergies: formData.allergies
        })
      });

      onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to update dietary info:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalCard}>
            <Text style={styles.title}>Dietary Profile</Text>

            <Text style={styles.sectionTitle}>Height</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter in cm"
              keyboardType="numeric"
              value={formData.height?.toString() ?? ''}
              onChangeText={(v) => handleChange('height', v)}
            />

            <Text style={styles.sectionTitle}>Weight</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter in kg"
              keyboardType="numeric"
              value={formData.weight?.toString() ?? ''}
              onChangeText={(v) => handleChange('weight', v)}
            />

            <Text style={styles.sectionTitle}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your age"
              keyboardType="numeric"
              value={formData.age?.toString() ?? ''}
              onChangeText={(v) => handleChange('age', v)}
            />

            <Text style={styles.sectionTitle}>Allergies</Text>
            <TextInput
              style={styles.input}
              placeholder="List your allergies"
              value={formData.allergies ?? ''}
              onChangeText={(v) => handleChange('allergies', v)}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.save]} 
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={[styles.buttonText, { color: 'white' }]}>
                  {saving ? "Saving..." : "Save Details"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  modalContainer: {
    width: '90%',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
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
