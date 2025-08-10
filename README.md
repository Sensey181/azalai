# KettleMind 🏋️‍♂️

A comprehensive kettlebell training app built with React Native and Expo, featuring AI-powered voice assistance through ElevenLabs integration.

## 🎯 Overview

KettleMind is your personal kettlebell training companion that helps you stay consistent with your fitness goals. The app provides structured training plans, tracks your progress, and offers voice-guided assistance through an AI chatbot named Graham.

## ✨ Features

### 🏋️‍♂️ Training Sessions
- **Strength & Power (S1)**: Focus on building strength and power with compound movements
- **Cardio & Endurance (S2)**: High-intensity interval training for cardiovascular fitness
- **Technique & Skills (S3)**: Work on form and advanced movement patterns
- **Rest Days**: Scheduled recovery periods for optimal performance

### 📅 Smart Planning
- 28-day structured training cycle
- Visual calendar interface
- Automatic session recommendations based on your plan
- Yesterday's session tracking for consistency

### 🏆 Achievements & Progress
- Workout history tracking
- Personal best recognition
- Total workout statistics
- Duration tracking
- Progress visualization

### 🤖 AI Voice Assistant (Graham)
- Voice-activated training assistant
- Navigate between app sections
- Get workout recommendations
- Receive motivational messages
- Record completed workouts
- Access training tips and information

### 📱 Modern UI/UX
- Clean, intuitive interface
- Smooth animations and transitions
- Responsive design for all screen sizes
- Dark/light mode support

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd azalai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your device**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator or `a` for Android emulator

### AI Voice Assistant Setup

To enable the AI voice assistant feature, follow the setup guide in [ELEVENLABS_SETUP.md](./ELEVENLABS_SETUP.md).

## 📁 Project Structure

```
azalai/
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── session/           # Workout session screens
│   ├── index.tsx          # Training screen
│   ├── achievements.tsx   # Progress tracking
│   ├── planning.tsx       # Calendar view
│   └── chatbot.tsx        # AI assistant placeholder
├── assets/
│   ├── data/              # JSON data files
│   │   ├── exercises.json # Exercise definitions
│   │   ├── trainingPlan.json # 28-day training plan
│   │   └── workoutHistory.json # Sample workout data
│   ├── fonts/             # Custom fonts
│   └── images/            # App icons and images
├── services/
│   ├── sessionHelpers.ts  # Session type utilities
│   ├── storage.ts         # AsyncStorage operations
│   └── chatbotContext.tsx # AI assistant context
├── styles/
│   └── auth.styles.js     # Authentication styles
└── android/               # Android-specific configuration
```

## 🎯 Training Plan

The app follows a structured 28-day training cycle:

- **Days 1, 5, 9, 13, 17, 22, 26**: Strength & Power
- **Days 2, 6, 10, 15, 19, 23, 27**: Cardio & Endurance  
- **Days 3, 8, 12, 16, 20, 24**: Technique & Skills
- **Days 4, 7, 11, 14, 18, 21, 25, 28**: Rest Days

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Hooks
- **Storage**: AsyncStorage
- **UI Components**: React Native core + Expo Vector Icons
- **AI Integration**: ElevenLabs Conversational AI
- **Language**: TypeScript

## 📱 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm run reset-project` - Reset project configuration

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory for AI features:

```env
EXPO_PUBLIC_ELEVENLABS_API_KEY=your-api-key
EXPO_PUBLIC_AGENT_ID=your-agent-id
```

### App Configuration

The app configuration is managed in `app.json`:
- App name: "kettlebell"
- Version: 1.0.0
- Platform support: iOS, Android, Web
- Orientation: Portrait
- Splash screen and icons configured

## 📊 Data Structure

### Exercise Data (`assets/data/exercises.json`)
Contains exercise definitions for each session type with:
- Exercise name and details
- Set/rep schemes
- Image URLs for demonstration

### Training Plan (`assets/data/trainingPlan.json`)
28-day structured training cycle with session assignments.

### Workout History
Stored locally using AsyncStorage with:
- Date and session type
- Duration tracking
- Personal best flags

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [ELEVENLABS_SETUP.md](./ELEVENLABS_SETUP.md) for AI assistant setup
- Review the troubleshooting section in the setup guide
- Open an issue on GitHub

## 🎉 Acknowledgments

- Built with [Expo](https://expo.dev/)
- AI voice assistance powered by [ElevenLabs](https://elevenlabs.io/)
- Icons from [Expo Vector Icons](https://icons.expo.fyi/)

---

**KettleMind** - Your journey to kettlebell mastery starts here! 💪
