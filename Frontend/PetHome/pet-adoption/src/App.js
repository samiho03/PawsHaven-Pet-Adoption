import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Signup from './pages/Auth/Signup/Signup';
import Login from './pages/Auth/Login/Login';
import Profile from './pages/Profile/Profile';
import Footer from './components/Footer/Footer';
import Form from './pages/UserForm/UserForm';
import Home from './pages/Home/Home';
import About from './components/About/About';
import Services from './pages/Services/Services';
import FAQ from './pages/FAQ/FAQ';
import Contact from './pages/Contact/Contact';
import Pets from './components/Pets/Pets';
import Favorites from './pages/Favorites/Favorites';
import PetDetail from './pages/PetDetail/PetDetail';
import Inbox from './pages/MessageInbox/MessageInbox';
import PetList from './pages/PetList/PetList';
import Chatbot from './pages/Chatbot/Chatbot';
import Map from './pages/Map/Map';
import Quiz from './pages/Quiz/Quiz';
import LayoutWrapper from './layouts/LayoutWrapper';
import Dashboard from './adminPanel/Dashboard/AdminDashboard';
import PetDetailsForm from './adminPanel/PetDetails/PetDetails';
import MessageDetails from './adminPanel/MessageDetails/MessageDetails';
import UserDetails from './adminPanel/UserDetails/UserDetails';
import SpeciesAdmin from './adminPanel/SpeciesAdmin/SpeciesAdmin';
import Sidebar from './adminPanel/Sidebar/Sidebar';
import PetProfile from './adminPanel/PetProfile/PetProfile';
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const handleLoginSuccess = (token, role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    console.log('Token saved:', token);
    console.log('User Role:', role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  };

  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
  };

  const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    return token && role === 'ADMIN' ? children : <Navigate to="/" />;
  };

  return (
    <Router>
       {!(isLoggedIn && userRole === 'ADMIN') && (
        <div className="chatbot-container">
          <Chatbot />
        </div>
      )}
      
      {isLoggedIn && userRole === 'ADMIN' ? (
        <div className="app-container">
          <Sidebar onLogout={handleLogout} />
          <div className="content">
            <Routes>
              <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
              <Route path="/admin/pets" element={<AdminRoute><PetDetailsForm /></AdminRoute>} />
              <Route path="/admin/species" element={<AdminRoute><SpeciesAdmin /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><UserDetails /></AdminRoute>} />
              <Route path="/admin/pet-profile" element={<AdminRoute><PetProfile /></AdminRoute>} />
              <Route path="/admin/messages" element={<AdminRoute><MessageDetails /></AdminRoute>} />
              <Route path="*" element={<Navigate to="/admin/dashboard" />} />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route element={<LayoutWrapper />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/petlist" element={<PetList />} />
            <Route path= "/petDetail/:id" element={<PetDetail />} />
            <Route path= "/favorites" element={<Favorites />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/form" element={<Form />} />
            <Route path= "/map" element={<Map />} />
            <Route path="/quiz" element={<Quiz />} />

            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/login" 
              element={<Login onLoginSuccess={handleLoginSuccess} />} 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile onLogout={handleLogout} userRole={userRole} />
                </PrivateRoute>
              } 
            />
           
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      )}
    </Router>
  );
};

export default App;