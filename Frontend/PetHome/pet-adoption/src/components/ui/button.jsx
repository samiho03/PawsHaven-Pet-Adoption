import React from "react";

const Button = ({ children, className, onClick }) => {
  return (
    <button
      className={`px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
