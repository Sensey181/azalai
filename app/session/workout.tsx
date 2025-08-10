import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function WorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(10);
  const [currentExercise, setCurrentExercise] = useState(1);
  const [totalExercises, setTotalExercises] = useState(8);
  const [phase, setPhase] = useState<'work' | 'rest'>('work');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [timerType] = useState(params.timerType || 'emom');

  // Timer configuration based on type
  const getTimerConfig = () => {
    switch (timerType) {
      case 'emom':
        return { workTime: 60, restTime: 0, rounds: 3 };
      case 'tabata':
        return { workTime: 20, restTime: 10, rounds: 3 };
      case 'custom':
        return { workTime: 45, restTime: 15, rounds: 3 };
      default:
        return { workTime: 60, restTime: 0, rounds: 3 };
    }
  };

  const config = getTimerConfig();

  useEffect(() => {
    setTimeLeft(config.workTime);
    setTotalRounds(config.rounds);
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleRoundComplete();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isRunning, isPaused, timeLeft]);

  const handleRoundComplete = () => {
    if (phase === 'work') {
      // For EMOM, go directly to next round since there's no rest
      if (timerType === 'emom') {
        if (currentRound < totalRounds) {
          setCurrentRound(currentRound + 1);
          setPhase('work');
          setTimeLeft(config.workTime);
        } else {
          // Move to next exercise
          handleNextExercise();
        }
      } else {
        setPhase('rest');
        setTimeLeft(config.restTime);
      }
    } else {
      // Rest phase completed, move to next round or exercise
      if (currentRound < totalRounds) {
        setCurrentRound(currentRound + 1);
        setPhase('work');
        setTimeLeft(config.workTime);
      } else {
        // Move to next exercise
        handleNextExercise();
      }
    }
  };

  const handleNextExercise = () => {
    if (currentExercise < totalExercises) {
      // Move to next exercise
      setCurrentExercise(currentExercise + 1);
      setCurrentRound(1);
      setPhase('work');
      setTimeLeft(config.workTime);
    } else {
      // All exercises completed, workout is done
      handleStop();
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleRestart = () => {
    setTimeLeft(config.workTime);
    setCurrentRound(1);
    setCurrentExercise(1);
    setPhase('work');
    setIsRunning(false);
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    router.back();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionInfo = () => {
    const sessionName = params.sessionName || 'My Custom Strength';
    const sessionDetails = params.sessionDetails || '45 min • 8 exercises';
    return { name: sessionName, details: sessionDetails };
  };

  const sessionInfo = getSessionInfo();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleStop}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Session</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Session Info */}
      <View style={styles.sessionInfoCard}>
        <Text style={styles.sessionName}>{sessionInfo.name}</Text>
        <Text style={styles.sessionDetails}>{sessionInfo.details}</Text>
        <Text style={styles.timerType}>{timerType.toUpperCase()} Timer</Text>
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <View style={[styles.timerCircle, phase === 'rest' && styles.timerCircleRest]}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.phaseText}>{phase === 'work' ? 'WORK' : 'REST'}</Text>
        </View>
      </View>

      {/* Progress Info */}
      <View style={styles.progressContainer}>
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Round</Text>
          <Text style={styles.progressValue}>{currentRound}/{totalRounds}</Text>
        </View>
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Exercise</Text>
          <Text style={styles.progressValue}>{currentExercise}/{totalExercises}</Text>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {!isRunning ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Ionicons name="play" size={32} color="white" />
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.controlButtons}>
            <TouchableOpacity style={styles.controlButton} onPress={handlePause}>
              <Ionicons 
                name={isPaused ? "play" : "pause"} 
                size={24} 
                color="white" 
              />
              <Text style={styles.controlButtonText}>
                {isPaused ? 'Resume' : 'Pause'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={handleRestart}>
              <Ionicons name="refresh" size={24} color="white" />
              <Text style={styles.controlButtonText}>Restart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={handleStop}>
              <Ionicons name="stop" size={24} color="white" />
              <Text style={styles.controlButtonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Timer Type Info */}
      <View style={styles.timerInfoContainer}>
        <Text style={styles.timerInfoTitle}>Timer Settings</Text>
        <Text style={styles.timerInfoText}>
          {timerType === 'emom' && 'Every Minute On the Minute - 60s work intervals'}
          {timerType === 'tabata' && 'Tabata - 20s work / 10s rest intervals'}
          {timerType === 'custom' && 'Custom - 45s work / 15s rest intervals'}
        </Text>
      </View>
    </View>
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
    paddingTop: 50,
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
  sessionInfoCard: {
    backgroundColor: '#1e1e1e',
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
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
    marginBottom: 8,
  },
  timerType: {
    fontSize: 12,
    color: '#A020F0',
    fontWeight: '500',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#A020F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A020F0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  timerCircleRest: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  phaseText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    opacity: 0.9,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  controlsContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#A020F0',
    borderRadius: 16,
    paddingVertical: 20,
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
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  timerInfoContainer: {
    backgroundColor: '#1e1e1e',
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  timerInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  timerInfoText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
});
