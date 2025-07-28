// pages/Home/Home.jsx
import React from 'react';
import Hero from '../../components/Hero/Hero';
import Features from '../../components/Features/Features';
import About from '../../components/About/About';
import Contact from '../../components/Contact/Contact';
import New from '../../components/New/New';
import PetCategory from '../../components/PetCategory/PetCategory';
import Pets from '../../components/Pets/Pets';

import './Home.css';
import FAQ from '../FAQ/FAQ';

const Home = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  return (
    <main className="home-page">
      <Hero />
      <PetCategory />
      <New />
      {isLoggedIn && <Pets />}
      <Contact />
      <FAQ/>
    </main>
  );
};

export default Home;