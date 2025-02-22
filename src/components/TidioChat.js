import React, { useEffect, useState } from "react";

const TidioChat = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    window.embeddedChatbotConfig = {
      chatbotId: "KQsKTS8teAiF4IAdFC8vP",
      domain: "www.chatbase.co",
    };

    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.async = true;
    script.defer = true;
    script.setAttribute("chatbotId", "WFstMZKdEyyuwbjxfxKei");
    script.setAttribute("domain", "www.chatbase.co");

    script.onload = () => setIsLoaded(true); // Detect when the script loads

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[700px] bg-gray-900 rounded-xl shadow-lg p-4">
      {!isLoaded ? (
        <p className="text-gray-400 animate-pulse bg-gray-900">Loading Chatbot...</p>
      ) : (
        <div className="w-full h-full bg-gray-900">
          <iframe
            src="https://www.chatbase.co/chatbot-iframe/WFstMZKdEyyuwbjxfxKei"
            className="w-full h-full min-h-[700px] rounded-lg border border-gray-700"
            frameBorder="0"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default TidioChat;
