import React from "react";
import { useConfig } from "../../context/ConfigContext";
import { usePlayback } from "../../context/PlaybackContext";

export const CountdownOverlay: React.FC = () => {
  const { theme } = useConfig();
  const { countdownValue } = usePlayback();

  if (countdownValue <= 0) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div 
        className="text-9xl font-bold animate-bounce" 
        style={{ color: theme.primaryColor, textShadow: '0 0 50px rgba(0,0,0,0.5)' }}
      >
        {countdownValue}
      </div>
    </div>
  );
};

export default CountdownOverlay;
