import React from "react";

interface TooltipProps {
  label: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  label, 
  side = 'top', 
  children, 
  className = '' 
}) => {
  return (
    <div className={`group relative flex items-center justify-center ${className}`}>
      {children}
      <div className={`absolute ${
        side === 'top' ? 'bottom-full mb-2' : 
        side === 'bottom' ? 'top-full mt-2' :
        side === 'left' ? 'right-full mr-2' :
        'left-full ml-2'
      } px-4 py-2 text-xs font-medium bg-black/90 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:delay-[3000ms] pointer-events-none whitespace-pre-wrap w-max max-w-md z-[100] border border-white/20 shadow-lg text-left leading-relaxed`}>
        {label}
      </div>
    </div>
  );
};

export default Tooltip;
