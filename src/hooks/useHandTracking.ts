import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { useStore, Gesture } from '../store/useStore';

export function useHandTracking(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  
  const { 
    setCursor, setSecondaryCursor, setGesture, handMode, setCameraReady,
    cursorSmoothing: alpha,
    gestureConfidenceFrames,
    pinchThreshold
  } = useStore();
  
  // Smoothing vars
  const smoothedCursor = useRef({ x: 0.5, y: 0.5 });
  const smoothedCursor2 = useRef({ x: 0.5, y: 0.5 });
  
  // Gesture debounce vars
  const lastGesture = useRef<Gesture>('IDLE');
  const gestureFrames = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    let active = true;
    
    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        if (!active) return;

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        
        if (!active) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setCameraReady(true);
        setIsInitializing(false);
      } catch (err: any) {
        console.error("Failed to initialize MediaPipe:", err);
        setError(err.message);
        setIsInitializing(false);
      }
    }
    
    init();
    
    return () => {
      active = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    if (!handMode || !videoRef.current || isInitializing) return;

    let lastVideoTime = -1;
    
    const detect = () => {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      
      if (video && video.readyState >= 2 && landmarker) {
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          
          try {
            const results = landmarker.detectForVideo(video, performance.now());
            processResults(results);
          } catch(e) {
            console.error(e);
          }
        }
      }
      
      requestRef.current = requestAnimationFrame(detect);
    };
    
    requestRef.current = requestAnimationFrame(detect);
    
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [handMode, isInitializing]);

  const processResults = (results: HandLandmarkerResult) => {
    if (!results.landmarks || results.landmarks.length === 0) {
      setCursor(null);
      setSecondaryCursor(null);
      setGesture('IDLE');
      return;
    }

    // Process Hand 1
    const landmarks1 = results.landmarks[0];
    const indexTip1 = landmarks1[8];
    const rawX1 = 1 - indexTip1.x;
    const rawY1 = indexTip1.y;
    
    smoothedCursor.current.x = smoothedCursor.current.x * (1 - alpha) + rawX1 * alpha;
    smoothedCursor.current.y = smoothedCursor.current.y * (1 - alpha) + rawY1 * alpha;
    
    setCursor({ x: smoothedCursor.current.x, y: smoothedCursor.current.y });

    // Process Hand 2
    if (results.landmarks.length > 1) {
      const landmarks2 = results.landmarks[1];
      const indexTip2 = landmarks2[8];
      const rawX2 = 1 - indexTip2.x;
      const rawY2 = indexTip2.y;
      
      smoothedCursor2.current.x = smoothedCursor2.current.x * (1 - alpha) + rawX2 * alpha;
      smoothedCursor2.current.y = smoothedCursor2.current.y * (1 - alpha) + rawY2 * alpha;
      setSecondaryCursor({ x: smoothedCursor2.current.x, y: smoothedCursor2.current.y });
    } else {
      setSecondaryCursor(null);
    }

    const newGesture = detectGesture(results.landmarks);
    
    // Debounce gesture
    gestureFrames.current[newGesture] = (gestureFrames.current[newGesture] || 0) + 1;
    
    for (const g in gestureFrames.current) {
      if (g !== newGesture) {
        gestureFrames.current[g] = 0;
      }
    }
    
    if (gestureFrames.current[newGesture] >= gestureConfidenceFrames && lastGesture.current !== newGesture) {
      lastGesture.current = newGesture;
      setGesture(newGesture);
    }
  };

  const detectGesture = (allLandmarks: any[][]): Gesture => {
    if (allLandmarks.length > 1) {
      return 'TWO_HAND_3D';
    }

    const landmarks = allLandmarks[0];
    
    const isFingerUp = (tipIdx: number, pipIdx: number) => {
      const tip = landmarks[tipIdx];
      const pip = landmarks[pipIdx];
      const wrist = landmarks[0];
      const distTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y, tip.z - wrist.z);
      const distPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y, pip.z - wrist.z);
      return distTip > distPip * 1.2; 
    };

    const thumbUp = isFingerUp(4, 2);
    const indexUp = isFingerUp(8, 6);
    const middleUp = isFingerUp(12, 10);
    const ringUp = isFingerUp(16, 14);
    const pinkyUp = isFingerUp(20, 18);
    
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y, thumbTip.z - indexTip.z);
    
    if (pinchDist < pinchThreshold) {
      return 'PINCHING';
    }
    
    if (!indexUp && !middleUp && !ringUp && !pinkyUp && !thumbUp) {
      return 'ERASING'; // Fist
    }

    if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
       // Thumbs up/down check based on y direction
       if (thumbTip.y < landmarks[2].y) return 'THUMBS_UP';
       return 'THUMBS_DOWN';
    }
    
    if (indexUp && middleUp && ringUp && pinkyUp) {
      return 'PAUSED'; // Open palm
    }

    if (indexUp && middleUp && ringUp && !pinkyUp) {
      return 'MENU'; // Three fingers
    }
    
    if (indexUp && middleUp && !ringUp && !pinkyUp) {
      return 'OBJECT_MODE'; // Two fingers
    }
    
    if (indexUp && !middleUp && !ringUp && !pinkyUp) {
      return 'DRAWING';
    }
    
    return 'IDLE';
  };

  return { isInitializing, error };
}
