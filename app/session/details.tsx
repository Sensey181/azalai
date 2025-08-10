import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SessionDetailsScreen() {
  const router = useRouter();
  const [isFilmed, setIsFilmed] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState('emom');

  const timerOptions = [
    { id: 'emom', name: 'EMOM', description: 'Every Minute On the Minute' },
    { id: 'tabata', name: 'Tabata', description: '20s work / 10s rest' },
    { id: 'custom', name: 'Custom', description: 'Personalized intervals' },
  ];

  const handleStartSession = () => {
    console.log('Starting session with settings:', {
      isFilmed,
      timer: selectedTimer,
      isSaved
    });
    // Navigate to workout screen with session parameters
    router.push({
      pathname: '/session/workout',
      params: {
        timerType: selectedTimer,
        sessionName: 'My Custom Strength',
        sessionDetails: '45 min • 8 exercises',
        isFilmed: isFilmed.toString(),
        isSaved: isSaved.toString()
      }
    });
  };

  const handleModifySession = () => {
    console.log('Modify session pressed');
    // TODO: Navigate to session editor
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    console.log('Session saved:', !isSaved);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
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
            <Text style={styles.sessionName}>My Custom Strength</Text>
            <Text style={styles.sessionDetails}>45 min • 8 exercises</Text>
          </View>
        </View>
      </View>

      {/* Options Section */}
      <View style={styles.optionsSection}>
        <Text style={styles.sectionTitle}>Session Options</Text>

        {/* Modify Session */}
        <TouchableOpacity style={styles.optionItem} onPress={handleModifySession}>
          <View style={styles.optionLeft}>
            <View style={styles.optionIcon}>
              <Ionicons name="create-outline" size={20} color="#A020F0" />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Modify Session</Text>
              <Text style={styles.optionDescription}>Edit exercises and settings</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        {/* Filming Toggle */}
        <View style={styles.optionItem}>
          <View style={styles.optionLeft}>
            <View style={styles.optionIcon}>
              <Ionicons name="videocam-outline" size={20} color="#A020F0" />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Record Session</Text>
              <Text style={styles.optionDescription}>Film your workout for analysis</Text>
            </View>
          </View>
          <Switch
            value={isFilmed}
            onValueChange={setIsFilmed}
            trackColor={{ false: '#333', true: '#A020F0' }}
            thumbColor={isFilmed ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Timer Settings */}
        <TouchableOpacity 
          style={styles.optionItem} 
          onPress={() => setTimerModalVisible(true)}
        >
          <View style={styles.optionLeft}>
            <View style={styles.optionIcon}>
              <Ionicons name="timer-outline" size={20} color="#A020F0" />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Timer Settings</Text>
              <Text style={styles.optionDescription}>
                {timerOptions.find(t => t.id === selectedTimer)?.name || 'EMOM'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        {/* Save/Unsave Toggle */}
        <TouchableOpacity style={styles.optionItem} onPress={handleSaveToggle}>
          <View style={styles.optionLeft}>
            <View style={styles.optionIcon}>
              <Ionicons 
                name={isSaved ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color="#A020F0" 
              />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>
                {isSaved ? 'Saved Session' : 'Save Session'}
              </Text>
              <Text style={styles.optionDescription}>
                {isSaved ? 'Remove from saved sessions' : 'Add to saved sessions'}
              </Text>
            </View>
          </View>
          <Ionicons 
            name={isSaved ? "checkmark-circle" : "add-circle-outline"} 
            size={20} 
            color={isSaved ? "#4CAF50" : "#888"} 
          />
        </TouchableOpacity>
      </View>

      {/* Start Session Button */}
      <View style={styles.startSection}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
          <Ionicons name="play" size={24} color="white" />
          <Text style={styles.startButtonText}>Start Session</Text>
        </TouchableOpacity>
      </View>

      {/* Timer Selection Modal */}
      <Modal
        visible={timerModalVisible}
        transparent={true}
        animationType="slide"
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
    </ScrollView>
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
    borderWidth: 1,
    borderColor: '#333',
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
  optionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
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
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#888',
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
    shadowColor: '#A020F0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
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
    borderWidth: 1,
    borderColor: '#333',
  },
  timerOptionSelected: {
    borderColor: '#A020F0',
    backgroundColor: '#2a1e2a',
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
