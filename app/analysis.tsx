import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

// --- MAIN COMPONENT ---

export default function AnalysisScreen() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'loading'>('loading');
  const [feedback, setFeedback] = useState<string[]>([]);
  const webviewRef = useRef<WebView>(null);
  
  // This HTML now contains more advanced logic for Goblet Squat analysis.
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      <style>
        body { margin: 0; background-color: black; display: flex; justify-content: center; align-items: center; overflow: hidden; }
        canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        video { display: none; }
      </style>
    </head>
    <body>
      <video id="video" playsinline></video>
      <canvas id="output"></canvas>
      <script type="module">
        import { PoseLandmarker, FilesetResolver, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

        const video = document.getElementById('video');
        const canvasElement = document.getElementById('output');
        const canvasCtx = canvasElement.getContext('2d');
        const drawingUtils = new DrawingUtils(canvasCtx);
        let poseLandmarker;

        async function createPoseLandmarker() {
          const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
          poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task', delegate: 'GPU' },
            runningMode: 'VIDEO',
            numPoses: 1
          });
          // Notify React Native that the model is ready
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LANDMARKER_READY' }));
        }
        createPoseLandmarker();

        function calculateAngle(p1, p2, p3) {
            // Ensure all points are valid before calculating
            if (!p1 || !p2 || !p3 || !p1.visibility || !p2.visibility || !p3.visibility || p1.visibility < 0.5 || p2.visibility < 0.5 || p3.visibility < 0.5) return null;
            const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
            let angle = Math.abs(radians * 180.0 / Math.PI);
            if (angle > 180.0) angle = 360 - angle;
            return angle;
        }

        async function predictWebcam() {
          if (!video || video.paused || video.ended || !poseLandmarker) return;
          
          const startTimeMs = performance.now();
          const results = poseLandmarker.detectForVideo(video, startTimeMs);

          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          
          if (results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0];
            drawingUtils.drawLandmarks(landmarks, { radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1), color: 'white' });
            drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color: '#A020F0', lineWidth: 4 });
            
            // --- GOBLET SQUAT ANALYSIS LOGIC ---
            const leftShoulder = landmarks[11];
            const leftHip = landmarks[23];
            const leftKnee = landmarks[25];
            const leftAnkle = landmarks[27];

            // 1. Check for back straightness (angle between shoulder, hip, and knee)
            const backAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
            if (backAngle && backAngle < 150) { // If leaning too far forward
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FEEDBACK', payload: 'Keep your back straight' }));
            }

            // 2. Check for squat depth (angle between hip, knee, and ankle)
            // We only check for depth when the user is at the bottom of the squat,
            // which we can approximate by checking if the hip is below the knee.
            if (leftHip && leftKnee && leftHip.y > leftKnee.y) {
                const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
                if (kneeAngle && kneeAngle > 100) { // If angle is too wide, not deep enough
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FEEDBACK', payload: 'Go deeper to reach parallel' }));
                }
            }
          }
          
          canvasCtx.restore();
          requestAnimationFrame(predictWebcam);
        }

        document.addEventListener('message', async (event) => {
          const { type, payload } = JSON.parse(event.data);
          if (type === 'ANALYZE_VIDEO') {
            video.src = payload;
            video.onloadeddata = () => {
              canvasElement.width = video.videoWidth;
              canvasElement.height = video.videoHeight;
              video.play();
              predictWebcam();
            };
            video.onended = () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ANALYSIS_COMPLETE' }));
            };
          }
        });
      </script>
    </body>
    </html>
  `;

  const pickAndProcessVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });

    if (!result.canceled && result.assets[0]) {
      setStatus('processing');
      setFeedback([]);
      const { uri } = result.assets[0];
      
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const videoDataUrl = `data:video/mp4;base64,${base64}`;
      
      webviewRef.current?.postMessage(JSON.stringify({
        type: 'ANALYZE_VIDEO',
        payload: videoDataUrl,
      }));
    }
  };

  const handleWebViewMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    switch (data.type) {
      case 'LANDMARKER_READY':
        setStatus('idle');
        break;
      case 'FEEDBACK':
        // This logic prevents the same feedback message from being added repeatedly
        setFeedback(prev => prev.includes(data.payload) ? prev : [...prev, data.payload]);
        break;
      case 'ANALYSIS_COMPLETE':
        setStatus('done');
        break;
      default:
        break;
    }
  };
  
  const getButtonText = () => {
      if (status === 'processing') return 'Processing...';
      if (status === 'done') return 'Analyze Another Video';
      if (status === 'loading') return 'Loading Engine...';
      return 'Analyze Video';
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Ionicons name="body-outline" size={32} color="#A020F0" />
        <Text style={styles.headerSessionText}>Movement Analysis</Text>
      </View>

      <View style={styles.webviewContainer}>
        <WebView
            ref={webviewRef}
            style={styles.webview}
            source={{ html: htmlContent, baseUrl: Platform.OS === 'android' ? 'file:///android_asset/' : '' }}
            originWhitelist={['*']}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            onError={(e) => console.error('WebView Error:', e.nativeEvent)}
            onLoadStart={() => setStatus('loading')}
        />
        {(status === 'loading' || status === 'processing') && (
            <View style={styles.activityIndicatorContainer}>
                <ActivityIndicator size="large" color="#A020F0" />
                <Text style={styles.processingText}>{status === 'processing' ? 'Analyzing...' : ''}</Text>
            </View>
        )}
      </View>
      
      {status === 'done' && (
        <View style={styles.resultsContainer}>
            <Text style={styles.resultTitle}>Analysis Complete!</Text>
            {feedback.length > 0 ? (
                feedback.map((msg, index) => (
                    <Text key={index} style={styles.feedbackText}>- {msg}</Text>
                ))
            ) : (
                <Text style={styles.feedbackText}>Great form! No major issues detected.</Text>
            )}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          // THIS IS THE FIX: The button is now only disabled while processing or loading.
          style={[styles.actionButton, (status === 'processing' || status === 'loading') && styles.actionButtonDisabled]}
          onPress={pickAndProcessVideo}
          disabled={status === 'processing' || status === 'loading'}
        >
          <Text style={styles.actionButtonText}>{getButtonText()}</Text>
          <Ionicons name="videocam-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- STYLES ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerSessionText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  webviewContainer: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  activityIndicatorContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
  },
  processingText: {
      color: 'white',
      marginTop: 10,
      fontSize: 16,
  },
  resultsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
  },
  resultTitle: {
    color: '#A020F0',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  feedbackText: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A020F0',
    paddingVertical: 15,
    borderRadius: 15,
  },
  actionButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});
