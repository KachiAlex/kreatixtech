import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setHidden(true), 2800);
    const doneTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3000);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [onFinish]);

  if (hidden) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0E0E0F] animate-splash-fade"
    >
      {/* Logo with bounce-in animation */}
      <div className="animate-splash-logo" style={{ opacity: 0 }}>
        <img
          src="/images/kreatix-logo-light.png"
          alt="Kreatix Technologies"
          className="w-auto h-16 object-contain drop-shadow-2xl"
        />
      </div>

      {/* Tagline */}
      <div className="mt-2 animate-splash-tagline" style={{ opacity: 0 }}>
        <p className="text-sm text-white/60 font-medium tracking-wide">
          Secure. Scalable. Innovative.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-10 w-40 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#F2782E] rounded-full animate-splash-progress" />
      </div>
    </div>
  );
}
