import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Camera, Settings2, History, Eye, EyeOff } from "lucide-react";
import { ObjectDetector, FilesetResolver } from "@mediapipe/tasks-vision";

export default function EnhancedObjectAi() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isObjectDetectorLoaded, setIsObjectDetectorLoaded] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [cameraError, setCameraError] = useState("");
  const [objectDetector, setObjectDetector] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [facingMode, setFacingMode] = useState("user");
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [settings, setSettings] = useState({
    scoreThreshold: 0.5,
    maxResults: 10,
    showConfidence: true,
    showBoundingBox: true,
    showLabels: true,
  });
  const navigate = useNavigate();
  const lastVideoTime = useRef(-1);

  // Load MediaPipe Object Detector
  useEffect(() => {
    const initializeObjectDetector = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const detector = await ObjectDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          scoreThreshold: settings.scoreThreshold,
          maxResults: settings.maxResults,
        });

        setObjectDetector(detector);
        setIsObjectDetectorLoaded(true);
      } catch (error) {
        console.error("Error loading MediaPipe Object Detector:", error);
        setCameraError("Failed to load object detection model");
      }
    };

    initializeObjectDetector();

    return () => {
      if (objectDetector) {
        objectDetector.close();
      }
    };
  }, [settings.scoreThreshold, settings.maxResults]);

  // Get available cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        setAvailableCameras(cameras);
        if (cameras.length > 0) {
          setSelectedCamera(cameras[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting cameras:", error);
      }
    };

    getCameras();
  }, []);

  // Initialize Camera
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const initCamera = async () => {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("play", () => {
            if (isObjectDetectorLoaded) {
              detectObjects(videoRef.current);
            }
          });
        }
      } catch (err) {
        setCameraError(
          "Camera access is required for verification. Please enable camera permissions."
        );
        console.error("Camera error:", err);
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [navigate, isObjectDetectorLoaded, selectedCamera, facingMode]);

  const detectObjects = async (video) => {
    if (!video || !isObjectDetectorLoaded || !objectDetector) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;

    const processFrame = async () => {
      if (video.paused || video.ended) return;

      const videoTime = video.currentTime;

      if (videoTime !== lastVideoTime.current) {
        lastVideoTime.current = videoTime;

        try {
          const objects = await objectDetector.detectForVideo(video, videoTime);
          setDetectedObjects(objects.detections);

          if (objects.detections.length > 0) {
            const timestamp = new Date().toLocaleTimeString();
            setDetectionHistory(prev => [
              { timestamp, objects: objects.detections },
              ...prev.slice(0, 49),
            ]);
          }

          // Enhanced visualization
          context.clearRect(0, 0, canvas.width, canvas.height);

          if (settings.showBoundingBox) {
            objects.detections.forEach((detection) => {
              const { originX, originY, width, height } = detection.boundingBox;
              const confidence = detection.categories[0].score;
              
              // Gradient background for bounding box
              const gradient = context.createLinearGradient(originX, originY, originX + width, originY + height);
              gradient.addColorStop(0, confidence > 0.7 ? 'rgba(0, 255, 128, 0.2)' : 'rgba(255, 128, 0, 0.2)');
              gradient.addColorStop(1, confidence > 0.7 ? 'rgba(0, 255, 128, 0.4)' : 'rgba(255, 128, 0, 0.4)');
              
              // Draw box with gradient
              context.fillStyle = gradient;
              context.fillRect(originX, originY, width, height);
              
              // Animated border
              context.strokeStyle = confidence > 0.7 ? '#00FF80' : '#FF8000';
              context.lineWidth = 3;
              context.setLineDash([10, 5]);
              context.lineDashOffset = -performance.now() / 50;
              context.strokeRect(originX, originY, width, height);
              
              if (settings.showLabels) {
                // Enhanced label background
                const label = settings.showConfidence
                  ? `${detection.categories[0].categoryName} ${Math.round(detection.categories[0].score * 100)}%`
                  : detection.categories[0].categoryName;
                
                context.font = 'bold 16px Arial';
                const textWidth = context.measureText(label).width;
                
                // Label background
                context.fillStyle = confidence > 0.7 ? 'rgba(0, 255, 128, 0.9)' : 'rgba(255, 128, 0, 0.9)';
                context.fillRect(
                  originX,
                  originY - 25,
                  textWidth + 20,
                  25
                );
                
                // Label text
                context.fillStyle = '#000000';
                context.fillText(
                  label,
                  originX + 10,
                  originY - 7
                );
              }
            });
          }
        } catch (error) {
          console.error("Error in detection loop:", error);
        }
      }

      requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  const StatusMessage = ({ type, message }) => {
    if (!message) return null;

    const isError = type === "error";
    const Icon = isError ? AlertCircle : CheckCircle2;

    return (
      <div className={`${isError ? 'bg-red-900/50' : 'bg-green-900/50'} border-l-4 
        ${isError ? 'border-red-500' : 'border-green-500'} p-4 rounded-lg mt-4`}>
        <div className="flex items-center">
          <Icon className={`h-5 w-5 ${isError ? 'text-red-400' : 'text-green-400'} mr-2`} />
          <p className={`text-sm ${isError ? 'text-red-200' : 'text-green-200'}`}>{message}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-900 rounded-xl">
      {cameraError ? (
        <StatusMessage type="error" message={cameraError} />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between mb-4">
            <select
              className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
            >
              {availableCameras.map((camera) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label || `Camera ${camera.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showHistory ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full aspect-video bg-gray-800 rounded-lg border-2 border-gray-700"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
            {detectedObjects.length > 0 && (
              <div className="absolute top-2 right-2 bg-blue-600/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg backdrop-blur-sm">
                {detectedObjects.length} Objects Detected
              </div>
            )}
          </div>

          {/* Settings Panel */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <div className="flex items-center mb-4">
              <Settings2 className="w-5 h-5 text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Detection Settings</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(settings).filter(([key]) => typeof settings[key] === 'boolean').map(([key, value]) => (
                <label key={key} className="flex items-center space-x-3 text-gray-200">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                  />
                  <span>{key.split(/(?=[A-Z])/).join(" ")}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Current Detections */}
          {detectedObjects.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Current Detections</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {detectedObjects.map((obj, index) => (
                  <div key={index} className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                    <p className="font-medium text-white">
                      {obj.categories[0].categoryName}
                    </p>
                    <p className="text-sm text-gray-300">
                      Confidence: {Math.round(obj.categories[0].score * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detection History */}
          {showHistory && detectionHistory.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <History className="w-5 h-5 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Detection History</h3>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-4">
                {detectionHistory.map((entry, index) => (
                  <div key={index} className="border-b border-gray-700 pb-4">
                    <p className="font-medium text-gray-300 mb-2">{entry.timestamp}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {entry.objects.map((obj, objIndex) => (
                        <div key={objIndex} className="bg-gray-700/50 p-2 rounded-lg border border-gray-600">
                          <p className="text-white">{obj.categories[0].categoryName}</p>
                          <p className="text-sm text-gray-400">
                            {Math.round(obj.categories[0].score * 100)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}