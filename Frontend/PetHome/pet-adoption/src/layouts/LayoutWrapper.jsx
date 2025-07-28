import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

const LayoutWrapper = () => {
  const location = useLocation();
  const hideLayout = ['/login', '/signup', '/profile', '/quiz'].includes(location.pathname);

  return (
    <div className="app">      {!hideLayout && <Navbar />}
      <main className={hideLayout ? 'auth-layout' : 'main-layout'}>
        <Outlet />
      </main>
      {!hideLayout && <Footer />}
    </div>
  );
};

export default LayoutWrapper;