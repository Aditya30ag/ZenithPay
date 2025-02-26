import React, { useEffect, useState, useRef } from 'react';

const AttentionHeatmap = () => {
  const [clicks, setClicks] = useState([]);
  const [moves, setMoves] = useState([]);
  const [scrolls, setScrolls] = useState([]);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [isRecording, setIsRecording] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapType, setHeatmapType] = useState('clicks');
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.7);
  const [heatmapRadius, setHeatmapRadius] = useState(15);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef(null);
  const recordingTimeRef = useRef(0);
  const throttleTimerRef = useRef(null);

  // Set viewport size on mount
  useEffect(() => {
    setViewportSize({
      width: window.innerWidth,
      height: document.documentElement.scrollHeight
    });

    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: document.documentElement.scrollHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // Start recording timer
    const timer = setInterval(() => {
      recordingTimeRef.current += 1;
    }, 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
    };
  }, []);

  // Throttle function to limit the frequency of move events
  const throttle = (callback, delay) => {
    if (throttleTimerRef.current) return;
    throttleTimerRef.current = setTimeout(() => {
      callback();
      throttleTimerRef.current = null;
    }, delay);
  };

  // Track cursor position for coordinate display
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.pageX, y: e.pageY });
      
      // Get element under cursor
      if (showCoordinates) {
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element) {
          const rect = element.getBoundingClientRect();
          const tagName = element.tagName.toLowerCase();
          const classes = Array.from(element.classList).join(' ');
          const id = element.id;
          
          
        }
      }
    };

    if (showCoordinates) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [showCoordinates]);

  // Set up event listeners
  useEffect(() => {
    if (!isRecording) return;

    const handleClick = (e) => {
      // Get element info on click
      const element = document.elementFromPoint(e.clientX, e.clientY);
      let elementData = null;
      
      if (element) {
        const rect = element.getBoundingClientRect();
        elementData = {
          tagName: element.tagName.toLowerCase(),
          id: element.id || null,
          classes: Array.from(element.classList).join(' ') || null,
          text: element.textContent?.substring(0, 30) || null,
          dimensions: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          }
        };
      }
      
      const newClick = {
        x: e.pageX,
        y: e.pageY,
        relativeX: Math.round((e.pageX / viewportSize.width) * 100) / 100,
        relativeY: Math.round((e.pageY / viewportSize.height) * 100) / 100,
        time: recordingTimeRef.current,
        elementData
      };
      setClicks(prev => [...prev, newClick]);
    };

    const handleMove = (e) => {
      throttle(() => {
        const newMove = {
          x: e.pageX,
          y: e.pageY,
          relativeX: Math.round((e.pageX / viewportSize.width) * 100) / 100,
          relativeY: Math.round((e.pageY / viewportSize.height) * 100) / 100,
          time: recordingTimeRef.current
        };
        setMoves(prev => [...prev, newMove]);
      }, 100); // Throttle to collect data every 100ms
    };

    const handleScroll = () => {
      throttle(() => {
        const newScroll = {
          x: window.scrollX,
          y: window.scrollY,
          relativeX: Math.round((window.scrollX / viewportSize.width) * 100) / 100,
          relativeY: Math.round((window.scrollY / viewportSize.height) * 100) / 100,
          time: recordingTimeRef.current,
          viewport: {
            visibleTop: window.scrollY,
            visibleBottom: window.scrollY + window.innerHeight
          }
        };
        setScrolls(prev => [...prev, newScroll]);
      }, 100);
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isRecording, viewportSize]);

  // Draw heatmap when showing
  useEffect(() => {
    if (!showHeatmap || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = viewportSize.width;
    canvas.height = viewportSize.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Choose data source based on type
    let data;
    switch (heatmapType) {
      case 'clicks':
        data = clicks;
        break;
      case 'moves':
        data = moves;
        break;
      case 'scrolls':
        data = scrolls;
        break;
      default:
        data = clicks;
    }
    
    // Create composite operation for better blending
    ctx.globalCompositeOperation = 'screen';
    
    // Draw points with improved gradient
    data.forEach(point => {
      const radius = heatmapType === 'clicks' ? heatmapRadius * 1.2 : heatmapRadius;
      
      // Create custom gradient based on heatmap type
      const gradient = ctx.createRadialGradient(
        point.x, point.y, radius * 0.1,
        point.x, point.y, radius
      );
      
      if (heatmapType === 'clicks') {
        // Vibrant red for clicks
        gradient.addColorStop(0, `rgba(255, 0, 0, ${heatmapOpacity + 0.2})`);
        gradient.addColorStop(0.4, `rgba(255, 50, 0, ${heatmapOpacity})`);
        gradient.addColorStop(0.8, `rgba(255, 100, 0, ${heatmapOpacity - 0.2})`);
        gradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
      } else if (heatmapType === 'moves') {
        // Cyan/blue for moves
        gradient.addColorStop(0, `rgba(0, 200, 255, ${heatmapOpacity})`);
        gradient.addColorStop(0.4, `rgba(65, 105, 225, ${heatmapOpacity - 0.1})`);
        gradient.addColorStop(0.8, `rgba(30, 144, 255, ${heatmapOpacity - 0.3})`);
        gradient.addColorStop(1, 'rgba(100, 149, 237, 0)');
      } else {
        // Green for scrolls
        gradient.addColorStop(0, `rgba(50, 205, 50, ${heatmapOpacity})`);
        gradient.addColorStop(0.5, `rgba(50, 205, 100, ${heatmapOpacity - 0.2})`);
        gradient.addColorStop(1, 'rgba(50, 205, 150, 0)');
      }
      
      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Add density enhancer where multiple points overlap
    if (data.length > 10) {
      const densityMap = {};
      const gridSize = 20; // Size of the grid cells
      
      // Create density grid
      data.forEach(point => {
        const gridX = Math.floor(point.x / gridSize);
        const gridY = Math.floor(point.y / gridSize);
        const key = `${gridX},${gridY}`;
        
        if (!densityMap[key]) {
          densityMap[key] = 1;
        } else {
          densityMap[key]++;
        }
      });
      
      // Draw density highlights
      for (const key in densityMap) {
        if (densityMap[key] > 3) { // Only highlight areas with significant overlap
          const [gridX, gridY] = key.split(',').map(Number);
          const centerX = (gridX + 0.5) * gridSize;
          const centerY = (gridY + 0.5) * gridSize;
          const intensity = Math.min(densityMap[key] / 10, 1); // Normalize intensity
          
          const densityGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, gridSize * 1.5
          );
          
          if (heatmapType === 'clicks') {
            densityGradient.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.7})`);
            densityGradient.addColorStop(0.5, `rgba(255, 0, 0, ${intensity * 0.5})`);
          } else if (heatmapType === 'moves') {
            densityGradient.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.5})`);
            densityGradient.addColorStop(0.5, `rgba(0, 150, 255, ${intensity * 0.4})`);
          } else {
            densityGradient.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.5})`);
            densityGradient.addColorStop(0.5, `rgba(0, 200, 100, ${intensity * 0.4})`);
          }
          
          densityGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.beginPath();
          ctx.fillStyle = densityGradient;
          ctx.arc(centerX, centerY, gridSize * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
  }, [showHeatmap, heatmapType, clicks, moves, scrolls, viewportSize, heatmapOpacity, heatmapRadius]);

  // Toggle recording
  const toggleRecording = () => {
    setIsRecording(isRecording);
  };

  // Toggle heatmap visibility
  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
  };

  // Toggle coordinates display
  const toggleCoordinates = () => {
    setShowCoordinates(!showCoordinates);
  };

  // Export data as JSON
  const exportData = () => {
    const data = {
      metadata: {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        recordingTime: recordingTimeRef.current,
        viewportSize,
        totalClicks: clicks.length,
        totalMoves: moves.length,
        totalScrolls: scrolls.length
      },
      clicks,
      moves,
      scrolls
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `heatmap-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="right-4 z-50">
      {showHeatmap && (
        <canvas 
          ref={canvasRef}
          className="fixed top-0 left-0 min-w-screen min-h-screen pointer-events-none z-40"
        />
      )}
      
      {showCoordinates && (
        <div className="fixed top-4 left-4 bg-black/80 backdrop-blur-sm border border-slate-700 rounded-lg p-2 text-xs text-white z-50">
          <div className="text-cyan-400 font-bold">Cursor Position</div>
          <div>X: {cursorPosition.x}px ({Math.round(cursorPosition.x / viewportSize.width * 100)}%)</div>
          <div>Y: {cursorPosition.y}px ({Math.round(cursorPosition.y / viewportSize.height * 100)}%)</div>
          
          
        </div>
      )}
      
      <div className="bg-black/80 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-cyan-400 font-bold">Tracker</h3>
            <div className="text-white text-sm">
              {formatTime(recordingTimeRef.current)}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex flex-col items-center p-2 bg-black/40 rounded border border-slate-800">
              <span className="text-red-400 font-medium">Clicks</span>
              <span className="text-white">{clicks.length}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-black/40 rounded border border-slate-800">
              <span className="text-blue-400 font-medium">Moves</span>
              <span className="text-white">{moves.length}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-black/40 rounded border border-slate-800">
              <span className="text-green-400 font-medium">Scrolls</span>
              <span className="text-white">{scrolls.length}</span>
            </div>
          </div>
          
          {showHeatmap && (
            <>
              <div className="flex justify-center space-x-2 mt-2">
                <button
                  onClick={() => setHeatmapType('clicks')}
                  className={`px-2 py-1 rounded text-xs ${heatmapType === 'clicks' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-black/40 text-slate-300'}`}
                >
                  Clicks
                </button>
                <button
                  onClick={() => setHeatmapType('moves')}
                  className={`px-2 py-1 rounded text-xs ${heatmapType === 'moves' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'bg-black/40 text-slate-300'}`}
                >
                  Moves
                </button>
                <button
                  onClick={() => setHeatmapType('scrolls')}
                  className={`px-2 py-1 rounded text-xs ${heatmapType === 'scrolls' ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' : 'bg-black/40 text-slate-300'}`}
                >
                  Scrolls
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Opacity: {heatmapOpacity.toFixed(1)}</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={heatmapOpacity}
                    onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded appearance-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Radius: {heatmapRadius}</label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={heatmapRadius}
                    onChange={(e) => setHeatmapRadius(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded appearance-none"
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="grid grid-cols-3 gap-2 mt-2">
            <button
              onClick={toggleRecording}
              className={`px-2 py-1.5 rounded text-xs font-medium ${isRecording ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
            >
              {isRecording ? 'Pause' : 'Record'}
            </button>
            
            <button
              onClick={toggleHeatmap}
              className={`px-2 py-1.5 rounded text-xs font-medium ${showHeatmap ? 'bg-amber-500 text-white' : 'bg-slate-600 text-white'}`}
            >
              {showHeatmap ? 'Hide Map' : 'Show Map'}
            </button>
            
            <button
              onClick={toggleCoordinates}
              className={`px-2 py-1.5 rounded text-xs font-medium ${showCoordinates ? 'bg-violet-500 text-white' : 'bg-slate-600 text-white'}`}
            >
              {showCoordinates ? 'Hide XY' : 'Show XY'}
            </button>
            
            <button
              onClick={exportData}
              className="px-2 py-1.5 rounded bg-gradient-to-r from-cyan-400 to-violet-500 text-white text-xs font-medium col-span-3"
            >
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttentionHeatmap;