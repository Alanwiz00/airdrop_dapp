import React, { useState, useEffect } from 'react';

const Timer = ({ endTime }) => {
  const calculateTimeLeft = () => {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = endTime - now;
    return timeLeft > 0 ? timeLeft : 0;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div>
      <h1>{formatTime(timeLeft)}</h1>
    </div>
  );
};

export default Timer;
