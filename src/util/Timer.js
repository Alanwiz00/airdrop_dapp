import { useState, useEffect } from 'react';

const Timer = ({ claimPeriodStart, claimPeriodEnd }) => {
  const calculateTimeLeft = () => {
    const now = Math.floor(Date.now() / 1000);
    if(now < claimPeriodStart) {
      return claimPeriodStart - now;
    }
    return claimPeriodEnd - now;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [claimStarted, setClaimStarted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
      setClaimStarted(Math.floor(Date.now() / 1000) >= claimPeriodStart);
    }, 1000);

    return () => clearInterval(timer);
  }, [claimPeriodStart, claimPeriodEnd]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    formatTime(timeLeft)
  );
};

export default Timer;
