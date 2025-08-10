import AsyncStorage from '@react-native-async-storage/async-storage';
import trainingPlan from '../assets/data/trainingPlan.json'; // Import the default plan

const HISTORY_KEY = 'workoutHistory';
const PLAN_KEY = 'trainingPlan'; // Key for the plan

interface WorkoutRecord {
  date: string;
  session: number;
  durationMinutes: number;
  personalBest: boolean;
}

interface Day {
  day: number;
  session: number;
}

// --- NEW: Initializes the plan in storage if it doesn't exist ---
export const initializePlan = async () => {
  try {
    const existingPlan = await AsyncStorage.getItem(PLAN_KEY);
    if (existingPlan === null) {
      // If no plan is found, save the default one from the JSON file
      await AsyncStorage.setItem(PLAN_KEY, JSON.stringify(trainingPlan.plan));
      console.log('Default training plan initialized in storage.');
    }
  } catch (e) {
    console.error("Failed to initialize plan.", e);
  }
};

// --- NEW: Gets the plan from storage ---
export const getPlan = async (): Promise<Day[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(PLAN_KEY);
    // If for some reason it's null, return the default plan as a fallback
    return jsonValue != null ? JSON.parse(jsonValue) : trainingPlan.plan;
  } catch (e) {
    console.error("Failed to load plan.", e);
    return trainingPlan.plan; // Fallback
  }
};

// --- Existing History Functions ---
export const getHistory = async (): Promise<WorkoutRecord[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(HISTORY_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to load workout history.", e);
    return [];
  }
};

export const addWorkoutToHistory = async (newWorkout: Omit<WorkoutRecord, 'personalBest'>) => {
  try {
    const currentHistory = await getHistory();
    const workoutWithPB = { ...newWorkout, personalBest: false };
    const updatedHistory = [workoutWithPB, ...currentHistory];
    const jsonValue = JSON.stringify(updatedHistory);
    await AsyncStorage.setItem(HISTORY_KEY, jsonValue);
    console.log("Workout saved successfully!");
  } catch (e) {
    console.error("Failed to save workout.", e);
  }
};
