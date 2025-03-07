import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search } from 'lucide-react';
import ParticleCanvas from './ParticleCanvas';

const StockRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ 
    key: 'Name', 
    direction: 'ascending' 
  });
  const [chartType, setChartType] = useState('returns');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('http://localhost:5001/get_recommendations', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setRecommendations(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Detailed error:', error);
        setError(error.toString());
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedRecommendations = [...recommendations].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setRecommendations(sortedRecommendations);
  };

  const getClusterColor = (cluster) => {
    const clusterColors = {
      0: 'bg-green-900',
      1: 'bg-blue-900',
      2: 'bg-yellow-900'
    };
    return clusterColors[cluster] || 'bg-gray-800';
  };

  // Filtered and Searched Recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => 
      rec.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recommendations, searchTerm]);

  // Prepare data for different chart types
  const getChartData = () => {
    switch(chartType) {
      case 'returns':
        return filteredRecommendations.map(rec => ({
          name: `${rec.Name} (${rec.Year})`,
          value: rec.Close * 100
        }));
      case 'clusters':
        const clusterCounts = filteredRecommendations.reduce((acc, rec) => {
          acc[rec.cluster] = (acc[rec.cluster] || 0) + 1;
          return acc;
        }, {});
        return Object.entries(clusterCounts).map(([cluster, count]) => ({
          name: `Cluster ${cluster}`,
          value: count
        }));
      case 'years':
        const yearCounts = filteredRecommendations.reduce((acc, rec) => {
          acc[rec.Year] = (acc[rec.Year] || 0) + 1;
          return acc;
        }, {});
        return Object.entries(yearCounts).map(([year, count]) => ({
          name: year,
          value: count
        }));
      default:
        return [];
    }
  };

  const chartData = getChartData();

  const chartTypes = [
    { value: 'returns', label: 'Annual Returns' },
    { value: 'clusters', label: 'Cluster Distribution' },
    { value: 'years', label: 'Stocks per Year' }
  ];

  if (isLoading) {
    return (
      <div className="p-4 text-center bg-gray-900 text-white">
        Loading stock recommendations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center bg-gray-900">
        Error: {error}
        <pre className="mt-2 text-sm">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white">
      <ParticleCanvas/>
      <h1 className="text-2xl font-bold mb-4">Stock Recommendations</h1>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-gray-400 h-5 w-5" />
        </div>
        <input 
          type="text"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Chart Type Selector */}
      <div className="flex justify-center mb-4 space-x-4">
        {chartTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setChartType(type.value)}
            className={`px-4 py-2 rounded transition-colors ${
              chartType === type.value 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Dynamic Line Chart */}
      <div className="w-full h-64 mb-6 bg-gray-800 p-4 rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'white' }}
            />
            <YAxis 
              label={{ 
                value: chartType === 'returns' ? 'Annual Return (%)' : 
                        chartType === 'clusters' ? 'Number of Stocks' : 
                        'Stocks Count', 
                angle: -90, 
                position: 'insideLeft',
                fill: 'white'
              }}
              tick={{ fill: 'white' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937',
                color: 'white'
              }}
              labelStyle={{ color: 'white' }}
            />
            <Legend 
              wrapperStyle={{ color: 'white' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stock Recommendations Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-gray-800 text-white">
          <thead>
            <tr className="bg-gray-700">
              {['Name', 'Year', 'Close', 'cluster'].map((key) => (
                <th 
                  key={key}
                  className="p-2 border cursor-pointer hover:bg-gray-600"
                  onClick={() => handleSort(key === 'Close' ? 'Close' : key)}
                >
                  {key === 'Name' ? 'Stock Name' : 
                   key === 'Close' ? 'Annual Return' : 
                   key === 'cluster' ? 'Cluster' : key}
                  {sortConfig.key === (key === 'Close' ? 'Close' : key) && 
                    (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRecommendations.map((rec, index) => (
              <tr 
                key={index} 
                className={`${getClusterColor(rec.cluster)} hover:bg-opacity-75`}
              >
                <td className="p-2 border">{rec.Name}</td>
                <td className="p-2 border text-center">{rec.Year}</td>
                <td className="p-2 border text-right">
                  {(rec.Close * 100).toFixed(2)}%
                </td>
                <td className="p-2 border text-center">
                  Cluster {rec.cluster}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRecommendations.length === 0 && (
          <div className="text-center text-gray-400 py-4">
            No companies found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default StockRecommendations;