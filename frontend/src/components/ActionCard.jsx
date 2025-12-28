import React from "react";

const ActionCard = ({ title, bgColor, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        w-56 h-36 
        sm:w-64 sm:h-40 
        lg:w-72 lg:h-54
        rounded-2xl ${bgColor}
        flex flex-col justify-center items-center
        cursor-pointer transition-all duration-300
        hover:scale-105 hover:shadow-xl
      `}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {title}
      </h2>

      <button className="bg-white/70 backdrop-blur px-6 py-2 rounded-full font-medium text-gray-700 hover:bg-white">
        Open
      </button>
    </div>
  );
};

export default ActionCard;
