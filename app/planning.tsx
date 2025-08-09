import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Import the router
import React, { useEffect, useMemo, useState } from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import planData from '../assets/data/trainingPlan.json';

// Define the structure of a single day in our plan
interface DayPlan {
  date: Date;
  session: number;
}

// Helper function to get display properties for each session type
const getSessionInfo = (session: number) => {
  switch (session) {
    case 1:
      return { text: 'Strength & Power', shortText: 'S1', color: '#3b82f6', icon: 'barbell' };
    case 2:
      return { text: 'Cardio & Endurance', shortText: 'S2', color: '#22c55e', icon: 'heart' };
    case 3:
      return { text: 'Technique & Skills', shortText: 'S3', color: '#f97316', icon: 'school' };
    case 4:
      return { text: 'Rest Day', shortText: 'R', color: '#6b7280', icon: 'moon' };
    default:
      return { text: '', shortText: '', color: 'transparent', icon: 'help' };
  }
};

// Component for the big display box at the top
const DayDetailHeader = ({ day }: { day: DayPlan | null }) => {
  if (!day) {
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Select a day</Text>
      </View>
    );
  }

  const sessionInfo = getSessionInfo(day.session);
  const formattedDate = day.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={[styles.headerContainer, { borderColor: sessionInfo.color }]}>
      <View style={styles.headerDateContainer}>
        <Text style={styles.headerDateText}>{formattedDate}</Text>
      </View>
      <View style={styles.headerSessionContainer}>
        <Ionicons name={sessionInfo.icon as any} size={40} color={sessionInfo.color} />
        <Text style={[styles.headerSessionText, { color: sessionInfo.color }]}>
          {sessionInfo.text}
        </Text>
      </View>
    </View>
  );
};

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const { width } = Dimensions.get('window');
const CONTAINER_HORIZONTAL_PADDING = 40;
const CELL_GAP = 6;
const CELL_SIZE = Math.floor((width - CONTAINER_HORIZONTAL_PADDING - (CELL_GAP * 6)) / 7);

export default function PlanningScreen() {
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null);
  const router = useRouter(); // Initialize the router to navigate
  const isRestDay = selectedDay?.session === 4;

  const calendarData = useMemo(() => {
    const today = new Date();
    const firstDayOfWeek = today.getDay();
    const paddingDays = Array(firstDayOfWeek).fill(null);
    const upcomingDays = planData.plan.map((dayPlan, index) => {
      const date = new Date();
      date.setDate(new Date().getDate() + index);
      return {
        date,
        session: dayPlan.session,
      };
    });
    return [...paddingDays, ...upcomingDays];
  }, []);
  
  useEffect(() => {
    const todayString = new Date().toDateString();
    const todayPlan = calendarData.find(
      (day) => day && day.date.toDateString() === todayString
    );
    if (todayPlan) {
      setSelectedDay(todayPlan);
    }
  }, [calendarData]);

  const renderDay = ({ item }: { item: DayPlan | null }) => {
    if (!item) {
      return <View style={styles.dayCellEmpty} />;
    }

    const sessionInfo = getSessionInfo(item.session);
    const isToday = new Date().toDateString() === item.date.toDateString();
    const isSelected = selectedDay?.date.toDateString() === item.date.toDateString();

    return (
      <TouchableOpacity onPress={() => setSelectedDay(item)}>
        <View style={[
          styles.dayCell,
          isToday && styles.todayCell,
          isSelected && styles.selectedCell,
        ]}>
          <Text style={[
            styles.dayNumber,
            isToday && styles.todayNumber,
            isSelected && styles.selectedNumber,
          ]}>
            {item.date.getDate()}
          </Text>
          <Text style={[styles.sessionText, { color: sessionInfo.color }]}>
            {sessionInfo.shortText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <DayDetailHeader day={selectedDay} />
      <View>
        <View style={styles.weekHeader}>
          {WEEK_DAYS.map(day => (
            <Text key={day} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>
        <FlatList
          data={calendarData}
          renderItem={renderDay}
          keyExtractor={(item, index) => index.toString()}
          numColumns={7}
          extraData={selectedDay}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          ItemSeparatorComponent={() => <View style={{ height: CELL_GAP }} />}
        />
      </View>

      {/* --- BUTTON CONTAINER --- */}
      <View style={styles.buttonContainer}>
        {selectedDay && (
          <TouchableOpacity
            style={[styles.startButton, isRestDay && styles.startButtonDisabled]}
            onPress={() => !isRestDay && router.push('/')}
            disabled={isRestDay}
          >
            <Text style={styles.startButtonText}>
              {isRestDay ? "Enjoy Your Rest" : "Start Workout"}
            </Text>
            <Ionicons 
              name={isRestDay ? "moon-outline" : "arrow-forward-circle-outline"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        )}
      </View>
      {/* ----------------------- */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
    paddingHorizontal: CONTAINER_HORIZONTAL_PADDING / 2,
  },
  headerContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  headerDateContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 10,
    marginBottom: 15,
  },
  headerDateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSessionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSessionText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekDayText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    width: CELL_SIZE,
    textAlign: 'center',
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellEmpty: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  todayCell: {
    borderColor: '#A020F0',
    borderWidth: 1,
  },
  selectedCell: {
    backgroundColor: '#A020F0',
  },
  dayNumber: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '500',
  },
  todayNumber: {
    color: '#A020F0',
    fontWeight: 'bold',
  },
  selectedNumber: {
    color: 'white',
    fontWeight: 'bold',
  },
  sessionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // New and updated styles
  buttonContainer: {
    flex: 1, // This makes the container take up all available vertical space
    justifyContent: 'center', // This centers the button vertically within the container
    paddingBottom: 20, // Add some padding from the absolute bottom
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A020F0',
    paddingVertical: 15,
    borderRadius: 15,
    // Removed margin, as spacing is handled by the container
  },
  startButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});
