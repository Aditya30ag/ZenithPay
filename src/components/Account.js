import React, { useState, useEffect } from 'react';

export default function Account() {
  const [userData, setUserData] = useState({
    fullName: '',
    username: '',
    email: '',
    phonenumber: '',
    csi: '',
    ifsc: '',
    accountNumber: '',
    balance: 0,
    savingAmount: 0,
    isActive: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const id = localStorage.getItem('id'); // Retrieve user ID from local storage
        if (!id) throw new Error('User ID not found');

        // Fetch user data from API
        const response = await fetch(`http://localhost:8080/api/users/${id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        console.log("User Data Fetched:", data);

        setUserData({
          fullName: data.fullName || 'N/A',
          username: data.username || 'N/A',
          email: data.email || 'N/A',
          phonenumber: data.phonenumber || 'N/A',
          csi: data.csi || 'N/A',
          ifsc: data.ifsc || 'N/A',
          accountNumber: data.accountNumber || 'N/A',
          balance: data.balance !== undefined ? data.balance : 0,
          savingAmount: data.savingAmount !== undefined ? data.savingAmount : 0,
          isActive: data.isActive || false,
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return <div className="text-center py-12">Loading user data...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 border border-gray-800 rounded-lg shadow-lg text-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">User Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div>
          <p className="text-gray-400">Full Name:</p>
          <p className="text-lg font-semibold">{userData.fullName}</p>
        </div>

        <div>
          <p className="text-gray-400">Username:</p>
          <p className="text-lg font-semibold">{userData.username}</p>
        </div>

        <div>
          <p className="text-gray-400">Email:</p>
          <p className="text-lg font-semibold">{userData.email}</p>
        </div>

        <div>
          <p className="text-gray-400">Phone Number:</p>
          <p className="text-lg font-semibold">{userData.phonenumber}</p>
        </div>

        {/* Banking Information */}
        <div>
          <p className="text-gray-400">Account Number:</p>
          <p className="text-lg font-semibold">{userData.accountNumber}</p>
        </div>

        <div>
          <p className="text-gray-400">IFSC Code:</p>
          <p className="text-lg font-semibold">{userData.ifsc}</p>
        </div>

        <div>
          <p className="text-gray-400">CSI:</p>
          <p className="text-lg font-semibold">{userData.csi}</p>
        </div>

        <div>
          <p className="text-gray-400">Account Status:</p>
          <p className={`text-lg font-semibold ${userData.isActive ? 'text-green-400' : 'text-red-400'}`}>
            {userData.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>

        {/* Financial Details */}
        <div className="col-span-2 bg-gray-800 p-4 rounded-lg shadow mt-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Financial Overview</h3>
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400">Current Balance:</p>
              <p className="text-2xl font-bold text-green-400">₹{userData.balance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400">Savings Amount:</p>
              <p className="text-2xl font-bold text-blue-400">₹{userData.savingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
