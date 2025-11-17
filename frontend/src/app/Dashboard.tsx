import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Calendar } from 'react-native-calendars';

interface MacroData {
  name: string;
  color: string;
  percentage: number;
  current: number;
  goal: number;
}

interface DailyData {
  totalCalories: number;
  macros: MacroData[];
}

const mockBackendData: { [key: string]: { [key: number]: DailyData } } = {
  'This Week': {
    3: {
      totalCalories: 1800,
      macros: [
        { name: 'Calories', color: '#4ADE80', percentage: 72, current: 1800, goal: 2500 },
        { name: 'Proteins', color: '#3B82F6', percentage: 65, current: 98, goal: 150 },
        { name: 'Carbs', color: '#FB923C', percentage: 80, current: 240, goal: 300 },
        { name: 'Fats', color: '#F87171', percentage: 58, current: 52, goal: 90 },
      ],
    },
    4: {
      totalCalories: 2100,
      macros: [
        { name: 'Calories', color: '#4ADE80', percentage: 84, current: 2100, goal: 2500 },
        { name: 'Proteins', color: '#3B82F6', percentage: 73, current: 110, goal: 150 },
        { name: 'Carbs', color: '#FB923C', percentage: 85, current: 255, goal: 300 },
        { name: 'Fats', color: '#F87171', percentage: 67, current: 60, goal: 90 },
      ],
    },
    5: {
      totalCalories: 1950,
      macros: [
        { name: 'Calories', color: '#4ADE80', percentage: 78, current: 1950, goal: 2500 },
        { name: 'Proteins', color: '#3B82F6', percentage: 70, current: 105, goal: 150 },
        { name: 'Carbs', color: '#FB923C', percentage: 75, current: 225, goal: 300 },
        { name: 'Fats', color: '#F87171', percentage: 62, current: 56, goal: 90 },
      ],
    },
    6: {
      totalCalories: 1200,
      macros: [
        { name: 'Calories', color: '#4ADE80', percentage: 48, current: 1200, goal: 2500 },
        { name: 'Proteins', color: '#3B82F6', percentage: 40, current: 60, goal: 150 },
        { name: 'Carbs', color: '#FB923C', percentage: 55, current: 165, goal: 300 },
        { name: 'Fats', color: '#F87171', percentage: 44, current: 40, goal: 90 },
      ],
    },
    7: {
      totalCalories: 2300,
      macros: [
        { name: 'Calories', color: '#4ADE80', percentage: 92, current: 2300, goal: 2500 },
        { name: 'Proteins', color: '#3B82F6', percentage: 87, current: 130, goal: 150 },
        { name: 'Carbs', color: '#FB923C', percentage: 90, current: 270, goal: 300 },
        { name: 'Fats', color: '#F87171', percentage: 78, current: 70, goal: 90 },
      ],
    },
    8: {
      totalCalories: 2050,
      macros: [
        { name: 'Calories', color: '#4ADE80', percentage: 82, current: 2050, goal: 2500 },
        { name: 'Proteins', color: '#3B82F6', percentage: 75, current: 112, goal: 150 },
        { name: 'Carbs', color: '#FB923C', percentage: 83, current: 250, goal: 300 },
        { name: 'Fats', color: '#F87171', percentage: 70, current: 63, goal: 90 },
      ],
    },
    9: {
      totalCalories: 1650,
      macros: [
        { name: 'Calories', color: '#4ADE80', percentage: 66, current: 1650, goal: 2500 },
        { name: 'Proteins', color: '#3B82F6', percentage: 60, current: 90, goal: 150 },
        { name: 'Carbs', color: '#FB923C', percentage: 68, current: 205, goal: 300 },
        { name: 'Fats', color: '#F87171', percentage: 53, current: 48, goal: 90 },
      ],
    },
  },
  'Last Week': {
    3: {
      totalCalories: 2200,
      macros: [
        { name: 'Calories', color: '#4ADE80', percentage: 88, current: 2200, goal: 2500 },
        { name: 'Proteins', color: '#3B82F6', percentage: 80, current: 120, goal: 150 },
        { name: 'Carbs', color: '#FB923C', percentage: 87, current: 260, goal: 300 },
        { name: 'Fats', color: '#F87171', percentage: 72, current: 65, goal: 90 },
      ],
    },
    4: {
      totalCalories: 1900,
      macros: [
        { name: 'Calories', color: '#4ADE80', percentage: 76, current: 1900, goal: 2500 },
        { name: 'Proteins', color: '#3B82F6', percentage: 68, current: 102, goal: 150 },
        { name: 'Carbs', color: '#FB923C', percentage: 78, current: 235, goal: 300 },
        { name: 'Fats', color: '#F87171', percentage: 64, current: 58, goal: 90 },
      ],
    },
    5: {
      totalCalories: 2400,
      macros: [
        { name: 'Calories', color: '#4ADE80', percentage: 96, current: 2400, goal: 2500 },
        { name: 'Proteins', color: '#3B82F6', percentage: 90, current: 135, goal: 150 },
        { name: 'Carbs', color: '#FB923C', percentage: 93, current: 280, goal: 300 },
        { name: 'Fats', color: '#F87171', percentage: 82, current: 74, goal: 90 },
      ],
    },
    6: {
      totalCalories: 1750,
      macros: [
        { name: 'Calories', color: '#4ADE80', percentage: 70, current: 1750, goal: 2500 },
        { name: 'Proteins', color: '#3B82F6', percentage: 63, current: 95, goal: 150 },
        { name: 'Carbs', color: '#FB923C', percentage: 72, current: 215, goal: 300 },
        { name: 'Fats', color: '#F87171', percentage: 60, current: 54, goal: 90 },
      ],
    },
    7: {
      totalCalories: 2150,
      macros: [
        { name: 'Calories', color: '#4ADE80', percentage: 86, current: 2150, goal: 2500 },
        { name: 'Proteins', color: '#3B82F6', percentage: 77, current: 115, goal: 150 },
        { name: 'Carbs', color: '#FB923C', percentage: 82, current: 245, goal: 300 },
        { name: 'Fats', color: '#F87171', percentage: 69, current: 62, goal: 90 },
      ],
    },
    8: {
      totalCalories: 1850,
      macros: [
        { name: 'Calories', color: '#4ADE80', percentage: 74, current: 1850, goal: 2500 },
        { name: 'Proteins', color: '#3B82F6', percentage: 66, current: 99, goal: 150 },
        { name: 'Carbs', color: '#FB923C', percentage: 76, current: 228, goal: 300 },
        { name: 'Fats', color: '#F87171', percentage: 63, current: 57, goal: 90 },
      ],
    },
    9: {
      totalCalories: 2050,
      macros: [
        { name: 'Calories', color: '#4ADE80', percentage: 82, current: 2050, goal: 2500 },
        { name: 'Proteins', color: '#3B82F6', percentage: 74, current: 111, goal: 150 },
        { name: 'Carbs', color: '#FB923C', percentage: 80, current: 240, goal: 300 },
        { name: 'Fats', color: '#F87171', percentage: 68, current: 61, goal: 90 },
      ],
    },
  },
};

const fetchDailyData = async (week: string, date: number): Promise<DailyData> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const weekData = mockBackendData[week] || mockBackendData['This Week'];
  return weekData[date] || weekData[6];
};




export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPickerModal, setShowPickerModal] = useState(false);
  
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  const getWeekDatesAroundSelected = (centerDate: Date) => {
    const weekDates = [];
    
    for (let i = -3; i <= 3; i++) {
      const date = new Date(centerDate);
      date.setDate(centerDate.getDate() + i);
      weekDates.push({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        date: date.getDate(),
        fullDate: date,
        month: date.getMonth(),
        year: date.getFullYear()
      });
    }
    return weekDates;
  };
  
  const weekDays = getWeekDatesAroundSelected(selectedDate);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchDailyData('This Week', selectedDate.getDate());
      setDailyData(data);
      setLoading(false);
    };
    loadData();
  }, [selectedDate]);


  //Camera
   const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      alert("Camera permission is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      router.push({
        pathname: "/reviewMeal",
        params: { imageUri: result.assets[0].uri }
      });
    }
  };

  //Gallery

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      router.push({
        pathname: "/reviewMeal",
        params: { imageUri: result.assets[0].uri }
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowMenu(true)}>
            <Ionicons name="menu" size={28} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Ionicons name="person-circle-outline" size={36} color="#333" />
          </TouchableOpacity>
        </View>

        <Modal
          visible={showMenu}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableOpacity 
            style={styles.menuOverlay} 
            activeOpacity={1} 
            onPress={() => setShowMenu(false)}
          >
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menu</Text>
                <TouchableOpacity onPress={() => setShowMenu(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  router.push("/dashboard");
                }}
              >
                <Ionicons name="home-outline" size={24} color="#333" />
                <Text style={styles.menuItemText}>Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  router.push("/profile");
                }}
              >
                <Ionicons name="person-outline" size={24} color="#333" />
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  router.push("/recommendations");
                }}
              >
                <Ionicons name="restaurant-outline" size={24} color="#333" />
                <Text style={styles.menuItemText}>Recommendations</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  router.push("/historical-meals");
                }}
              >
                <Ionicons name="time-outline" size={24} color="#333" />
                <Text style={styles.menuItemText}>Meal History</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <Text style={styles.greeting}>Hello, User!</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={{ marginVertical: 40 }} />
        ) : (
          <>
            <View style={styles.calorieCard}>
              <Text style={styles.calorieLabel}>You logged</Text>
              <Text style={styles.calorieValue}>{dailyData?.totalCalories || 0}</Text>
              <Text style={styles.calorieSubtext}>Calories today</Text>
            </View>

            <TouchableOpacity style={styles.addMealButton} onPress={() => setShowPickerModal(true)}>
              <Text style={styles.addMealText}>Add a Meal</Text>
            </TouchableOpacity>

            <View style={styles.weekSection}>
              <TouchableOpacity 
                style={styles.dateHeader}
                onPress={() => setShowCalendar(!showCalendar)}
              >
                <View style={styles.dateHeaderContent}>
                  <Ionicons name="calendar-outline" size={20} color="#333" style={styles.calendarIcon} />
                  <Text style={styles.dateTitle}>{formatDate(selectedDate)}</Text>
                </View>
                <Ionicons name={showCalendar ? "chevron-up" : "chevron-down"} size={20} color="#333" />
              </TouchableOpacity>
          
          {showCalendar && (
            <View style={styles.calendarContainer}>
              <Calendar
                current={selectedDate.toISOString().split('T')[0]}
                maxDate={new Date().toISOString().split('T')[0]}
                onDayPress={(day: any) => {
                  const newDate = new Date(day.year, day.month - 1, day.day);
                  setSelectedDate(newDate);
                  setShowCalendar(false);
                }}
                markedDates={{
                  [selectedDate.toISOString().split('T')[0]]: {
                    selected: true,
                    selectedColor: '#3B82F6'
                  }
                }}
                theme={{
                  todayTextColor: '#3B82F6',
                  selectedDayBackgroundColor: '#3B82F6',
                  selectedDayTextColor: '#ffffff',
                  arrowColor: '#3B82F6',
                }}
              />
            </View>
          )}
          
          <View style={styles.weekDays}>
            {weekDays.map((item, index) => {
              const isSelected = item.fullDate.toDateString() === selectedDate.toDateString();
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.dayItem}
                  onPress={() => setSelectedDate(item.fullDate)}
                >
                  <Text style={styles.dayText}>{item.day}</Text>
                  <Text style={[
                    styles.dateText, 
                    isSelected && styles.activeDate
                  ]}>
                    {item.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.reviewMealsButton}>
            <Text style={styles.reviewMealsText}>Review Meals</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.macroSection}>
          <View style={styles.macroHeader}>
            <Text style={styles.macroTitle}>Today's Macros</Text>
          </View>

          {dailyData?.macros.map((macro, index) => (
            <View key={index} style={styles.macroItem}>
              <Text style={styles.macroName}>{macro.name}</Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${macro.percentage}%`, backgroundColor: macro.color },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.trackMessage}>
          <Text style={styles.trackText}>You're on track, keep going!</Text>
          <Ionicons name="checkmark-circle" size={24} color="#4ADE80" />
        </View>

        <TouchableOpacity style={styles.recommendationsButton}>
          <Text style={styles.recommendationsText}>Recipe Recommendations</Text>
        </TouchableOpacity>
          </>
        )}
      </ScrollView>

      
      <Modal visible={showPickerModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Meal From</Text>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setShowPickerModal(false);
                openCamera();
              }}
            >
              <Text style={styles.modalText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setShowPickerModal(false);
                openGallery();
              }}
            >
              <Text style={styles.modalText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, styles.cancelBtn]}
              onPress={() => setShowPickerModal(false)}
            >
              <Text style={[styles.modalText, { color: "red" }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  calorieCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieLabel: {
    fontSize: 16,
    color: '#999',
    marginBottom: 5,
  },
  calorieValue: {
    fontSize: 64,
    fontWeight: '700',
    color: '#333',
  },
  calorieSubtext: {
    fontSize: 18,
    color: '#999',
    marginTop: -5,
  },
  addMealButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  addMealText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  reviewMealsButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  reviewMealsText: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: '600',
  },
  weekSection: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 8,
  },
  dateHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  calendarIcon: {
    marginRight: 8,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dayItem: {
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activeDate: {
    fontWeight: '700',
    fontSize: 18,
  },
  macroSection: {
    marginBottom: 20,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  macroTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  macroItem: {
    marginBottom: 15,
  },
  macroName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  trackMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  trackText: {
    fontSize: 18,
    fontWeight: '500',
    marginRight: 8,
  },
  recommendationsButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  recommendationsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "80%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
  },
  modalBtn: {
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "500",
  },
  cancelBtn: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContent: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    minHeight: 400,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  menuTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  menuItemText: {
    fontSize: 18,
    marginLeft: 16,
    color: '#1C1C1E',
  },
});
