import React, { useState, useEffect } from 'react';

const SplashScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 2400);
    const doneTimer = setTimeout(() => onDone(), 3000);
    return () => { clearTimeout(exitTimer); clearTimeout(doneTimer); };
  }, [onDone]);

  return (
    <div className={`splash-screen ${exiting ? 'splash-exit' : ''}`}>
      <div className="splash-logo-wrap">
        <svg viewBox="0 0 245 70" role="img" aria-label="Kreatix Technologies" className="splash-logo">
          <rect x="0" y="5" width="58" height="58" rx="12" fill="#F2782E" className="splash-logo-icon" />
          <path d="M15 18h19v9l13-9v16L35 42l12 10H31L15 39z" fill="#fff" className="splash-logo-k" />
          <text x="75" y="43" fontFamily="Arial,sans-serif" fontSize="34" fontWeight="800" fill="#0E0E0F" className="splash-logo-text">kreatix</text>
          <text x="76" y="59" fontFamily="Arial,sans-serif" fontSize="10" letterSpacing="1.6" fill="#858990" className="splash-logo-sub">TECHNOLOGIES</text>
        </svg>
        <div className="splash-spinner" />
        <p className="splash-tagline">Mail</p>
      </div>
    </div>
  );
};

export default SplashScreen;
