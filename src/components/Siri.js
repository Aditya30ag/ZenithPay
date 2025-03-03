import { useEffect, useState, useRef } from "react";

const useVoiceAssistant = ({ sendDataToParent }) => {
  const [isListening, setIsListening] = useState(true); // Always start listening for wake word
  const [isActivated, setIsActivated] = useState(false);
  const [command, setCommand] = useState("");
  const [animation, setAnimation] = useState(false);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const isRecognitionActiveRef = useRef(false);

  // Function to handle the "dashboard" command separately
  const handleDashboardCommand = () => {
    console.log("DASHBOARD COMMAND DETECTED!");
    speak("Dashboard opened.");
    sendDataToParent("Dashboard");
    console.log("Data sent to parent.");
  };
  
  const handleTransactionMapCommand = () => {
    console.log("TransactionMap COMMAND DETECTED!");
    speak("TransactionMap opened.");
    sendDataToParent("TransactionMap");
    console.log("Data sent to parent.");
  };
  
  const handleFrauddetectionCommand = () => {
    console.log("Frauddetection COMMAND DETECTED!");
    speak("Frauddetection opened.");
    sendDataToParent("Frauddetection");
    console.log("Data sent to parent.");
  };

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.error("Your browser does not support Speech Recognition");
      return;
    }

    if (!recognitionRef.current) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        isRecognitionActiveRef.current = true;
        console.log("Recognition started...");
      };

      recognitionRef.current.onend = () => {
        isRecognitionActiveRef.current = false;
        console.log("Recognition stopped.");
        if (isListening) {
          setTimeout(() => startRecognition(), 500);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Recognition error:", event.error);
        isRecognitionActiveRef.current = false;
        if (isListening) {
          setTimeout(() => startRecognition(), 1000);
        }
      };

      recognitionRef.current.onresult = (event) => {
        const results = event.results;
        const latestResult = results[results.length - 1];
        
        // Only process final results to avoid partial transcripts
        if (!latestResult.isFinal) return;
        
        const transcript = latestResult[0].transcript.toLowerCase().trim();
        console.log("Transcript:", transcript);
        
        // Check for direct commands with "hey siri" prefix
        if (transcript.includes("hey siri") && transcript.includes("dashboard")) {
          handleDashboardCommand();
          return;
        }
        
        if (transcript.includes("hey siri") && transcript.includes("map")) {
          handleTransactionMapCommand();
          return;
        }
        
        if (transcript.includes("hey siri") && (transcript.includes("frauddetails") || 
            transcript.includes("fraud details") || transcript.includes("fraud"))) {
          handleFrauddetectionCommand();
          return;
        }

        // Activate assistant if "hey siri" is detected
        if (!isActivated && transcript.includes("hey siri")) {
          activateAssistant();
          return;
        }

        // Process other commands only when assistant is active
        if (isActivated) {
          setCommand(transcript);
          handleCommand(transcript);
        }
      };
    }

    const startRecognition = () => {
      if (recognitionRef.current && !isRecognitionActiveRef.current) {
        try {
          recognitionRef.current.start();
          console.log("Starting recognition...");
        } catch (error) {
          console.error("Failed to start recognition:", error);
          isRecognitionActiveRef.current = false;
        }
      }
    };

    const stopRecognition = () => {
      if (recognitionRef.current && isRecognitionActiveRef.current) {
        try {
          recognitionRef.current.stop();
          console.log("Stopping recognition...");
        } catch (error) {
          console.error("Failed to stop recognition:", error);
        }
      }
    };

    // Start listening when component mounts or when isListening changes to true
    if (isListening && !isRecognitionActiveRef.current) {
      startRecognition();
    } 
    // Stop listening when isListening changes to false
    else if (!isListening && isRecognitionActiveRef.current) {
      stopRecognition();
    }

    return () => {
      if (recognitionRef.current && isRecognitionActiveRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error("Failed to stop recognition during cleanup:", error);
        }
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isListening]);

  const activateAssistant = () => {
    if (isActivated) return; // Prevent duplicate activation
    console.log("Assistant activated! ('Hey Siri' detected)");
    setIsActivated(true);
    setAnimation(true);

    playActivationSound();
    speak("Yes, how can I help you?");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.log("Assistant deactivated due to inactivity, but still listening for wake word");
      setIsActivated(false);
      setAnimation(false);
      // We don't turn off listening, so it can be reactivated with the wake word
    }, 10000); // 10 seconds
  };

  const playActivationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.error("Failed to play activation sound:", error);
    }
  };

  const handleCommand = (command) => {
    if (!isActivated) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.log("Assistant deactivated due to inactivity, but still listening for wake word");
      setIsActivated(false);
      setAnimation(false);
      // We keep listening for the wake word
    }, 8000);

    console.log("Processing command:", command);

    if (command.includes("hello")) {
      speak("Hello! How can I assist you?");
    } else if (command.includes("time")) {
      speakOnce(`The time is ${new Date().toLocaleTimeString()}`);
    } else if (command.includes("dashboard")) {
      handleDashboardCommand();
    } else if (command.includes("map")) {
      handleTransactionMapCommand();
    } else if (command.includes("fraud") || command.includes("frauddetails")) {
      handleFrauddetectionCommand();
    } else if (command.includes("weather")) {
      speakOnce("I'm sorry, I don't have access to weather information right now.");
    } else if (command.includes("thank you") || command.includes("thanks")) {
      speakOnce("You're welcome!");
      setTimeout(() => {
        setIsActivated(false);
        setAnimation(false);
        // Keep listening for wake word
      }, 2000);
    } else if (command.includes("stop") || command.includes("bye")) {
      speakOnce("Goodbye for now!");
      setIsActivated(false);
      setAnimation(false);
      // Keep listening for wake word
    }
  };

  const speakOnce = (text) => {
    if (window.speechSynthesis.speaking) return;
    speak(text);
  };

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.name.includes("Samantha") ||
      voice.name.includes("Female") ||
      voice.name.includes("Google US English Female")
    );

    if (preferredVoice) {
      speech.voice = preferredVoice;
    }

    window.speechSynthesis.speak(speech);
  };

  const toggleListening = () => {
    setIsListening((prev) => !prev);
  };

  return {
    isListening,
    isActivated,
    animation,
    command,
    setIsListening,
    toggleListening,
    speak,
  };
};

export default useVoiceAssistant;