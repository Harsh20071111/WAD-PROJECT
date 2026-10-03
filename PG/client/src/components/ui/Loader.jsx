import React from 'react';

const Loader = ({ text = 'Loading...', className = 'py-16' }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      {text && <span className="text-body-md text-on-surface-variant">{text}</span>}
    </div>
  );
};

export default Loader;
