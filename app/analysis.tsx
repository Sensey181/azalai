import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

// --- MAIN COMPONENT ---

export default function AnalysisScreen() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'loading'>('loading');
  // --- UPDATE: State to hold the results of each check ---
  const [analysisResults, setAnalysisResults] = useState<Record<string, boolean> | null>(null);
  const webviewRef = useRef<WebView>(null);
  
  const exerciseName = "Goblet Squat";
  const analysisChecks = [
      "Back remains straight",
      "Squat depth reaches parallel",
      "Knees track over feet",
      "Heels stay on the ground"
  ];

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
        
        // --- UPDATE: Object to track the status of each check ---
        let checks = {
            "Back remains straight": true,
            "Squat depth reaches parallel": true,
            "Knees track over feet": true,
            "Heels stay on the ground": true
        };

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
            
            const lShoulder = landmarks[11], rShoulder = landmarks[12];
            const lHip = landmarks[23], rHip = landmarks[24];
            const lKnee = landmarks[25], rKnee = landmarks[26];
            const lAnkle = landmarks[27], rAnkle = landmarks[28];
            const lHeel = landmarks[29], rHeel = landmarks[30];

            const isAtBottomOfSquat = lHip && lKnee && lHip.y > lKnee.y;

            const backAngle = calculateAngle(lShoulder, lHip, lKnee);
            if (backAngle && backAngle < 150) {
                checks["Back remains straight"] = false;
            }

            if (isAtBottomOfSquat) {
                const kneeAngle = calculateAngle(lHip, lKnee, lAnkle);
                if (kneeAngle && kneeAngle > 100) {
                    checks["Squat depth reaches parallel"] = false;
                }

                if (lKnee && rKnee && lAnkle && rAnkle) {
                    const kneeDistance = Math.abs(rKnee.x - lKnee.x);
                    const ankleDistance = Math.abs(rAnkle.x - lAnkle.x);
                    if (kneeDistance < ankleDistance * 0.8) {
                        checks["Knees track over feet"] = false;
                    }
                }

                if ((lHeel && lHeel.visibility < 0.6) || (rHeel && rHeel.visibility < 0.6)) {
                    checks["Heels stay on the ground"] = false;
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
              // --- UPDATE: Send the final results when the video ends ---
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ANALYSIS_RESULTS', payload: checks }));
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
      // --- UPDATE: Reset results for new analysis ---
      setAnalysisResults(null);
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
      // --- UPDATE: Handle the final results from the WebView ---
      case 'ANALYSIS_RESULTS':
        setAnalysisResults(data.payload);
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
        <Text style={styles.headerSessionText}>Analysis: {exerciseName}</Text>
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
      
      {/* --- UPDATE: This section is now fully dynamic --- */}
      <View style={styles.resultsContainer}>
          <Text style={styles.resultTitle}>
            {status === 'done' ? 'Analysis Complete!' : 'Key Checkpoints'}
          </Text>
          {analysisChecks.map((check, index) => {
              // Determine the status of the check after analysis is done
              const isDone = status === 'done';
              const result = isDone && analysisResults ? analysisResults[check] : null;

              return (
                <View key={index} style={styles.checkItem}>
                    <Ionicons 
                        name={result === true ? "checkmark-circle" : result === false ? "close-circle" : "checkmark-circle-outline"} 
                        size={20} 
                        color={result === true ? "#22c55e" : result === false ? "#ef4444" : "#A020F0"} 
                    />
                    <Text style={[styles.checkText, isDone && { color: result ? '#22c55e' : '#ef4444' }]}>
                        {check}
                    </Text>
                </View>
              )
          })}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
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
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkText: {
    color: '#ccc',
    fontSize: 16,
    marginLeft: 10,
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
