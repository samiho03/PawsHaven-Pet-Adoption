import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./PetCategory.css";
import axiosInstance from "../../api/axiosConfig";
import { useEffect, useState, useRef } from "react";

const defaultCategories = [
  {
    name: "Dogs",
    type: "Mishri Puppy",
    image: "/images/dog.png",
    bgColor: "#fbcfe8",
    pulseColor: "#f9a8d4",
    filterValue: "Dog"
  },
  {
    name: "Cats",
    type: "Racing Cat",
    image: "/images/cat.png",
    bgColor: "#fef08a",
    pulseColor: "#fde047",
    filterValue: "Cat"
  },
  {
    name: "Rabbits",
    type: "Fluffy Bunny",
    image: "/images/rabbit.png",
    bgColor: "#bbf7d0",
    pulseColor: "#86efac",
    filterValue: "Rabbit"
  },
  {
    name: "Birds",
    type: "Singing Parrot",
    image: "/images/bird.png",
    bgColor: "#c7d2fe",
    pulseColor: "#a5b4fc",
    filterValue: "Bird"
  },
];

const PetCategory = () => {
  const navigate = useNavigate();
  const [petCategories, setPetCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Fetch species from API
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await axiosInstance.get('/species');
        if (response.data && response.data.length > 0) {
          const combinedCategories = [...defaultCategories];
          
          response.data.forEach((species, index) => {
            const exists = defaultCategories.some(
              cat => cat.name.toLowerCase() === species.name.toLowerCase()
            );
            
            if (!exists) {
              combinedCategories.push({
                name: species.name,
                type: `${species.name} Companion`,
                image: species.photo ? `http://localhost:8080${species.photo}` : "/images/pet-default.png",
                bgColor: getRandomColor(combinedCategories.length),
                pulseColor: getRandomPulseColor(combinedCategories.length),
                filterValue: species.name
              });
            }
          });
          
          setPetCategories(combinedCategories);
        }
      } catch (error) {
        console.error("Failed to fetch species:", error);
        setPetCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecies();
  }, []);

  // Helper function to generate random colors
  const getRandomColor = (index) => {
    const colors = ["#fbcfe8", "#fef08a", "#bbf7d0", "#c7d2fe", "#fecaca", "#d8b4fe", "#bae6fd", "#ddd6fe"];
    return colors[index % colors.length];
  };

  const getRandomPulseColor = (index) => {
    const colors = ["#f9a8d4", "#fde047", "#86efac", "#a5b4fc", "#fca5a5", "#c084fc", "#7dd3fc", "#c4b5fd"];
    return colors[index % colors.length];
  };

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
    hidden: { y: 30, opacity: 0 },
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
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.15,
        type: "spring",
        stiffness: 150
      }
    })
  };

  const handleCategoryClick = (specie) => {
    navigate('/petlist', { state: { initialFilter: specie } });
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % (petCategories.length - 3));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + (petCategories.length - 3)) % (petCategories.length - 3));
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) handleNext();
    if (distance < -50) handlePrev();
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (loading) {
    return (
      <div className="category-containerr">
        <div className="category-container">
          <h2 className="category-title">Loading Pet Categories...</h2>
        </div>
      </div>
    );
  }

  // Get the current 4 categories to display
  const visibleCategories = petCategories.slice(activeIndex, activeIndex + 4);

  return (
    <motion.div 
      className="category-containerr"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="category-container">
        {/* Title Section */}
        <motion.div variants={itemVariants}>
          <h2 className="category-title">Discover Our Pet Categories</h2>
        </motion.div>
        
        <motion.p 
          className="category-description"
          variants={itemVariants}
        >
          Find your perfect companion from our diverse selection of adorable pets.
        </motion.p>
        
        {/* Category Display */}
        <div 
          className="pet-category-four-container"
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {petCategories.length > 4 && (
            <button 
              className="pet-category-four-button prev"
              onClick={handlePrev}
              aria-label="Previous categories"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="#7c50a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          
          <div className="pet-category-four-track">
            {visibleCategories.map((pet, index) => (
              <motion.div
                key={`${activeIndex}-${index}`}
                className="category-card"
                onClick={() => handleCategoryClick(pet.filterValue)}
                style={{ cursor: 'pointer' }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                whileHover={{ y: -10 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className="category-image-container pulse-animation"
                  style={{ 
                    backgroundColor: pet.bgColor,
                    boxShadow: `0 0 0 0 ${pet.pulseColor}`
                  }}
                >
                  <motion.img 
                    src={pet.image} 
                    alt={pet.name} 
                    className="category-image float-animation" 
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: index * 0.15 + 0.3,
                      type: "spring",
                      stiffness: 200
                    }}
                    onError={(e) => {
                      e.target.src = "/images/pet-default.png";
                    }}
                  />
                </div>
                <h3 className="category-name">{pet.name}</h3>
                <p className="category-type">{pet.type}</p>
                <div className="category-dots">
                  {[...Array(3)].map((_, i) => (
                    <motion.span 
                      key={i} 
                      className="dot" 
                      style={{ backgroundColor: pet.bgColor }}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ 
                        delay: index * 0.15 + i * 0.1 + 0.4
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {petCategories.length > 4 && (
            <button 
              className="pet-category-four-button next"
              onClick={handleNext}
              aria-label="Next categories"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="#7c50a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Indicators */}
        {petCategories.length > 4 && (
          <div className="pet-category-four-indicators">
            {Array.from({ length: petCategories.length - 3 }).map((_, index) => (
              <button
                key={index}
                className={`pet-category-four-indicator ${index === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to position ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Cloud Image */}
        <motion.div 
          className="cat-cloud-container"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <img 
            src="/images/Frame-37.png" 
            alt="Cat Cloud" 
            className="cloud-image"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PetCategory;