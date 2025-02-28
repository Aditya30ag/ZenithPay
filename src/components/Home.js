import React, { useState } from "react";

import {
  LayoutDashboard,
  CreditCard,
  PieChart,
  Send,
  History,
  MapIcon
} from "lucide-react";
import Dashborad from "./Dashborad";
// import TidioChat from "./TidioChat";
import Account from "./Account";
import AnalyticsDashboard from "./Analytics";
import Transaction from "./Transactions";
import Transfers from "./Transfers";
import Navbar from "./Navbar";
import FraudDetectionDashboard from "./Frauddetection";
import AttentionHeatmap from "./HeatMap";
import TransactionMap from "./TranctionMap";

const ZenithDashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [accountData] = useState({
    balance: 52340.75,
    accountNumber: "1234567890",
    accountName: localStorage.getItem('fullname'),
    recentTransactions: [
      {
        id: 1,
        type: "credit",
        amount: 1500,
        description: "Salary Credit",
        date: "2025-02-08",
      },
      {
        id: 2,
        type: "debit",
        amount: 299,
        description: "Netflix Subscription",
        date: "2025-02-07",
      },
      {
        id: 3,
        type: "debit",
        amount: 45,
        description: "Starbucks Coffee",
        date: "2025-02-07",
      },
    ],
  });

  const [activeSection, setActiveSection] = useState("Dashboard");

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard},
    { name: "Accounts", icon: CreditCard},
    { name: "Transfers", icon: Send},
    { name: "Transactions", icon: History},
    { name: "Analytics", icon: PieChart},
    { name: "Frauddetection", icon: PieChart},
    { name: "TransactionMap", icon: MapIcon},
  ];

  const renderDashboard = () => {
    return <Dashborad accountData={accountData} />;
  };
  const renderAccount = () => {
    return <Account/>
  };
  const renderAnalytics = () => {
    return <AnalyticsDashboard/>
  };
  const renderTransactions = () => {
    return <Transaction/>
  };
  const renderTransfers = () => {
    return <Transfers/>
  };
  const renderFraudDetection = () => {
    return <FraudDetectionDashboard/>
  };
  const renderTransactionMap = () => {
    return <TransactionMap/>
  };

  const handleonclick = (e) => {
    setActiveSection(e.target.name);
  };

  return (
    <div className="min-h-screen text-slate-50 relative overflow-hidden">
      {/* Gooey Background */}
      <div className="fixed inset-0 z-0">
        <div className="hidden md:block h-[35vw] w-[35vw] absolute rounded-full bg-gradient-to-r from-blue-500 to-purple-500 top-[20%] left-[40%] blur-[120px] animate-[gooey_4s_ease-in-out_infinite_alternate]" />
        <div className="hidden md:block h-[24vw] w-[24vw] absolute rounded-full bg-gradient-to-r from-purple-500 to-emerald-500 top-[20%] left-[50%] blur-[100px] animate-[gooey_6s_ease-in-out_infinite_alternate-reverse]" />
      </div>
      <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-600 via-transparent to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-cyan-400 via-transparent to-transparent animate-pulse"></div>
        </div>
      {/* Content Container */}
      <div className="relative z-10">
        {/* Sidebar */}
        <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl transform transition-transform duration-300 rounded-r-2xl shadow-lg ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="h-full flex flex-col border-r border-slate-800 overflow-hidden rounded-r-2xl">
        {/* Logo */}
        <div className="p-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
            Zenith Pay
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 mt-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-slate-800">
  {navigation.map((item) => (
    <button
      onClick={handleonclick}
      name={item.name}
      key={item.name}
      className="group flex items-center px-4 py-3 text-slate-300 rounded-xl hover:bg-slate-800/50 transition-all duration-300 w-full text-left"
    >
      <item.icon className="w-5 h-5 mr-3 text-slate-400 group-hover:text-blue-400" />
      {item.name}
    </button>
  ))}
</nav>

        <AttentionHeatmap/>
        {/* Profile Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="relative p-4 bg-slate-900/80 backdrop-blur-sm rounded-xl flex items-center gap-3 shadow-md">
            <img
              src="/image1.png"
              alt="Profile"
              className="w-12 h-12 rounded-full border-2 border-blue-400 shadow-sm"
            />
            <div>
              <div className="text-sm font-medium text-white">
                {accountData.accountName}
              </div>
              <div className="text-xs text-slate-400">
                Account Holder Name
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

        {/* Main content */}
        <main className="md:pl-64">
          {/* Top bar */}
          <Navbar/>

          {/* Chatbot */}
          <div className="fixed bottom-4 right-4 z-10">
            <button
              onClick={() => setIsChatbotOpen(!isChatbotOpen)}
              className="fixed bottom-4 right-4 w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg"
            >
              {isChatbotOpen ? "❌" : "💬"}
            </button>

            {isChatbotOpen && (
              <div className="fixed bottom-16 right-4 z-50 bg-gray-900 rounded-xl shadow-lg p-4 w-96 h-[500px]">
                <iframe
                  src="https://www.chatbase.co/chatbot-iframe/WFstMZKdEyyuwbjxfxKei"
                  className="w-full h-full rounded-lg border border-gray-700 bg-slate-400"
                  frameBorder="0"
                ></iframe>
              </div>
            )}
          </div>
            
          {/* Page content */}
          <div className="p-6 space-y-6 relative">
            {activeSection === "Dashboard" && renderDashboard()}
            {activeSection === "Accounts" && renderAccount()}
            {activeSection === "Analytics" && renderAnalytics()}
            {activeSection === "Transactions" && renderTransactions()}
            {activeSection === "Transfers" && renderTransfers()}
            {activeSection === "Frauddetection" && renderFraudDetection()}
            {activeSection === "TransactionMap" && renderTransactionMap()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ZenithDashboard;
