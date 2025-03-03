import React from "react";
import useVoiceAssistant from "./Siri";

const SiriAssistant = ({sendDataToParent }) => {
  const { isListening, isActivated, animation, command, toggleListening } =
    useVoiceAssistant({sendDataToParent });

  return (
    <>
    { isActivated && (
    <div className="fixed top-1/2 left-1/2 flex flex-col items-center justify-center p-6 z-900">
      {/* Siri animation orb */}
      <div className="mb-12 relative">
        <div
          className={`relative flex items-center justify-center w-28 h-28 md:w-34 md:h-34 rounded-full transition-all duration-700 ${
            isActivated
              ? "scale-110 shadow-[0_0_80px_rgba(79,70,229,0.6)]"
              : "shadow-[0_0_40px_rgba(59,130,246,0.3)]"
          }`}
        >
          {/* Animated pulsing effect */}
          {!animation && (
            <>
              <div className="fixed inset-0 z-0">
                <div className="hidden md:block h-[5vw] w-[5vw] absolute rounded-full bg-gradient-to-r from-blue-500 to-purple-500 top-[20%] left-[40%] blur-[120px] animate-[gooey_4s_ease-in-out_infinite_alternate]" />
                <div className="hidden md:block h-[4vw] w-[4vw] absolute rounded-full bg-gradient-to-r from-purple-500 to-emerald-500 top-[20%] left-[50%] blur-[100px] animate-[gooey_6s_ease-in-out_infinite_alternate-reverse]" />
              </div>
            </>
          )}
          {/* Central circle - voice visualization */}
          {isActivated && (
            <div
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-white bg-opacity-20 backdrop-blur-md flex items-center justify-center overflow-hidden transition-all duration-300 ${
              isActivated ? "scale-110" : ""
            }`}
          >
            {isActivated && (
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-white rounded-full animate-bounce"
                    style={{
                      height: `${Math.random() * 16 + 8}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: `${Math.random() * 0.8 + 0.6}s`
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>)}
        </div>
      </div>

      {/* Status display - Only visible when activated */}
      {isActivated && (
        <div className="text-center mb-8 transition-all duration-300">
          <p
            className={`text-white text-xl mb-3 font-medium tracking-wide transition-all duration-300 ${
              isActivated ? "text-2xl text-purple-300" : ""
            }`}
          >
            I'm listening...
          </p>
          <div
            className={`max-w-md mx-auto px-6 py-3 rounded-lg backdrop-blur-sm ${
              command ? "bg-white bg-opacity-10" : "bg-transparent"
            } transition-all duration-500`}
          >
            <p className="text-gray-300 text-md">
              {command ? `"${command}"` : "Waiting for command..."}
            </p>
          </div>
          <p className="text-gray-400 text-sm mt-4 flex items-center justify-center space-x-2">
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                isListening ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            ></span>
            <span>Status: {isListening ? "Listening" : "Paused"}</span>
          </p>
        </div>
      )}
    </div>
  )}
    </>
  );
};

export default SiriAssistant;
