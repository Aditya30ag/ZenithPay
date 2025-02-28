import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";

const ConsolePopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [logs, setLogs] = useState([]);
  const buttonRef = useRef(null);

  useEffect(() => {
    const originalConsoleLog = console.log;

    console.log = (...args) => {
      originalConsoleLog(...args);
      setLogs((prevLogs) => [...prevLogs, args.join(" ")]);
    };

    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        ref={buttonRef}
        className="relative p-2 text-slate-400 hover:text-blue-400 transition duration-300"
        onClick={() => setShowPopup((prev) => !prev)}
      >
        <Bell className="w-6 h-6" />
        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"></span>
      </button>

      {/* Animated Console Messages Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.5,
              x: buttonRef.current?.offsetLeft || 0,
              y: buttonRef.current?.offsetTop || 0,
            }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-12 right-12 bg-black p-6 rounded-xl shadow-lg w-96 border border-gray-800 z-50"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
            >
              ✖
            </button>

            <h2 className="text-lg font-bold text-white mb-3">Console Logs</h2>
            <div className="h-28 overflow-auto p-2 bg-gray-900 text-sm text-gray-300 rounded-lg border border-gray-700">
              {logs.length === 0 ? (
                <p className="text-gray-500">No console logs yet...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="border-b border-gray-700 py-1">
                    {log}
                  </div>
                ))
              )}
            </div>

            {/* Clear Logs Button */}
            <button
              onClick={() => setLogs([])}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Clear Logs
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConsolePopup;