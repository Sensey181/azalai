import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addWorkoutToHistory } from '../../services/storage';

interface Exercise {
  name: string;
  details: string;
  gifUrl: string;
}

export default function WorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const exercises: Exercise[] = params.exercises ? JSON.parse(params.exercises as string) : [];
  const sessionType = parseInt(params.sessionType as string || '1');
  
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [phase, setPhase] = useState<'work' | 'rest'>('work');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const config = { workTime: 60, restTime: 10, totalRounds: 3 };

  useEffect(() => {
    setTimeLeft(config.workTime);
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      handlePhaseComplete();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isRunning, isPaused, timeLeft]);

  const handlePhaseComplete = () => {
    if (phase === 'work' && config.restTime > 0) {
      setPhase('rest');
      setTimeLeft(config.restTime);
    } else {
      if (currentRound < config.totalRounds) {
        setCurrentRound(currentRound + 1);
        setPhase('work');
        setTimeLeft(config.workTime);
      } else {
        handleNextExercise();
      }
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentRound(1);
      setPhase('work');
      setTimeLeft(config.workTime);
    } else {
      finishWorkout();
    }
  };
  
  const handleSkip = () => {
    if (phase === 'work' && config.restTime > 0) {
      setPhase('rest');
      setTimeLeft(config.restTime);
    } else {
      if (currentRound < config.totalRounds) {
        setCurrentRound(currentRound + 1);
        setPhase('work');
        setTimeLeft(config.workTime);
      } else {
        handleNextExercise();
      }
    }
  };

  const finishWorkout = async () => {
    if (!startTime) {
        router.replace('/achievements');
        return;
    };
    const endTime = Date.now();
    const durationMinutes = Math.floor((endTime - startTime) / 60000);

    await addWorkoutToHistory({
      date: new Date().toISOString(),
      session: sessionType,
      durationMinutes: durationMinutes > 0 ? durationMinutes : 1,
    });
    
    setIsRunning(false);
    router.replace('/achievements'); 
  };

  const handleStart = () => {
    setStartTime(Date.now());
    setIsRunning(true);
  };

  const handlePause = () => setIsPaused(!isPaused);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={finishWorkout}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentExercise?.name || 'Workout'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.contentContainer}>
        <Image 
            source={{ uri: currentExercise?.gifUrl }} 
            style={styles.gif}
            resizeMode="contain"
        />
        <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Round</Text>
                <Text style={styles.progressValue}>{currentRound}/{config.totalRounds}</Text>
            </View>
            <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Exercise</Text>
                <Text style={styles.progressValue}>{currentExerciseIndex + 1}/{exercises.length}</Text>
            </View>
        </View>
      </View>

      <View style={styles.timerWrapper}>
        <View style={[styles.timerCircle, phase === 'rest' && styles.timerCircleRest]}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.phaseText}>{phase.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        {!isRunning ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Ionicons name="play" size={32} color="white" />
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.controlButtons}>
            <TouchableOpacity style={styles.controlButton} onPress={handlePause}>
              <Ionicons name={isPaused ? "play" : "pause"} size={24} color="white" />
              <Text style={styles.controlButtonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, styles.skipButton]} onPress={handleSkip}>
              <Ionicons name="play-skip-forward" size={24} color="white" />
              <Text style={styles.controlButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        )}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 250, // Make space for timer and controls
  },
  gif: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  progressItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: '#888',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  timerWrapper: {
    position: 'absolute',
    bottom: 120, // Position it above the controls
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  timerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 5,
    borderColor: '#A020F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  timerCircleRest: {
    borderColor: '#4CAF50',
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  phaseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    letterSpacing: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  startButton: {
    backgroundColor: '#A020F0',
    borderRadius: 16,
    paddingVertical: 20,
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
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    paddingVertical: 16,
    width: '48%',
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#333',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});
