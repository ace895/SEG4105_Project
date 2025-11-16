import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (enabled: boolean) => void;
  initialOption?: boolean; // previous notification setting
}

export default function NotificationsModal({
  visible,
  onClose,
  onSave,
  initialOption = false,
}: NotificationsModalProps) {

  const [selectedValue, setSelectedValue] = useState<boolean>(initialOption);

  const handleSave = () => {
    onSave(selectedValue);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>Enable Notifications?</Text>

          {/* Yes Option */}
          <TouchableOpacity
            style={[
              styles.optionButton,
              selectedValue === true && styles.optionSelected,
            ]}
            onPress={() => setSelectedValue(true)}
          >
            <Text
              style={[
                styles.optionText,
                selectedValue === true && styles.optionTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>

          {/* No Option */}
          <TouchableOpacity
            style={[
              styles.optionButton,
              selectedValue === false && styles.optionSelected,
            ]}
            onPress={() => setSelectedValue(false)}
          >
            <Text
              style={[
                styles.optionText,
                selectedValue === false && styles.optionTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>

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
