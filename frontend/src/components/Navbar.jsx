import React from "react";

const Navbar = () => {
  return (
    <nav className="w-full flex justify-between items-center px-10 py-4 border-b">
      <h1 className="text-xl font-bold">
        Collaborative Gifting Platform
      </h1>

      <div className="flex gap-6 text-gray-700">
        <span className="cursor-pointer hover:text-black">Dashboard</span>
        <span className="cursor-pointer hover:text-black">Tot. Contribution</span>
        <span className="cursor-pointer hover:text-black">Profile</span>
        <span className="cursor-pointer hover:text-black">Settings</span>
      </div>
    </nav>
  );
};

export default Navbar;
