import React from "react";

const StatCard = ({ label, value, color }) => {
  return (
    <div className="text-center">
      <p className="text-gray-600">{label}</p>
      <p className={`text-lg font-semibold ${color}`}>
        {value}
      </p>
    </div>
  );
};

export default StatCard;
