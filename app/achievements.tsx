import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import historyData from '../assets/data/workoutHistory.json';

// We can reuse the session info helper from the planning screen
const getSessionInfo = (session: number) => {
  switch (session) {
    case 1:
      return { text: 'Beast mode', icon: 'barbell', color: '#3b82f6' };
    case 2:
      return { text: 'Medium', icon: 'heart', color: '#22c55e' };
    case 3:
      return { text: 'Easy', icon: 'school', color: '#f97316' };
    default:
      return { text: 'Unknown Session', icon: 'help', color: '#6b7280' };
  }
};

interface HistoryItem {
  date: string;
  session: number;
  durationMinutes: number;
  personalBest: boolean;
}

// A small component for each summary statistic
const SummaryStat = ({ icon, value, label }: { icon: any; value: string | number; label: string }) => (
  <View style={styles.statBox}>
    <Ionicons name={icon} size={28} color="#A020F0" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function AchievementsScreen() {
  // Calculate summary stats using useMemo for efficiency
  const summary = useMemo(() => {
    const totalWorkouts = historyData.history.length;
    const totalMinutes = historyData.history.reduce((sum, item) => sum + item.durationMinutes, 0);
    const personalBests = historyData.history.filter(item => item.personalBest).length;
    return { totalWorkouts, totalMinutes, personalBests };
  }, []);

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    const sessionInfo = getSessionInfo(item.session);
    const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <View style={styles.historyItem}>
        <View style={[styles.iconContainer, { backgroundColor: sessionInfo.color }]}>
          <Ionicons name={sessionInfo.icon as any} size={24} color="white" />
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.sessionTitle}>{sessionInfo.text}</Text>
          <Text style={styles.sessionDate}>{formattedDate}</Text>
        </View>
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>{item.durationMinutes} min</Text>
          {item.personalBest && (
            <View style={styles.pbContainer}>
              <Ionicons name="star" size={14} color="#facc15" />
              <Text style={styles.pbText}>PB</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Achievements</Text>
      
      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <SummaryStat icon="barbell-outline" value={summary.totalWorkouts} label="Workouts" />
        <SummaryStat icon="time-outline" value={`${Math.floor(summary.totalMinutes / 60)}h ${summary.totalMinutes % 60}m`} label="Total Time" />
        <SummaryStat icon="star-outline" value={summary.personalBests} label="Personal Bests" />
      </View>

      {/* History List */}
      <Text style={styles.historyTitle}>Workout History</Text>
      <FlatList
        data={historyData.history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.date}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    paddingVertical: 20,
    marginBottom: 30,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  historyTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailsContainer: {
    flex: 1,
  },
  sessionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDate: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  durationContainer: {
    alignItems: 'flex-end',
  },
  durationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginTop: 4,
  },
  pbText: {
    color: '#facc15',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});
