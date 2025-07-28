import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './PieChart.css';

const PieChartComponent = ({ data, title }) => {
  const isUserData = Array.isArray(data);
  const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

  let chartData = [];
  if (isUserData) {
    chartData = data.map((item, idx) => ({
      name: item.name,
      location: item.location,
      value: item.count,
      color: defaultColors[idx % defaultColors.length]
    })).filter(item => item.value > 0);
  } else {
    chartData = [
      { name: 'Pending', value: data.pendingRequests || 0, color: '#ff9500' },
      { name: 'Approved', value: data.approvedRequests || 0, color: '#28a745' },
      { name: 'Rejected', value: data.rejectedRequests || 0, color: '#dc3545' }
    ].filter(item => item.value > 0);
  }

  // Custom label function
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show labels for very small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const info = payload[0].payload;
      return (
        <div className="pie-tooltip">
          <p className="tooltip-label">{info.name}</p>
          {isUserData && (
            <p className="tooltip-value">Location: <strong>{info.location || 'N/A'}</strong></p>
          )}
          <p className="tooltip-value">Count: <strong>{info.value}</strong></p>
          <p className="tooltip-percentage">
            Percentage: <strong>{((info.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }) => (
    <div className="pie-legend">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="legend-text">{entry.payload.name}</span>
        </div>
      ))}
    </div>
  );

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-header">
        <h3>{title || (isUserData ? 'Pets by User' : 'Pet Registration Distribution')}</h3>
        </div>
        <div className="no-data">
          <p>No data available for pie chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>{title || (isUserData ? 'Pets by User' : 'Pet Registration Distribution')}</h3>
        <p className="chart-subtitle">
          {isUserData ? 'Number of pets per user' : 'Breakdown of registration status'}
        </p>
      </div>
      
      <div className="pie-chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {!isUserData && (
        <div className="pie-summary">
          <div className="summary-grid">
            <div className="summary-card">
              <h4>Most Common Status</h4>
              <p className="highlight">
                {chartData.length > 0
                  ? chartData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name
                  : 'N/A'}
              </p>
            </div>
            <div className="summary-card">
              <h4>Total Entries</h4>
              <p className="highlight">
                {chartData.reduce((sum, item) => sum + item.value, 0)}
              </p>
            </div>
            <div className="summary-card">
              <h4>Pending Rate</h4>
              <p className="highlight">
                {data.totalPets > 0 ? ((data.pendingRequests / data.totalPets) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PieChartComponent;