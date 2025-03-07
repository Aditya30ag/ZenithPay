import React, { useState, useEffect, useRef } from "react";
import { X } from 'lucide-react';

const AutoSpeechComponent = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const dotRefs = useRef([]);

  // Load available female voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // First try to find a female English voice
        const femaleEnglishVoice = voices.find(
          (voice) => voice.lang.includes("en-") && voice.name.toLowerCase().includes("female")
        );
        
        // If no voice with "female" in the name, try common female voice names
        const commonFemaleVoices = voices.filter(
          (voice) => voice.name.toLowerCase().includes("samantha")
        );
        
        // Set voice preference in this order: explicit female, common female name, or any English
        setSelectedVoice(
          femaleEnglishVoice || 
          (commonFemaleVoices.length > 0 ? commonFemaleVoices[0] : null) || 
          voices.find((voice) => voice.lang.includes("en-")) || 
          voices[0]
        );
      }
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Check localStorage for new alerts every second
  useEffect(() => {
    const checkForAlerts = setInterval(() => {
      const savedAlert = localStorage.getItem("alert");
      if (savedAlert && savedAlert !== alertText) {
        setAlertText(savedAlert);
        setIsVisible(true);
        setIsExpanded(true);
        speakText(savedAlert);
      }
    }, 1000);

    return () => clearInterval(checkForAlerts);
  }, [alertText]);

  // Function to handle speech
  const speakText = (textToSpeak) => {
    if (!("speechSynthesis" in window)) {
      console.error("Browser does not support text-to-speech.");
      return;
    }

    if (!textToSpeak || textToSpeak.trim() === "") return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      // Make voice more feminine with slightly higher pitch if it's not explicitly female
      if (!selectedVoice.name.toLowerCase().includes("female")) {
        utterance.pitch = 1.2; // Slightly higher pitch for more feminine sound
      } else {
        utterance.pitch = 1;
      }
    }
    
    utterance.rate = 0.7;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      localStorage.removeItem("alert");
      setAlertText("");
      setTimeout(() => {
        setIsExpanded(false);
        setTimeout(() => setIsVisible(false), 300);
      }, 1000);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      localStorage.removeItem("alert");
      setAlertText("");
      setTimeout(() => {
        setIsExpanded(false);
        setTimeout(() => setIsVisible(false), 300);
      }, 1000);
    };

    window.speechSynthesis.speak(utterance);
  };
  
  // Function to manually dismiss the alert
  const dismissAlert = () => {
    localStorage.removeItem("alert");
    setAlertText("");
    setIsExpanded(false);
    setTimeout(() => setIsVisible(false), 300);
    window.speechSynthesis.cancel();
  };
  
  // Toggle expansion
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isVisible && !isSpeaking) return null;

  return (
    <div
      className={`fixed top-16 right-4 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div 
        className={`relative flex flex-col items-center p-2 bg-gray-900/90 backdrop-blur-sm shadow-lg rounded-lg border border-gray-700/50 transition-all duration-300 ${
          isExpanded ? "w-64" : "w-auto"
        }`}
      >
        {/* Top bar with icon and close button */}
        <div className="w-full flex items-center justify-between mb-1">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={toggleExpand}
          >
            {/* Speech Icon */}
            <div className="w-8 h-8 flex items-center justify-center bg-gray-800/80 rounded-full shadow-sm">
              <svg
                className={`w-4 h-4 ${
                  isSpeaking ? "text-blue-400 animate-pulse" : "text-gray-300"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                ></path>
              </svg>
            </div>
            
            {/* Dots animation - only show when speaking */}
            {isSpeaking && (
              <div className="flex ml-2 space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={`dot-${i}`}
                    ref={(el) => (dotRefs.current[i] = el)}
                    className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>
          
          {/* Close Button */}
          <button 
            onClick={dismissAlert}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Dismiss Alert"
          >
            <X size={14} />
          </button>
        </div>

        {/* Expandable content */}
        {isExpanded && (
          <div className="w-full transition-all duration-300 overflow-hidden">
            {/* Voice name in tiny text */}
            {selectedVoice && (
              <div className="text-xs text-gray-400 text-center mt-1 mb-1">
                {selectedVoice.name.length > 25 
                  ? selectedVoice.name.substring(0, 25) + "..." 
                  : selectedVoice.name}
              </div>
            )}

            {/* Speaking status */}
            {isSpeaking && (
              <div className="text-xs text-blue-400 font-medium text-center animate-pulse">
                Speaking...
              </div>
            )}

            {/* Alert Text */}
            {alertText && (
              <div className="mt-2 bg-gray-800/70 p-2 rounded text-xs overflow-auto max-h-24">
                <p className="text-gray-200">{alertText}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoSpeechComponent;