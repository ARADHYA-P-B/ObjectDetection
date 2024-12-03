import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import axios from 'axios';
import './objectDetection.css'

function ObjectDetection() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load COCO-SSD model
  const loadModel = async () => {
    try {
      const loadedModel = await cocossd.load();
      setModel(loadedModel);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading model:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadModel();
  }, []);

  // Save detection to database
  const saveDetection = async (objectType, confidence) => {
    try {
      await axios.post('http://localhost:5000/api/detections/add', {
        objectType,
        confidence
      });
    } catch (error) {
      console.error("Error saving detection:", error);
    }
  };

  const detect = async () => {
    if (webcamRef.current && model && webcamRef.current.video.readyState === 4) {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      
      const predictions = await model.detect(video);

     
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, videoWidth, videoHeight); 
      
      
      const relevantDetections = [];

      // Draw detections
      predictions.forEach(prediction => {
        const objectClass = prediction.class.toLowerCase();
        if(['book', 'pen', 'paper'].includes(objectClass)) {
          const [x, y, width, height] = prediction.bbox;
          const confidence = Math.round(prediction.score * 100);
          
          // Draw rectangle
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
          
          // Draw label
          ctx.fillStyle = '#00FF00';
          ctx.font = '16px Arial';
          const label = `${prediction.class} ${confidence}%`;
          ctx.fillText(
            label,
            x,
            y > 10 ? y - 5 : 10
          );

          // Store detection
          relevantDetections.push({
            objectType: prediction.class,
            confidence: confidence
          });

          // Save to database if confidence is high enough
          if (confidence > 70) {
            saveDetection(prediction.class, confidence);
          }
        }
      });

      setDetections(relevantDetections);
    }
  };

  // Run detection at intervals
  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        detect();
      }, 100);
      return () => clearInterval(interval);
    }
  }, [model, isLoading]);

  return (
    <div className="object-detection-container">
      <div className="video-container">
        {isLoading ? (
          <div className="loading">Loading model...</div>
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              muted={true}
              audio={false}
              style={{
                position: 'absolute',
                marginLeft: 'auto',
                marginRight: 'auto',
                left: 0,
                right: 0,
                textAlign: 'center',
                zIndex: 9,
                width: 640,
                height: 480,
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                marginLeft: 'auto',
                marginRight: 'auto',
                left: 0,
                right: 0,
                textAlign: 'center',
                zIndex: 10,
                width: 640,
                height: 480,
              }}
            />
          </>
        )}
      </div>

      {/* Detection Results Panel */}
      <div className="detection-panel">
        <h2>Detected Objects</h2>
        <div className="detection-list">
          {detections.map((det, index) => (
            <div key={index} className="detection-item">
              <span className="object-type">{det.objectType}</span>
              <span className="confidence">{det.confidence}%</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .object-detection-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 20px;
          gap: 20px;
        }

        .video-container {
          position: relative;
          width: 640px;
          height: 480px;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          background: #f0f0f0;
          font-size: 1.2em;
        }

        .detection-panel {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
          min-width: 250px;
        }

        .detection-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .detection-item {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          background: #f8f8f8;
          border-radius: 4px;
        }

        .object-type {
          font-weight: bold;
        }

        .confidence {
          color: blue;
        }
      `}</style>
    </div>
  );
}

export default ObjectDetection;