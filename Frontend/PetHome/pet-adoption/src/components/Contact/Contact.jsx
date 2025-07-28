import { motion } from 'framer-motion';
import CuteCat from '../../assets/Bird.gif';
import { FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Contact.css';

const Contact = () => {
  const navigate = useNavigate();

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

  const imageVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 10
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
      transition: {
        type: "spring",
        stiffness: 300
      }
    },
    tap: {
      scale: 0.98
    }
  };

  const iconVariants = {
    hover: {
      x: 5,
      transition: {
        type: "spring",
        stiffness: 500
      }
    }
  };

  const handleContactClick = () => {
    navigate('/contact');
  };

  return (
    <motion.section 
      className="HPcontact-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="wave-bottom"></div>
      
      <motion.div className="HPcontact-container">
        <motion.div 
          className="HPcontact-card"
          variants={containerVariants}
        >
          <motion.div 
            className="HPpet-image"
            variants={imageVariants}
          >
            <motion.img 
              src={CuteCat} 
              alt="Cute pet" 
              whileHover={{ 
                rotate: [0, -5, 5, -5, 0],
                transition: { duration: 0.8 } 
              }}
            />
          </motion.div>
          
          <motion.div 
            className="HPcontact-content"
            variants={itemVariants}
          >
            <motion.h2 variants={itemVariants}>
              Have Questions?
            </motion.h2>
            <motion.p variants={itemVariants}>
              Our dedicated team is ready to assist you in finding your perfect furry friend. 
              Whether you're curious about adoption processes, pet care, or availability, 
              we're happy to provide all the information you need to make the best choice.
            </motion.p>
            <motion.button 
              className="HPcontact-button" 
              onClick={handleContactClick}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <motion.span variants={iconVariants}>
                Contact Us 
              </motion.span>
              <motion.span variants={iconVariants}>
                <FaPaperPlane className="button-icon" />
              </motion.span>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default Contact;