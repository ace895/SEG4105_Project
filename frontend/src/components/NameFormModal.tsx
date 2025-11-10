import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NameFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updated: NameFormData) => void;
  initialData?: NameFormData;
}

export interface NameFormData {
  name?: String;
}

export default function DietaryFormModal({ visible, onClose, onSave, initialData }: NameFormModalProps) {
  const [formData, setFormData] = useState<NameFormData>(initialData ?? {});

  const handleChange = (field: keyof NameFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
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
              placeholder="Enter name"
              value={formData.name?.toString() ?? ''}
              onChangeText={(v) => handleChange('name', v)}
            />


            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.save]} onPress={handleSave}>
                <Text style={[styles.buttonText, { color: 'white' }]}>Save Details</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
});
