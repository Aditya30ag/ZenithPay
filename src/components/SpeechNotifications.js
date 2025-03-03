import React, { useState, useEffect, useRef } from "react";

const AutoSpeechComponent = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef(null);
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
          (voice) => 
            voice.name.toLowerCase().includes("samantha")
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
      setTimeout(() => setIsVisible(false), 1000);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      localStorage.removeItem("alert");
      setAlertText("");
      setTimeout(() => setIsVisible(false), 1000);
    };

    window.speechSynthesis.speak(utterance);
  };

  if (!isVisible && !isSpeaking) return null;

  return (
    <div
      className={`absolute top-20 right-6 z-50 transition-opacity duration-500 transform ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
      }`}
    >
      <div className="relative flex flex-col items-center p-3 bg-gray-900/80 backdrop-blur-lg shadow-lg rounded-xl border border-gray-700/50 transition-all duration-300">
        {/* Speech Indicator */}
        <div className="flex items-center space-x-2">
          <div className="relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-gray-800/80 rounded-full shadow-md transition-transform duration-300 hover:scale-105">
            {/* Female Voice Icon */}
            <svg
              className={`w-6 h-6 md:w-8 md:h-8 ${
                isSpeaking ? "text-blue-400 animate-pulse" : "text-gray-400"
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

          {/* Animated Dots */}
          <div className="flex space-x-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={`dot-${i}`}
                ref={(el) => (dotRefs.current[i] = el)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  isSpeaking ? "bg-blue-400 animate-bounce" : "bg-gray-600"
                }`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Voice indicator */}
        {selectedVoice && (
          <div className="mt-1 text-xs text-gray-400">
            {selectedVoice.name}
          </div>
        )}

        {/* Status text */}
        {isSpeaking && (
          <div className="mt-2 text-xs text-blue-400 font-medium animate-pulse">
            Speaking...
          </div>
        )}

        {/* Alert Text */}
        {alertText && (
          <div className="mt-2 max-w-xs bg-gray-800/70 p-3 rounded-lg shadow-md">
            <p className="text-gray-200 text-sm">{alertText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoSpeechComponent;