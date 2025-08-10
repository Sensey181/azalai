import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'workoutHistory';

interface WorkoutRecord {
  date: string;
  session: number;
  durationMinutes: number;
  personalBest: boolean; // We can add logic for this later
}

// Fetches the entire workout history from storage
export const getHistory = async (): Promise<WorkoutRecord[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(HISTORY_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to load workout history.", e);
    return [];
  }
};

// Adds a single completed workout to the history
export const addWorkoutToHistory = async (newWorkout: Omit<WorkoutRecord, 'personalBest'>) => {
  try {
    const currentHistory = await getHistory();
    const workoutWithPB = { ...newWorkout, personalBest: false }; // PB logic can be added here
    const updatedHistory = [workoutWithPB, ...currentHistory]; // Add new workout to the top
    const jsonValue = JSON.stringify(updatedHistory);
    await AsyncStorage.setItem(HISTORY_KEY, jsonValue);
    console.log("Workout saved successfully!");
  } catch (e) {
    console.error("Failed to save workout.", e);
  }
};
