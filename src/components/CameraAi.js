import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2, Camera } from "lucide-react";

export default function CameraAi() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [emotion, setEmotion] = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [sadPhotos, setSadPhotos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadModels = async () => {
      try {
        const modelPromises = [
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ];
        
        await Promise.all(modelPromises);
        setIsModelLoaded(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading face detection models:", err);
        setCameraError("Failed to load face detection models");
        setIsLoading(false);
      }
    };
    loadModels();

    return () => {
      // Cleanup detection loop on unmount
      if (detectionRef.current) {
        cancelAnimationFrame(detectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const initCamera = async () => {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
            frameRate: { ideal: 30 }
          },
        });
        
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().then(resolve);
            };
          });

          if (isModelLoaded) {
            // Add a small delay before starting detection
            setTimeout(() => {
              detectFace(videoRef.current);
            }, 1000);
          }
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
  }, [navigate, isModelLoaded]);

  const captureSadPhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const photoData = canvas.toDataURL("image/png");
    setSadPhotos(prev => [...prev.slice(-5), {
      id: Date.now(),
      url: photoData,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const detectFace = async (video) => {
    if (!video || !isModelLoaded || video.paused || video.ended) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    
    // Set canvas size to match video dimensions
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;
    
    // Set proper dimensions for face-api
    faceapi.matchDimensions(canvas, displaySize);

    let lastCaptureTime = 0;
    const captureInterval = 2000;

    const detect = async () => {
      try {
        const detectionOptions = new faceapi.TinyFaceDetectorOptions({
          inputSize: 512,
          scoreThreshold: 0.5
        });

        const detections = await faceapi
          .detectAllFaces(video, detectionOptions)
          .withFaceLandmarks()
          .withFaceExpressions();

        // Get the detection results sized to match canvas
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        // Clear previous drawings
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (resizedDetections.length > 0) {
          // Draw detections
          resizedDetections.forEach(detection => {
            // Draw detection box
            context.strokeStyle = '#30ff30';
            context.lineWidth = 2;
            const box = detection.detection.box;
            context.strokeRect(box.x, box.y, box.width, box.height);
            
            // Draw landmarks
            const landmarks = detection.landmarks;
            const points = landmarks.positions;
            
            points.forEach(point => {
              context.beginPath();
              context.arc(point.x, point.y, 2, 0, 2 * Math.PI);
              context.fillStyle = '#30ff30';
              context.fill();
            });
          });

          // Process emotions
          const expressions = resizedDetections[0].expressions;
          const maxEmotion = Object.entries(expressions).reduce((a, b) =>
            a[1] > b[1] ? a : b
          )[0];
          
          setEmotion(maxEmotion);
          
          if (maxEmotion === "sad") {
            const currentTime = Date.now();
            if (currentTime - lastCaptureTime >= captureInterval) {
              captureSadPhoto();
              lastCaptureTime = currentTime;
            }
          }
        }

        setFaceDetected(resizedDetections.length > 0);
      } catch (error) {
        console.error("Detection error:", error);
      }

      detectionRef.current = requestAnimationFrame(detect);
    };

    detect();
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedPhoto(canvas.toDataURL("image/png"));
  };

  return (
    <div className="p-4 relative">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          <p className="ml-2 text-gray-200">Loading models...</p>
        </div>
      ) : cameraError ? (
        <div className="flex items-center justify-center h-64 text-red-400">
          <AlertCircle className="h-6 w-6 mr-2" />
          <p>{cameraError}</p>
        </div>
      ) : (
        <div className="relative">
          <div className="relative w-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full aspect-video bg-gray-900 rounded-lg border-2 border-blue-200"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{ pointerEvents: 'none' }}
            />
          </div>
          {faceDetected && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-sm flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Face Detected
            </div>
          )}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-gray-200">
                Current Emotion: <span className="font-semibold capitalize">{emotion}</span>
              </p>
            </div>
          </div>
          
          {capturedPhoto && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Manual Capture:</h3>
              <img
                src={capturedPhoto}
                alt="Captured"
                className="w-48 h-auto rounded-lg border-2 border-blue-200"
              />
            </div>
          )}
          
          {sadPhotos.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Sad Emotion Captures:</h3>
              <div className="grid grid-cols-3 gap-4">
                {sadPhotos.map((photo) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.url}
                      alt={`Sad emotion at ${photo.timestamp}`}
                      className="w-full rounded-lg border-2 border-blue-200"
                    />
                    <p className="text-sm text-gray-300 mt-1">{photo.timestamp}</p>
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