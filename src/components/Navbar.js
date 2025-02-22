import { Bell } from "lucide-react";

const Navbar = ({ logout }) => {
  const handleonlogout=()=>{
    localStorage.removeItem("token");
    localStorage.removeItem("otpToken");
    localStorage.removeItem("phone");
    localStorage.removeItem("id");
    localStorage.removeItem("fullname");
    window.location.reload();
  }
  return (
    <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800 shadow-md">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Brand Title */}
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text tracking-wide">
          My Accounts
        </h1>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button className="relative p-2 text-slate-400 hover:text-blue-400 transition duration-300">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"></span>
          </button>

          {/* Quick Transfer Button */}
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg text-sm transition duration-300">
            Quick Transfer
          </button>

          {/* Logout Button */}
          <button
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg text-sm transition duration-300"
            onClick={handleonlogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
