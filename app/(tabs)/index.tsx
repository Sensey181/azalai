import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import exercisesData from '../assets/data/exercises.json';
import trainingPlan from '../assets/data/trainingPlan.json';
import { getSessionInfo } from '../services/sessionHelpers';

interface Session {
  day: number;
  session: number;
}

export default function TrainingScreen() {
  const router = useRouter();
  const [todaysSession, setTodaysSession] = useState<Session | null>(null);

  useFocusEffect(
    useCallback(() => {
      const findTodaysSession = () => {
        // By working with UTC dates, we eliminate timezone errors.
        const planStartDate = Date.UTC(2025, 7, 1); // August is month 7 (0-indexed)

        const today = new Date();
        const startOfTodayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

        const diffTime = startOfTodayUTC - planStartDate;

        if (diffTime < 0) {
            setTodaysSession(trainingPlan.plan[0]);
            return;
        }

        const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Calculate today's day number in the plan (1-based)
        const todaysDayInPlan = dayIndex + 1;

        // THIS IS THE FIX: Subtract 1 to get yesterday's day number
        let yesterdaysDayInPlan = todaysDayInPlan - 1;

        // Handle the edge case where today is the first day of the plan
        if (yesterdaysDayInPlan < 1) {
            yesterdaysDayInPlan = 1; // Default to showing Day 1 if there's no "yesterday"
        }

        // Loop the 28-day plan if we are past the initial cycle.
        if (yesterdaysDayInPlan > 28) {
            yesterdaysDayInPlan = ((yesterdaysDayInPlan - 1) % 28) + 1;
        }

        const sessionData = trainingPlan.plan.find(s => s.day === yesterdaysDayInPlan);
        setTodaysSession(sessionData || trainingPlan.plan[0]);
      };
      
      findTodaysSession();
    }, [])
  );

  const handleSessionPress = (session: Session) => {
    const details = getSessionInfo(session.session);
    // Ensure we don't try to get exercises for a rest day
    const sessionExercises = session.session !== 4 
      ? exercisesData.sessions[session.session as keyof typeof exercisesData.sessions]?.exercises || [] 
      : [];
      
    router.push({
      pathname: '/session/details',
      params: {
        sessionDay: session.day.toString(),
        sessionType: session.session.toString(),
        sessionName: details.text,
        exercises: JSON.stringify(sessionExercises),
      },
    });
  };

  const sessionDetails = todaysSession ? getSessionInfo(todaysSession.session) : null;
  const isRestDay = todaysSession?.session === 4;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Training</Text>
        <Text style={styles.subtitle}>Your fitness journey starts here</Text>
      </View>

      <View style={styles.section}>
        {/* Updated section title */}
        <Text style={styles.sectionTitle}>Yesterday's Session</Text>
        {isRestDay ? (
          <View style={styles.restDayBlock}>
            <Ionicons name="moon-outline" size={32} color="#6b7280" />
            <Text style={styles.restDayTitle}>Rest Day</Text>
            <Text style={styles.restDayDescription}>Recovery is key. Take it easy today!</Text>
          </View>
        ) : (
          todaysSession && sessionDetails && (
            <View style={styles.nextSessionBlock}>
              <TouchableOpacity style={styles.nextSessionContent} onPress={() => handleSessionPress(todaysSession)}>
                <View style={styles.sessionIconContainer}>
                  <Ionicons name="sparkles-outline" size={32} color="#A020F0" />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionName}>{sessionDetails.text}</Text>
                  <Text style={styles.sessionDay}>Day {todaysSession.day}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#A020F0" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.startButton} onPress={() => handleSessionPress(todaysSession)}>
                <Text style={styles.startButtonText}>View Session</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Workout Templates</Text>
        </View>
        <View style={styles.savedSessionsList}>
          {Object.entries(exercisesData.sessions).map(([key, sessionData]) => {
            const sessionKey = parseInt(key);
            // Get consistent info from the helper
            const details = getSessionInfo(sessionKey);

            return (
              <TouchableOpacity 
                key={key}
                style={styles.savedSessionItem}
                onPress={() => handleSessionPress({ day: 0, session: sessionKey })}
              >
                <View style={styles.savedSessionIcon}>
                  {/* THIS IS THE FIX: Use the correct icon from the helper */}
                  <Ionicons name={details.icon as any} size={24} color="#A020F0" />
                </View>
                <View style={styles.savedSessionInfo}>
                  {/* Use the consistent name from the helper */}
                  <Text style={styles.savedSessionName}>{details.text}</Text>
                  <Text style={styles.savedSessionDetails}>{sessionData.exercises.length} exercises</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888' },
  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: 'white', marginBottom: 16 },
  nextSessionBlock: { backgroundColor: '#1e1e1e', borderRadius: 16, padding: 20 },
  restDayBlock: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  restDayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 8,
  },
  restDayDescription: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  nextSessionContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sessionIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#2a2a2a', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  sessionInfo: { flex: 1 },
  sessionName: { fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 4 },
  sessionDay: { fontSize: 14, color: '#A020F0', marginBottom: 4 },
  startButton: { backgroundColor: '#A020F0', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  startButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  savedSessionsList: { gap: 12 },
  savedSessionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e1e', borderRadius: 12, padding: 16 },
  savedSessionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2a2a2a', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  savedSessionInfo: { flex: 1 },
  savedSessionName: { fontSize: 16, fontWeight: '600', color: 'white', marginBottom: 4 },
  savedSessionDetails: { fontSize: 14, color: '#888' },
});
