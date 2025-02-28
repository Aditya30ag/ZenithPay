import { Bell } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth
} from "@clerk/clerk-react";
import { ClerkProvider } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import AutoSpeechComponent from './SpeechNotifications';
import ConsolePopup from "./Notifications";

const Navbar = ({ logout }) => {
  const [hasTokens, setHasTokens] = useState(false);

  useEffect(() => {
    // Check if both token and otpToken exist in localStorage
    const token = localStorage.getItem("token");
    const otpToken = localStorage.getItem("otpToken");
    setHasTokens(!!token && !!otpToken);
  }, []);

  const handleonlogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("otpToken");
    localStorage.removeItem("phone");
    localStorage.removeItem("id");
    localStorage.removeItem("fullname");
    window.location.reload();
  };
  
  const PUBLISHABLE_KEY = "pk_test_b24taG9nLTUzLmNsZXJrLmFjY291bnRzLmRldiQ";

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/" >
      <div className="sticky top-4 z-50 ">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Brand Title */}
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text tracking-wide">
            
          </h1>

          {/* Actions */}
          <div className="flex items-center gap-4">
          <AutoSpeechComponent/>
            {/* Notification Bell */}
            
            <ConsolePopup/>

            {/* Authentication Section */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition duration-300">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-3">
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8"
                    }
                  }}
                />
                {hasTokens && (
                  <button
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg text-sm transition duration-300"
                    onClick={handleonlogout}
                  >
                    Logout
                  </button>
                )}
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </ClerkProvider>
  );
};

export default Navbar;