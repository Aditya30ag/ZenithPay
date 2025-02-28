import React, { useState, useEffect } from "react";

const CookieBanner = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted cookies
    const cookiesAccepted = localStorage.getItem("cookiesAccepted");

    if (!cookiesAccepted) {
      const handleScroll = () => {
        if (window.scrollY >= 10) {
          setShowPopup(true);
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setShowPopup(false);
    window.location.reload();
  };

  const denyCookies = () => {
    localStorage.setItem("cookiesDenied", "true");
    setShowPopup(false);
  };

  return (
    showPopup && (
      <div className="fixed bottom-0 left-0 z-[9999] p-3 md:p-4 bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-r-lg shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-4 animate-fadeIn transition-all w-full sm:w-4/5 md:w-3/4 lg:w-1/2">
        <p className="text-xs sm:text-sm text-gray-300 mb-2 sm:mb-0">
          We use cookies to enhance your experience. By continuing, you agree to{" "}
          <a href="/privacypolicy" className="text-blue-400 hover:underline">
            privacy policy
          </a>
          .
        </p>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={denyCookies}
            className="bg-gray-700 text-white text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-gray-600 transition-all"
          >
            Deny
          </button>
          <button
            onClick={acceptCookies}
            className="bg-blue-500 text-white text-xs sm:text-sm font-medium px-3 sm:px-5 py-1.5 sm:py-2 rounded-md hover:bg-blue-600 transition-all"
          >
            Accept
          </button>
        </div>
      </div>
    )
  );
};

export default CookieBanner;