import React from "react";
import { MascotEmotion } from "../../types";

interface MascotDisplayProps {
  emotion: MascotEmotion;
}

export const MascotDisplay: React.FC<MascotDisplayProps> = ({ emotion }) => {
  const emotions: Record<MascotEmotion, string> = {
    idle: "😐",
    animated: "😃",
    doubt: "🤨",
    writing: "✍️",
    nervous: "😰",
    vanishing: "👻"
  };
  return <div className="text-4xl select-none">{emotions[emotion]}</div>;
};

export default MascotDisplay;
