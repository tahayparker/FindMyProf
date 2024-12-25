import React from 'react';

function Button({ children, onClick = () => {}, isActive = false }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full transition-all duration-200 ease-in-out border-2 hover:border-[#1E555C] ${
        isActive ? 'border-[#1E555C] text-[#1E555C]' : 'border-[#D69F7E] text-white'
      } hover:shadow-lg hover:shadow-[#1E555C]/50`}
    >
      <span className="text-sm font-semibold">{children}</span>
    </button>
  );
}

export default Button; 