# ElevenLabs Integration Setup for KettleMind

## Prerequisites

1. **ElevenLabs Account**: Sign up at [elevenlabs.io](https://elevenlabs.io)
2. **API Key**: Get your API key from the ElevenLabs dashboard
3. **Agent ID**: Create a conversational AI agent in the ElevenLabs dashboard

## Setup Steps

### 1. Get Your ElevenLabs API Key

1. Go to [ElevenLabs Dashboard](https://elevenlabs.io)
2. Navigate to **Profile Settings** (top right corner)
3. Go to **API Key** section
4. Copy your API key (starts with `xi-api-`)

### 2. Create an ElevenLabs Agent

1. Go to [ElevenLabs Dashboard](https://elevenlabs.io)
2. Navigate to **Conversational AI > Agents**
3. Create a new agent from the blank template
4. Copy the Agent ID (you'll need this for the app)

### 3. Configure the Agent

#### First Message
Set the first message to:
```
Hi there! I'm Graham, your KettleMind training assistant running on {{platform}}. How can I help you with your workout today?
```

#### System Prompt
Set the system prompt to:
```
You are Graham, a helpful kettlebell training assistant for the KettleMind app running on {{platform}}. You have access to tools that allow you to:

- Navigate users to different sections of the KettleMind app
- Check the user's workout history
- Get information about different session types
- Record completed workouts
- Provide motivational messages
- Give workout tips
- Start specific workout sessions

Use these tools when appropriate to help the user with their training. Be encouraging, knowledgeable about kettlebell training, and always prioritize safety and proper form. You have a friendly, supportive personality and are excited to help users achieve their fitness goals.

Session Types:
1. Strength & Power - Focus on building strength and power
2. Cardio & HIIT - High-intensity interval training for endurance
3. Technique & Skills - Work on form and movement patterns
4. Rest Day - Recovery and rest

Always be supportive and motivational while providing practical advice. Remember, you're Graham, the KettleMind training assistant!
```

#### Client Tools Configuration

Set up these client tools in your ElevenLabs agent:

**Navigation Tools:**
1. **navigateToTraining**
   - Description: Navigates the user to the training section
   - Wait for response: `true`
   - Response timeout: 3 seconds

2. **navigateToPlanning**
   - Description: Navigates the user to the planning calendar
   - Wait for response: `true`
   - Response timeout: 3 seconds

3. **navigateToAchievements**
   - Description: Navigates the user to the achievements page
   - Wait for response: `true`
   - Response timeout: 3 seconds

4. **navigateToAnalysis**
   - Description: Navigates the user to the analysis section
   - Wait for response: `true`
   - Response timeout: 3 seconds

5. **navigateToSession**
   - Description: Starts a workout session (optionally with specific session type)
   - Wait for response: `true`
   - Response timeout: 3 seconds
   - Parameters:
     - Data Type: `number`
     - Identifier: `sessionType`
     - Required: `false`
     - Description: Session type number (1-4) to start specific session

**Information Tools:**
6. **getAppOverview**
   - Description: Provides an overview of what the user can do in the app
   - Wait for response: `true`
   - Response timeout: 3 seconds

7. **getCurrentSessionRecommendation**
   - Description: Gets today's recommended session based on the training plan
   - Wait for response: `true`
   - Response timeout: 3 seconds

8. **getUserWorkoutHistory**
   - Description: Gets the user's recent workout history
   - Wait for response: `true`
   - Response timeout: 3 seconds

9. **getSessionInformation**
   - Description: Gets information about a specific session type (1-4)
   - Wait for response: `true`
   - Response timeout: 3 seconds
   - Parameters:
     - Data Type: `number`
     - Identifier: `sessionType`
     - Required: `true`
     - Description: Session type number (1-4)

10. **getMotivationalMessage**
    - Description: Provides a random motivational message
    - Wait for response: `true`
    - Response timeout: 3 seconds

11. **getWorkoutTips**
    - Description: Provides tips for a specific session type
    - Wait for response: `true`
    - Response timeout: 3 seconds
    - Parameters:
      - Data Type: `number`
      - Identifier: `sessionType`
      - Required: `true`
      - Description: Session type number (1-4)

**Action Tools:**
12. **recordWorkout**
    - Description: Records a completed workout session
    - Wait for response: `true`
    - Response timeout: 3 seconds
    - Parameters:
      - Data Type: `number`
      - Identifier: `sessionType`
      - Required: `true`
      - Description: Session type number (1-4)
      - Data Type: `number`
      - Identifier: `durationMinutes`
      - Required: `true`
      - Description: Duration of the workout in minutes

### 4. Environment Configuration

Create a `.env` file in your project root with:

```
EXPO_PUBLIC_ELEVENLABS_API_KEY=your-actual-api-key-here
EXPO_PUBLIC_AGENT_ID=your-actual-agent-id-here
```

Replace:
- `your-actual-api-key-here` with your ElevenLabs API key (starts with `xi-api-`)
- `your-actual-agent-id-here` with the Agent ID you copied from the ElevenLabs dashboard

**Important**: Never commit your `.env` file to version control. Make sure it's in your `.gitignore`.

### 5. Update Chatbot Configuration

The chatbot component is already configured to use these environment variables. The ElevenLabs SDK will automatically use the API key for authentication.

### 6. Build and Run

Since this uses native dependencies, you'll need to prebuild the app:

```bash
# Prebuild the app
npx expo prebuild --clean

# Start the development server
npx expo start --tunnel

# Run on device (in another terminal)
npx expo run:ios --device
# or
npx expo run:android --device
```

## Testing the Integration

1. Open the KettleMind app and tap the middle chatbot button
2. Tap the microphone to start the conversation with Graham
3. Ask questions like:
   - "Take me to the training section"
   - "Show me my achievements"
   - "What's my workout history?"
   - "Start a strength session"
   - "What should I do today?"
   - "Give me a motivational message"
   - "What can I do in KettleMind?"
   - "Hi Graham, how are you?"

## Troubleshooting

- **Connection Issues**: Make sure your device has internet access
- **Permission Errors**: Ensure microphone permissions are granted
- **Authentication Errors**: Verify your API key is correct and has sufficient credits
- **Agent Not Responding**: Verify your Agent ID is correct and the agent is active
- **Build Errors**: Make sure you've run `npx expo prebuild --clean` after adding the dependencies

## Security Notes

- **API Key Security**: Your API key gives access to your ElevenLabs account. Keep it secure.
- **Environment Variables**: The `EXPO_PUBLIC_` prefix makes these variables available to the client. For production, consider using a backend proxy.
- **Rate Limits**: ElevenLabs has usage limits. Monitor your usage in the dashboard.

## Features

The chatbot can:
- ✅ Navigate to any section of the app
- ✅ Start specific workout sessions
- ✅ Access workout history
- ✅ Provide session information
- ✅ Record completed workouts
- ✅ Give motivational messages
- ✅ Share workout tips
- ✅ Provide app overview
- ✅ Recommend daily sessions
- ✅ Handle voice conversations
- ✅ Work across iOS and Android