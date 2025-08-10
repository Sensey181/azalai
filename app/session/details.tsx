import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface Exercise {
  name: string;
  details: string;
}

export default function SessionDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Safely parse the data passed from the previous screen with defaults
  const sessionName = params.sessionName as string || 'Workout';
  const exercises: Exercise[] = params.exercises ? JSON.parse(params.exercises as string) : [];

  const [isFilmed, setIsFilmed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState('emom');

  const timerOptions = [
    { id: 'emom', name: 'EMOM', description: 'Every Minute On the Minute' },
    { id: 'tabata', name: 'Tabata', description: '20s work / 10s rest' },
    { id: 'custom', name: 'Custom', description: 'Personalized intervals' },
  ];

  const handleStartSession = () => {
    router.push({
      pathname: '/session/workout',
      params: {
        timerType: selectedTimer,
        sessionName: sessionName,
        exercises: JSON.stringify(exercises),
        sessionType: params.sessionType,
      },
    });
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Session Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Session Info Card */}
        <View style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionIcon}>
              <Ionicons name="barbell-outline" size={32} color="#A020F0" />
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionName}>{sessionName}</Text>
              <Text style={styles.sessionDetails}>{exercises.length} exercises</Text>
            </View>
          </View>
        </View>

        {/* Exercise List */}
        <View style={styles.exerciseSection}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseItem}>
              <Text style={styles.exerciseNumber}>{index + 1}</Text>
              <View>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDetails}>{exercise.details}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Options Section */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Session Options</Text>
          {/* Filming Toggle */}
          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <View style={styles.optionIcon}><Ionicons name="videocam-outline" size={20} color="#A020F0" /></View>
              <View style={styles.optionText}><Text style={styles.optionTitle}>Record Session</Text></View>
            </View>
            <Switch value={isFilmed} onValueChange={setIsFilmed} trackColor={{ false: '#333', true: '#A020F0' }} thumbColor={'#fff'} />
          </View>
          {/* Timer Settings */}
          <TouchableOpacity style={styles.optionItem} onPress={() => setTimerModalVisible(true)}>
            <View style={styles.optionLeft}>
              <View style={styles.optionIcon}><Ionicons name="timer-outline" size={20} color="#A020F0" /></View>
              <View style={styles.optionText}><Text style={styles.optionTitle}>Timer Settings</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.optionDescription}>{timerOptions.find(t => t.id === selectedTimer)?.name}</Text>
                <Ionicons name="chevron-forward" size={20} color="#888" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Start Session Button */}
        <View style={styles.startSection}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
            <Ionicons name="play" size={24} color="white" />
            <Text style={styles.startButtonText}>Start Session</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Timer Selection Modal */}
      <Modal
        visible={timerModalVisible}
        transparent={true} // Re-enabled for a clean pop-up effect
        animationType="fade"
        onRequestClose={() => setTimerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Timer Type</Text>
              <TouchableOpacity 
                onPress={() => setTimerModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            {timerOptions.map((timer) => (
              <TouchableOpacity
                key={timer.id}
                style={[
                  styles.timerOption,
                  selectedTimer === timer.id && styles.timerOptionSelected
                ]}
                onPress={() => {
                  setSelectedTimer(timer.id);
                  setTimerModalVisible(false);
                }}
              >
                <View style={styles.timerOptionContent}>
                  <Text style={styles.timerOptionName}>{timer.name}</Text>
                  <Text style={styles.timerOptionDescription}>{timer.description}</Text>
                </View>
                {selectedTimer === timer.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#A020F0" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  sessionCard: {
    backgroundColor: '#1e1e1e',
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    padding: 20,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionIcon: {
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
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  sessionDetails: {
    fontSize: 14,
    color: '#888',
  },
  exerciseSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  exerciseNumber: {
    width: 30,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A020F0',
    lineHeight: 24,
  },
  exerciseName: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  optionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
    marginTop: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  optionDescription: {
    fontSize: 14,
    color: '#888',
    marginRight: 8,
  },
  startSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  startButton: {
    backgroundColor: '#A020F0',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Modal styles updated for stability
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  timerOptionSelected: {
    borderColor: '#A020F0',
    borderWidth: 2,
  },
  timerOptionContent: {
    flex: 1,
  },
  timerOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginBottom: 2,
  },
  timerOptionDescription: {
    fontSize: 14,
    color: '#888',
  },
});
