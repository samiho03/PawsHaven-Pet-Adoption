import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './BarChart.css';

const BarChartComponent = ({ data, title }) => {
  const isUserData = Array.isArray(data);
  const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

  const chartData = isUserData
    ? data.map((item, idx) => ({
        name: item.name,
        location: item.location,
        count: item.count,
        fill: defaultColors[idx % defaultColors.length]
      }))
    : [
        { name: 'Pending', count: data.pendingRequests || 0, fill: '#ff9500' },
        { name: 'Approved', count: data.approvedRequests || 0, fill: '#28a745' },
        { name: 'Rejected', count: data.rejectedRequests || 0, fill: '#dc3545' }
      ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const info = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{info.name}</p>
          {isUserData && (
            <p className="tooltip-desc">Location: {info.location || 'N/A'}</p>
          )}
          <p className="tooltip-desc">Count: {info.count}</p>
          <p className="tooltip-desc">
            {`${((info.count / chartData.reduce((s, i) => s + i.count, 0)) * 100).toFixed(1)}% of total`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>{title || (isUserData ? 'Pets by User' : 'Pet Registration Status')}</h3>
        <p className="chart-subtitle">
          {isUserData ? 'Number of pets registered per user' : 'Distribution of pet registration requests'}
        </p>
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#666' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#666' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
            />
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]}
              stroke="#fff"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {!isUserData && (
        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">Total Requests:</span>
            <span className="stat-value">{data.totalPets}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Processing Rate:</span>
            <span className="stat-value">
              {data.totalPets > 0
                ? `${(((data.approvedRequests + data.rejectedRequests) / data.totalPets) * 100).toFixed(1)}%`
                : '0%'
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarChartComponent;