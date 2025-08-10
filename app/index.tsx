import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import trainingPlan from '../assets/data/trainingPlan.json';

const { width } = Dimensions.get('window');

export default function TrainingScreen() {
  const router = useRouter();
  const [nextSession, setNextSession] = useState<{ day: number; session: number } | null>(null);

  useEffect(() => {
    // Calculate next session based on training day progression
    // For now, we'll use a simple approach: start from day 1 and progress
    // In a real app, you'd store the user's current training day in AsyncStorage or similar
    
    // Get the current training day (this would come from user's progress)
    // For demo purposes, let's start from day 1
    const currentTrainingDay = 1; // This should come from user's saved progress
    
    const nextSessionData = trainingPlan.plan.find(session => session.day >= currentTrainingDay);
    setNextSession(nextSessionData || trainingPlan.plan[0]);
  }, []);

  const handleNextSessionPress = () => {
    // Navigate to session details screen
    router.push('/session/details');
  };

  const getSessionName = (sessionNumber: number) => {
    const sessionNames = {
      1: 'Strength Training',
      2: 'Cardio & HIIT',
      3: 'Flexibility & Recovery',
      4: 'Endurance Training'
    };
    return sessionNames[sessionNumber as keyof typeof sessionNames] || 'Training Session';
  };

  const getSessionIcon = (sessionNumber: number) => {
    const icons = {
      1: 'barbell-outline',
      2: 'flash-outline',
      3: 'body-outline',
      4: 'timer-outline'
    };
    return icons[sessionNumber as keyof typeof icons] || 'fitness-outline';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Training</Text>
        <Text style={styles.subtitle}>Your fitness journey starts here</Text>
      </View>

      {/* Next Session Block */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next Session</Text>
        {nextSession && (
          <TouchableOpacity style={styles.nextSessionBlock} onPress={handleNextSessionPress}>
            <View style={styles.nextSessionContent}>
              <View style={styles.sessionIconContainer}>
                <Ionicons 
                  name={getSessionIcon(nextSession.session) as any} 
                  size={32} 
                  color="#A020F0" 
                />
              </View>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionName}>{getSessionName(nextSession.session)}</Text>
                <Text style={styles.sessionDay}>Day {nextSession.day}</Text>
                <Text style={styles.sessionDescription}>
                  Ready to crush your next workout? Tap to start your session.
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={24} color="#A020F0" />
              </View>
            </View>
            <View style={styles.startButton}>
              <Text style={styles.startButtonText}>Start Session</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Saved Sessions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved Sessions</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => console.log('Create new session')}>
            <Ionicons name="add" size={20} color="#A020F0" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
        
        {/* Sample saved sessions - in a real app, these would come from user's saved sessions */}
        <View style={styles.savedSessionsList}>
          <TouchableOpacity 
            style={styles.savedSessionItem}
            onPress={() => router.push('/session/details')}
          >
            <View style={styles.savedSessionIcon}>
              <Ionicons name="barbell-outline" size={24} color="#A020F0" />
            </View>
            <View style={styles.savedSessionInfo}>
              <Text style={styles.savedSessionName}>My Custom Strength</Text>
              <Text style={styles.savedSessionDetails}>45 min • 8 exercises</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.savedSessionItem}
            onPress={() => router.push('/session/details')}
          >
            <View style={styles.savedSessionIcon}>
              <Ionicons name="flash-outline" size={24} color="#A020F0" />
            </View>
            <View style={styles.savedSessionInfo}>
              <Text style={styles.savedSessionName}>Quick HIIT</Text>
              <Text style={styles.savedSessionDetails}>20 min • 6 exercises</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.savedSessionItem}
            onPress={() => router.push('/session/details')}
          >
            <View style={styles.savedSessionIcon}>
              <Ionicons name="body-outline" size={24} color="#A020F0" />
            </View>
            <View style={styles.savedSessionInfo}>
              <Text style={styles.savedSessionName}>Morning Stretch</Text>
              <Text style={styles.savedSessionDetails}>15 min • 5 exercises</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        </View>
        
        {/* Empty state for when no saved sessions exist */}
        {/* <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={48} color="#666" />
          <Text style={styles.emptyStateText}>No saved sessions yet</Text>
          <Text style={styles.emptyStateSubtext}>Create your first custom workout</Text>
        </View> */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  nextSessionBlock: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  nextSessionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  sessionDay: {
    fontSize: 14,
    color: '#A020F0',
    marginBottom: 4,
  },
  sessionDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  arrowContainer: {
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#A020F0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#A020F0',
  },
  createButtonText: {
    color: '#A020F0',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  savedSessionsList: {
    gap: 12,
  },
  savedSessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  savedSessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  savedSessionInfo: {
    flex: 1,
  },
  savedSessionName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  savedSessionDetails: {
    fontSize: 14,
    color: '#888',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});