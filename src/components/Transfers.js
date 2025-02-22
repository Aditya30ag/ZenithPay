import React, { useState, useEffect } from "react";

export default function Transfer() {
  const [formData, setFormData] = useState({
    senderAccount: "",
    receiverAccount: "",
    amount: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);
  const [error, setError] = useState(null);

  // Auto-dismiss success message
  useEffect(() => {
    let timeout;
    if (responseMessage) {
      timeout = setTimeout(() => {
        setResponseMessage(null);
      }, 5000); // Dismiss after 5 seconds
    }
    return () => clearTimeout(timeout);
  }, [responseMessage]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponseMessage(null);
    setError(null);

    if (!formData.senderAccount || !formData.receiverAccount || !formData.amount) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }

    if (formData.senderAccount === formData.receiverAccount) {
      setError("Sender and receiver cannot be the same.");
      setIsLoading(false);
      return;
    }

    if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderAccountNumber: formData.senderAccount,
          receiverAccountNumber: formData.receiverAccount,
          amount: parseFloat(formData.amount),
        }),
      });

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data || "Transfer failed. Please try again.");
      }

      const match = data.match(/([\d.]+) transferred successfully from (\d+) to (\d+)/);
      if (match) {
        setResponseMessage({
          success: true,
          amount: match[1],
          sender: match[2],
          receiver: match[3],
        });
      } else {
        throw new Error("Unexpected response format.");
      }

      setFormData({ senderAccount: "", receiverAccount: "", amount: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold mb-8 text-white text-center">
            Transfer Money
          </h2>

          <form onSubmit={handleTransfer} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                From Account
              </label>
              <input
                type="text"
                name="senderAccount"
                value={formData.senderAccount}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter sender's account number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                To Account
              </label>
              <input
                type="text"
                name="receiverAccount"
                value={formData.receiverAccount}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter receiver's account number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter amount to transfer"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                "Transfer Money"
              )}
            </button>
          </form>

          {/* Success Message */}
          {responseMessage && responseMessage.success && (
            <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-200 animate-fade-in">
              <p className="font-semibold text-lg mb-2">✅ Transfer Successful!</p>
              <div className="space-y-1">
                <p>Amount: ₹{responseMessage.amount}</p>
                <p>From: {responseMessage.sender}</p>
                <p>To: {responseMessage.receiver}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
              ❌ {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}