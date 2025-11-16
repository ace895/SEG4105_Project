import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ingredient } from "./IngredientCard"; 

interface AddIngredientModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (ingredient: Ingredient) => void;
}

export default function AddIngredientModal({
  visible,
  onClose,
  onSave,
}: AddIngredientModalProps) {
  const [form, setForm] = useState<Ingredient>({
    name: "",
    calories: 0,
    weight: 0,
    proteins: 0,
    fats: 0,
    carbs: 0,
  });

  const fields: { key: keyof Ingredient; label: string; numeric?: boolean }[] = [
    { key: "name", label: "Ingredient Name" },
    { key: "calories", label: "Calories", numeric: true },
    { key: "weight", label: "Weight (g)", numeric: true },
    { key: "proteins", label: "Proteins (g)", numeric: true },
    { key: "fats", label: "Fats (g)", numeric: true },
    { key: "carbs", label: "Carbs (g)", numeric: true },
  ];

  const update = (key: keyof Ingredient, value: string) => {
    setForm({
      ...form,
      [key]: key === "name" ? value : Number(value),
    });
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave(form);
    onClose();
    setForm({
      name: "",
      calories: 0,
      weight: 0,
      proteins: 0,
      fats: 0,
      carbs: 0,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Add Ingredient</Text>

          {fields.map(({ key, label, numeric }) => (
            <View key={key} style={{ marginBottom: 12 }}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={label}
                value={String(form[key] ?? "")}
                onChangeText={(v) => update(key, v)}
                keyboardType={numeric ? "numeric" : "default"}
              />
            </View>
          ))}

          <View style={styles.row}>
            <TouchableOpacity onPress={onClose} style={styles.cancel}>
              <Text>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave} style={styles.save}>
              <Text style={{ color: "white" }}>Add</Text>
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
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: "#444",
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
