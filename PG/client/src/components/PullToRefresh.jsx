import React, { useState, useRef } from 'react';
import Icon from './Icon';

const PullToRefresh = ({ onRefresh, children }) => {
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);

  const MAX_PULL = 120;
  const THRESHOLD = 70;

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (startY === 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0 && window.scrollY === 0) {
      // Slow down the pull effect
      const pull = Math.min(distance * 0.4, MAX_PULL);
      setPullDistance(pull);
      
      // Stop native scroll behavior on Chrome Android when pulling down
      if (document.documentElement.scrollTop === 0 && e.cancelable) {
        e.preventDefault();
      }
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(50); // Hold at 50px while refreshing
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    setStartY(0);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full relative min-h-screen"
    >
      {/* Loading Indicator Area */}
      <div 
        className="absolute top-0 left-0 w-full flex justify-center items-center overflow-hidden z-0"
        style={{ 
          height: `${pullDistance}px`,
          transition: isRefreshing || pullDistance === 0 ? 'height 0.3s ease-out' : 'none'
        }}
      >
        <div 
          className={`bg-surface-container rounded-full p-2 shadow-sm flex items-center justify-center transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
          style={{ transform: `rotate(${pullDistance * 2}deg) scale(${Math.min(pullDistance / THRESHOLD, 1)})` }}
        >
          <Icon name="refresh" className="text-primary" size={24} />
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="relative z-10 bg-background h-full"
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
