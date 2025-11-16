import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export interface Ingredient {
  name: string;
  calories: number;
  weight: number;
  proteins: number;
  fats: number;
  carbs: number;
}

interface IngredientEditModalProps {
  visible: boolean;
  onClose: () => void;
  ingredient: Ingredient;
  onSave: (updated: Ingredient) => void;
}

export default function IngredientEditModal({
  visible,
  onClose,
  ingredient,
  onSave,
}: IngredientEditModalProps) {
  const [form, setForm] = useState<Ingredient>(ingredient);

  const update = (field: keyof Ingredient, value: string) => {
    setForm({
      ...form,
      [field]: field === "name" ? value : Number(value),
    });
  };

  const fields: (keyof Ingredient)[] = [
    "name",
    "calories",
    "weight",
    "proteins",
    "fats",
    "carbs",
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Edit Ingredient</Text>

          {fields.map((field) => (
            <View key={field} style={styles.fieldContainer}>
              <Text style={styles.labelText}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </Text>

              <TextInput
                style={styles.input}
                placeholder={field}
                value={String(form[field])}
                onChangeText={(v) => update(field, v)}
                keyboardType={field === "name" ? "default" : "numeric"}
              />
            </View>
          ))}

          <View style={styles.row}>
            <TouchableOpacity onPress={onClose} style={styles.cancel}>
              <Text>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onSave(form);
                onClose();
              }}
              style={styles.save}
            >
              <Text style={{ color: "white" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    width: "85%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },

  fieldContainer: {
    marginBottom: 12,
  },

  labelText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
    marginLeft: 2,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },

  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 12,
  },
  cancel: { padding: 10 },
  save: { padding: 10, backgroundColor: "#333", borderRadius: 8 },
});
