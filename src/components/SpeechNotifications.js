import React, { useState, useEffect, useRef } from "react";

const AutoSpeechComponent = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(null);
  const circlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  // Dynamic colors for animated circles
  const colorThemes = [
    "from-indigo-500 to-purple-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-lime-500",
    "from-red-500 to-pink-500",
  ];
  const selectedTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const englishVoice = voices.find((voice) => voice.lang.includes("en-"));
        setSelectedVoice(englishVoice || voices[0]);
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
        speakText(savedAlert);
      }
    }, 1000);

    return () => {
      clearInterval(checkForAlerts);
    };
  }, [alertText]);

  // Function to handle speech with slower rate
  const speakText = (textToSpeak) => {
    if (!("speechSynthesis" in window)) {
      console.error("Browser does not support text-to-speech.");
      return;
    }

    if (!textToSpeak || textToSpeak.trim() === "") return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 0.6;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      localStorage.removeItem("alert");
      setAlertText("");
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      localStorage.removeItem("alert");
      setAlertText("");
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col items-center justify-center text-white">
      {/* Gemini-style Speaking Indicator */}
      <div className="relative w-24 h-24 flex items-center justify-center z-500">
        {/* Dynamic animated circles */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            ref={(el) => (circlesRef.current[i] = el)}
            className={`absolute rounded-full transition-all duration-500 z-500 ${
              isSpeaking ? `bg-gradient-to-r ${selectedTheme}` : "bg-gray-700"
            }`}
            style={{
              width: `${40 - i * 8}px`,
              height: `${40 - i * 8}px`,
              opacity: isSpeaking ? 0.7 : 0.3,
              transform: "scale(0.8)",
              boxShadow: isSpeaking ? "0 0 15px rgba(255, 255, 255, 0.5)" : "none",
              left: `${50 + Math.cos(i * Math.PI / 2) * 10}%`,
              top: `${50 + Math.sin(i * Math.PI / 2) * 10}%`,
              transformOrigin: "center",
              zIndex: 4 - i,
            }}
          ></div>
        ))}

        {/* Central icon */}
        <div className="relative z-10 bg-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-700 transition duration-300">
          <svg
            className={`w-7 h-7 ${isSpeaking ? "text-blue-400" : "text-gray-500"}`}
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
      </div>

   
     
    </div>
  );
};

export default AutoSpeechComponent;
