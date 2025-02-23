import React, { useState, useEffect } from "react";

export default function Transfer() {
  const [formData, setFormData] = useState({
    senderAccount: "",
    receiverAccount: "",
    amount: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);
  const [error, setError] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [savedBeneficiaries, setSavedBeneficiaries] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  useEffect(() => {
    const storedSenderAccount = localStorage.getItem("senderAccount");
    if (storedSenderAccount) {
      setFormData((prev) => ({ ...prev, senderAccount: storedSenderAccount }));
      
    }
  }, []);

  

  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const validateForm = () => {
    if (!formData.senderAccount || !formData.receiverAccount || !formData.amount) {
      setError("All fields are required.");
      return false;
    }

    if (formData.senderAccount === formData.receiverAccount) {
      setError("Sender and receiver cannot be the same.");
      return false;
    }
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.");
      return false;
    }

    if (amount > 50000) {
      setError("Amount exceeds daily transfer limit of ₹50,000.");
      return false;
    }

    return true;
  };

  const handleQuickAmount = (amount) => {
    setFormData(prev => ({
      ...prev,
      amount: amount.toString()
    }));
  };

  const handleBeneficiarySelect = (beneficiary) => {
    setFormData(prev => ({
      ...prev,
      receiverAccount: beneficiary.accountNumber
    }));
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setShowConfirmation(true);
  };
  useEffect(() => {
    let timeout;
    if (responseMessage) {
      timeout = setTimeout(() => {
        setResponseMessage(null);
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [responseMessage]);
  const confirmTransfer = async () => {
    setIsLoading(true);
    setResponseMessage(null);
    setError(null);

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
          description: formData.description || "Transfer"
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

      setFormData({ 
        senderAccount: formData.senderAccount, 
        receiverAccount: "", 
        amount: "",
        description: "" 
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="min-h-full py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Transfer Form */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-8 text-white text-center">Transfer Money</h2>

            <form onSubmit={handleTransfer} className="space-y-6">
              {/* Saved Beneficiaries */}
              {savedBeneficiaries.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quick Select Beneficiary</label>
                  <div className="flex flex-wrap gap-2">
                    {savedBeneficiaries.map((beneficiary) => (
                      <button
                        key={beneficiary.accountNumber}
                        type="button"
                        onClick={() => handleBeneficiarySelect(beneficiary)}
                        className="px-3 py-1 bg-gray-700 rounded-full text-sm text-white hover:bg-gray-600"
                      >
                        {beneficiary.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">To Account</label>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter amount to transfer"
                  required
                />
                {/* Quick Amount Buttons */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleQuickAmount(amount)}
                      className="px-3 py-1 bg-gray-700 rounded-full text-sm text-white hover:bg-gray-600"
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter transfer description"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </span>
                ) : (
                  "Transfer Money"
                )}
              </button>
            </form>

            {responseMessage && (
            <div className="mt-4 p-3 bg-green-600 text-white text-center rounded-md">
              ✅ {`₹${responseMessage.amount} transferred from ${responseMessage.sender} to ${responseMessage.receiver}`}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-600 text-white text-center rounded-md">
              ❌ {error}
            </div>
          )}
          </div>

          {/* Recent Transactions */}
          
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Transfer</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to transfer ₹{formData.amount} to account {formData.receiverAccount}?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmTransfer}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}