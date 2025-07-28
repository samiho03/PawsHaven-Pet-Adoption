import React, { useState, useEffect } from 'react';
import { FaPaw, FaCheckCircle, FaTimesCircle, FaChartBar } from 'react-icons/fa';
import axiosInstance from '../../api/axiosConfig';
import BarChartComponent from './BarChart';
import PieChartComponent from './PieChart';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalPets: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });
  const [userPetCounts, setUserPetCounts] = useState([]);
  const [messageMetrics, setMessageMetrics] = useState({
    totalMessages: 0,
    respondedMessages: 0,
    pendingMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // No recent activity section
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const petsResponse = await axiosInstance.get("/pets/getAll");
      const usersResponse = await axiosInstance.get("/auth/users");
      const messagesResponse = await axiosInstance.get("/contact/admin/messages");

      const pets = petsResponse.data;
      const users = usersResponse.data || [];
      const messages = messagesResponse.data || [];
      
      const totalPets = pets.length;
      const approvedRequests = pets.filter(pet => pet.regStatus === "Approved").length;
      const rejectedRequests = pets.filter(pet => pet.regStatus === "Rejected").length;
      const pendingRequests = pets.filter(pet => !pet.regStatus || pet.regStatus === "Pending").length;
      
      setDashboardData({
        totalPets,
        pendingRequests,
        approvedRequests,
        rejectedRequests
      });

      const respondedMessages = messages.filter(m => m.responded).length;
      const pendingMessages = messages.filter(m => !m.responded).length;
      setMessageMetrics({
        totalMessages: messages.length,
        respondedMessages,
        pendingMessages
      });

      // Calculate pet count per user
      const counts = users.map(u => {
        const count = pets.filter(p => p.ownerName === u.name).length;
        if (count > 0) {
          return { name: u.name, location: u.location, count };
        }
        return null;
      }).filter(Boolean);
      setUserPetCounts(counts);
      
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Recent activity section removed


  const StatCard = ({ icon, title, value, color }) => (
    <div className={`admin-stat-card admin-stat-${color}`}>
      <div className="admin-stat-icon">
        {icon}
      </div>
      <div className="admin-stat-content">
        <h3 className="admin-stat-value">{value}</h3>
        <p className="admin-stat-title">{title}</p>
      </div>
    </div>
  );

  // Activity list removed

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-container">
        <div className="admin-error">
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="admin-retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
     
      </div>

      {/* Statistics Cards */}
      <div className="admin-stats-grid">
        <StatCard
          icon={<FaPaw className="admin-stat-icon-svg" />}
          title="Total Pets"
          value={dashboardData.totalPets}
          color="primary"
        />
        <StatCard
          icon={<FaPaw className="admin-stat-icon-svg" />}
          title="Pending Requests"
          value={dashboardData.pendingRequests}
          color="warning"
        />
        <StatCard
          icon={<FaCheckCircle className="admin-stat-icon-svg" />}
          title="Approved Requests"
          value={dashboardData.approvedRequests}
          color="success"
        />
        <StatCard
          icon={<FaTimesCircle className="admin-stat-icon-svg" />}
          title="Rejected Requests"
          value={dashboardData.rejectedRequests}
          color="danger"
        />
      </div>

      {/* Main Content Area */}
      <div className="admin-dashboard-content">
        {/* Left Column */}
        <div className="admin-dashboard-left">
          {/* Analytics Mini View */}
          <div className="admin-analytics-mini">
            <h2 className="admin-section-title">
              <FaChartBar className="admin-section-icon" /> User Pet Distribution
            </h2>
            <div className="admin-mini-charts">
              <div className="admin-mini-chart">
                <PieChartComponent
                  data={userPetCounts}
                  title={null}
                  miniView={true}
                />
              </div>
              <div className="admin-mini-chart">
                <BarChartComponent
                  data={dashboardData}
                  title={null}
                  miniView={true}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="admin-dashboard-right">
          {/* Summary Stats */}
          <div className="admin-summary-stats">
            <h2 className="admin-section-title">Key Metrics</h2>
            <div className="admin-metrics-grid">
              <div className="admin-metric-card">
                <h4>Approval Rate</h4>
                <p className="admin-metric-value">
                  {dashboardData.totalPets > 0 
                    ? Math.round((dashboardData.approvedRequests / dashboardData.totalPets) * 100)
                    : 0}%
                </p>
                <p className="admin-metric-description">
                  of total requests approved
                </p>
              </div>
              <div className="admin-metric-card">
                <h4>Processing Rate</h4>
                <p className="admin-metric-value">
                  {dashboardData.totalPets > 0 
                    ? Math.round(((dashboardData.approvedRequests + dashboardData.rejectedRequests) / dashboardData.totalPets) * 100)
                    : 0}%
                </p>
                <p className="admin-metric-description">
                  of requests processed
                </p>
              </div>
            </div>
          </div>
          <div className="admin-summary-stats">
            <h2 className="admin-section-title">Contact Messages</h2>
            <div className="admin-metrics-grid">
              <div className="admin-metric-card">
                <h4>Total Messages</h4>
                <p className="admin-metric-value">{messageMetrics.totalMessages}</p>
                <p className="admin-metric-description">messages received</p>
              </div>
              <div className="admin-metric-card">
                <h4>Responded</h4>
                <p className="admin-metric-value">{messageMetrics.respondedMessages}</p>
                <p className="admin-metric-description">messages responded</p>
              </div>
              <div className="admin-metric-card">
                <h4>Pending</h4>
                <p className="admin-metric-value">{messageMetrics.pendingMessages}</p>
                <p className="admin-metric-description">awaiting reply</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;