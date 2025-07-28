import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './New.css';
import catPred from '../../assets/catPred.png';
import subPet from '../../assets/subpet.png';
import star3Gif from '../../assets/star3.gif';
// Import Material-UI icons
import PetsIcon from '@mui/icons-material/Pets';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ChatIcon from '@mui/icons-material/Chat';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const New = () => {
  const [activeCards, setActiveCards] = useState({
    center: false,
    smartMatch: false
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCards(prev => ({
        center: !prev.center,
        smartMatch: !prev.smartMatch
      }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

   // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: (delay) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: delay * 0.15,
        type: "spring",
        stiffness: 150
      }
    })
  };

  const starVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };

  const features = {
    farLeft: {
      id: 'prediction',
      title: 'Predict Time',
      image: catPred,
      description: 'Estimates how quickly a pet may be adopted.',
      buttonText: 'Fill & Predict',
      link: '/form',
      IconComponent: QueryStatsIcon
    },
    leftTop: {
      id: 'vet-map',
      title: 'Vet Finder',
      image: 'https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/15F07/production/_94836898_sickdog.jpg',
      description: 'Quickly find nearby veterinary hospitals for your pet’s care.',
      buttonText: 'Find Vet',
      link: '/virtual-meet',
      IconComponent: LocationOnIcon,
      autoShow: true,
      showState: activeCards.center
    },
    leftBottom: {
      id: 'pet-profile',
      title: 'Pet Profiles',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9Shc65yzkDAOw-aIYEFU-sLg872L8kN0zsw&s',
      description: 'Browse detailed pet profiles with smart search filters.',
      buttonText: 'View Pets',
      link: '/petlist',
      IconComponent: PetsIcon
    },
    center: {
      id: 'perfect-match',
      title: 'Perfect Match',
      image: 'https://thumbs.dreamstime.com/b/cute-confused-little-dog-question-marks-yellow-background-cute-confused-little-dog-question-marks-yellow-337715477.jpg',
      description: 'Not sure which pet is right for you? Answer a few quick questions, and we’ll help you discover the perfect companion for your lifestyle. Whether you’re looking for a playful pup, a cuddly cat, or a low-maintenance friend, we’re here to guide you!',
      buttonText: 'Find My Match',
      link: '/quiz',
      IconComponent: PsychologyIcon,
     
    },
    rightTop: {
      id: 'chat-owner',
      title: 'Contact',
      image: 'https://www.pumpkin.care/wp-content/uploads/2023/12/Renewal-and-cancellation-policies-in-pet-insurance.png',
      description: 'Chat, call, or email pet owners directly anytime.',
      buttonText: '',
      link: '/vet',
      IconComponent: ChatIcon
    },
    rightBottom: {
      id: 'smart-match',
      title: 'Rehome Pet',
      image: subPet,
      description: 'Submit your pet and help them find a loving home',
      buttonText: 'Rehome Now',
      link: '/form',
      IconComponent: HomeIcon,
      autoShow: true,
      showState: activeCards.smartMatch
    },
    farRight: {
      id: 'adoption-assistant',
      title: '24/7 Help',
      image: 'https://img.freepik.com/premium-photo/business-concept-pet-dog-using-laptop-computer-3d-rendering_256339-2324.jpg',
      description: 'Have questions? Just ask Ellie! Our smart chatbot is here 24/7 to help you.',
   
      IconComponent: SupportAgentIcon
    }
  };

   return (
    <motion.section 
      className="pasc-features-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="pasc-container">
        <motion.h2 className="pasc-main-title">
          <motion.img 
            src={star3Gif} 
            alt="star" 
            className="pasc-star-gif pasc-star-left" 
            variants={starVariants}
          />
          Make Adoption Effortless With Our Smart Features
          <motion.img 
            src={star3Gif} 
            alt="star" 
            className="pasc-star-gif pasc-star-right" 
            variants={starVariants}
          />
        </motion.h2>

        <motion.div className="pasc-features-grid" variants={containerVariants}>
          {/* Far Left Card */}
          <motion.div 
            className="pasc-feature-card pasc-far-left"
            variants={cardVariants}
            custom={0}
          >
            <FeatureCard {...features.farLeft} />
          </motion.div>
          
          {/* Left Column */}
          <motion.div 
            className="pasc-left-column"
            variants={containerVariants}
          >
            <motion.div 
              className="pasc-feature-card pasc-left-top"
              variants={cardVariants}
              custom={1}
            >
              <FeatureCard {...features.leftTop} />
            </motion.div>
            <motion.div 
              className="pasc-feature-card pasc-left-bottom"
              variants={cardVariants}
              custom={2}
            >
              <FeatureCard {...features.leftBottom} />
            </motion.div>
          </motion.div>
          
          {/* Center Card */}
          <motion.div 
            className="pasc-feature-card pasc-center-card"
            variants={cardVariants}
            custom={3}
            whileHover={{ scale: 1.05 }}
          >
            <FeatureCard {...features.center} />
          </motion.div>
          
          {/* Right Column */}
          <motion.div 
            className="pasc-right-column"
            variants={containerVariants}
          >
            <motion.div 
              className="pasc-feature-card pasc-right-top"
              variants={cardVariants}
              custom={1}
            >
              <FeatureCard {...features.rightTop} />
            </motion.div>
            <motion.div 
              className="pasc-feature-card pasc-right-bottom"
              variants={cardVariants}
              custom={2}
            >
              <FeatureCard {...features.rightBottom} />
            </motion.div>
          </motion.div>
          
          {/* Far Right Card */}
          <motion.div 
            className="pasc-feature-card pasc-far-right"
            variants={cardVariants}
            custom={0}
          >
            <FeatureCard {...features.farRight} />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

const FeatureCard = ({ id, title, image, description, buttonText, link, icon, autoShow, showState, IconComponent }) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldShowDescription = isHovered || (autoShow && showState);

  return (
    <motion.div 
      className={`pasc-card-container ${shouldShowDescription ? 'pasc-active' : ''}`}
      id={id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
    >
      <div className="pasc-card-inner">
        {/* Background Image */}
        <motion.div 
          className="pasc-card-image" 
          style={{ backgroundImage: `url(${image})` }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        
        {/* Title Section */}
        <div className="pasc-title-section">
          <div className="pasc-title-container">
            <motion.div 
              className="pasc-icon-background"
              whileHover={{ rotate: 15, scale: 1.1 }}
            >
              <IconComponent style={{ color: 'white', fontSize: '18px' }} /> 
            </motion.div>

            <h3 className="pasc-card-title">{title}</h3>
          </div>
        </div>
        
        {/* Description Overlay */}
        <motion.div 
          className={`pasc-description-overlay ${shouldShowDescription ? 'pasc-show' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: shouldShowDescription ? 1 : 0,
            y: shouldShowDescription ? 0 : 20
          }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="pasc-divider-line"></div>
          <p className="pasc-card-description">{description}</p>
          <motion.a 
            href={link} 
            className="pasc-card-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {buttonText}
          </motion.a>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default New;