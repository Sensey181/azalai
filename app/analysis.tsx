import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

// --- MAIN COMPONENT ---

export default function AnalysisScreen() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [feedback, setFeedback] = useState<string[]>([]);
  const webviewRef = useRef<WebView>(null);
  
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
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LANDMARKER_READY' }));
        }
        createPoseLandmarker();

        function calculateAngle(p1, p2, p3) {
            if (!p1 || !p2 || !p3) return -1;
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
            drawingUtils.drawLandmarks(landmarks, { radius: 3, color: 'white' });
            drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color: '#A020F0', lineWidth: 4 });
            
            const backAngle = calculateAngle(landmarks[11], landmarks[23], landmarks[25]); // L-Shoulder, L-Hip, L-Knee
            if (backAngle !== -1 && backAngle < 160) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FEEDBACK', payload: 'Keep back straight' }));
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
        setFeedback(prev => prev.includes(data.payload) ? prev : [...prev, data.payload]);
        break;
      case 'ANALYSIS_COMPLETE':
        setStatus('done');
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* --- Header --- */}
      <View style={styles.headerContainer}>
        <Ionicons name="body-outline" size={32} color="#A020F0" />
        <Text style={styles.headerSessionText}>Movement Analysis</Text>
      </View>

      {/* --- Video Player --- */}
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
        {status === 'loading' && (
            <View style={styles.activityIndicatorContainer}>
                <ActivityIndicator size="large" color="#A020F0" />
            </View>
        )}
      </View>
      
      {/* --- Results & Feedback --- */}
      {(status === 'processing' || status === 'done') && (
        <View style={styles.resultsContainer}>
            {status === 'processing' && <Text style={styles.feedbackText}>Analyzing your form...</Text>}
            {status === 'done' && (
                <>
                    <Text style={styles.resultTitle}>Analysis Complete!</Text>
                    {feedback.length > 0 ? (
                        feedback.map((msg, index) => (
                            <Text key={index} style={styles.feedbackText}>- {msg}</Text>
                        ))
                    ) : (
                        <Text style={styles.feedbackText}>Great form! No issues detected.</Text>
                    )}
                </>
            )}
        </View>
      )}

      {/* --- Action Button --- */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, status !== 'idle' && styles.actionButtonDisabled]}
          onPress={pickAndProcessVideo}
          disabled={status !== 'idle'}
        >
          <Text style={styles.actionButtonText}>
            {status === 'processing' ? 'Processing...' : 'Analyze New Video'}
          </Text>
          <Ionicons 
            name="videocam-outline"
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- STYLES (inspired by planning.tsx) ---

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
