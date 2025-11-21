import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserContextType {
  email: string | null;
  setEmail: (email: string | null) => void;
}

const UserContext = createContext<UserContextType>({
  email: null,
  setEmail: () => { },
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load email from storage on mount
  useEffect(() => {
    const loadEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("userEmail");
        if (storedEmail) {
          setEmail(storedEmail);
        }
      } catch (error) {
        console.error("Error loading email:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEmail();
  }, []);

  // Save email to storage whenever it changes
  const handleSetEmail = async (newEmail: string | null) => {
    setEmail(newEmail);
    try {
      if (newEmail) {
        await AsyncStorage.setItem("userEmail", newEmail);
      } else {
        await AsyncStorage.removeItem("userEmail");
      }
    } catch (error) {
      console.error("Error saving email:", error);
    }
  };

  return (
    <UserContext.Provider value={{ email, setEmail: handleSetEmail }}>
      {!isLoading && children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
