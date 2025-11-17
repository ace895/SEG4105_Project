import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getServerUrl } from "../utils/api";
import { router } from "expo-router";

import DietaryFormModal, { DietaryFormData } from "../components/DietaryFormModal";
import GoalsFormModal from "../components/GoalsFormModal";
import NameFormModal, { NameFormData } from "../components/NameFormModal";
import NotificationsModal from "../components/NotificationModal";
import DeleteDataModal from "../components/DeleteDataModal";
import { useUser } from "../context/UserContext";

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
  notifications_on: boolean;
}

export default function Profile() {
  const { email: userEmail } = useUser();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // ---------------------- FETCH PROFILE ----------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const baseUrl = getServerUrl();
        const res = await fetch(`${baseUrl}/get-profile?email=${userEmail}`);

        if (!res.ok) throw new Error("Failed to load profile");

        const data = await res.json();
        setUser({
          ...data,
          email: userEmail,
          allergies: typeof data.allergies === "string"
            ? data.allergies.split(",").map((a: string) => a.trim())
            : data.allergies ?? [],
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const allergyList = user.allergies?.join(", ") || "None";

  const handleSaveNotif = async (enabled: boolean) => {
    try {
      const baseUrl = getServerUrl();

      await fetch(`${baseUrl}/toggle-notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, enabled }),
      });

      setUser(prev => ({ ...prev!, notifications_on: enabled }));
    } catch (err) {
      console.error("Failed to update notifications:", err);
    }
  };

  const handleSaveDietary = (updated: DietaryFormData) => {
    setUser(prev => ({
      ...prev!,
      ...updated,
      allergies: updated.allergies?.split(",").map(a => a.trim()) || [],
    }));
  };

  const handleSaveName = (updated: NameFormData) =>
    setUser(prev => ({ ...prev!, ...updated }));

  const handleSaveGoal = async (goal: string) => {
    try {
      const baseUrl = getServerUrl();

      await fetch(`${baseUrl}/edit-goal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, goal }),
      });

      setUser(prev => ({ ...prev!, goal }));
    } catch (err) {
      console.error("Failed to update goal:", err);
    }
  };

  const handleConfirmDelete = () => {
    console.log("Deleting user data…");
    setDeleteModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/dashboard")}
        >
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
        {/* ---------------- */}

        {/* USER INFO */}
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

        {/* DIETARY PROFILE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Profile</Text>
          <Text style={styles.infoText}>
            Height: {user.height ?? "-"}cm   Weight: {user.weight ?? "-"}kg   Age: {user.age ?? "-"}
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
              allergies: user.allergies?.join(", "),
            }}
            userEmail={user.email}
          />
        </View>

        {/* GOALS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goals</Text>
          <Text style={styles.infoText}>{user.goal ?? "No goal selected"}</Text>

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

        {/* ADVANCED SETTINGS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Settings</Text>

          <TouchableOpacity style={styles.linkRow} onPress={() => setNotifModalVisible(true)}>
            <Text style={styles.linkText}>Notifications</Text>
            <Text style={styles.subText}>Manage reminders & meal alerts</Text>
          </TouchableOpacity>

          <NotificationsModal
            visible={notifModalVisible}
            onClose={() => setNotifModalVisible(false)}
            onSave={handleSaveNotif}
            initialOption={user.notifications_on}
          />

          <TouchableOpacity style={styles.linkRow} onPress={() => setDeleteModalVisible(true)}>
            <Text style={[styles.linkText, { color: "red" }]}>Delete Data</Text>
          </TouchableOpacity>

          <DeleteDataModal
            visible={deleteModalVisible}
            onClose={() => setDeleteModalVisible(false)}
            onConfirm={handleConfirmDelete}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
  },
  userEmail: {
    color: "#777",
  },
  editButton: {
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  editText: {
    color: "#fff",
    fontWeight: "500",
  },
  infoText: {
    color: "#555",
    marginBottom: 5,
  },
  actionButton: {
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
  linkRow: {
    marginTop: 10,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "500",
  },
  subText: {
    color: "#888",
    fontSize: 13,
  },
});
