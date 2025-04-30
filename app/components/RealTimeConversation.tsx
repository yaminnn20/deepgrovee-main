import { Message } from "ai/react";
import { useEffect, useState, useMemo } from "react";

interface RealTimeConversationProps {
  currentMessage?: Message;
  currentUtterance?: string;
  isUserSpeaking: boolean;
}

export const RealTimeConversation = ({
  currentMessage,
  currentUtterance,
  isUserSpeaking,
}: RealTimeConversationProps) => {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [thinkingDots, setThinkingDots] = useState<string>("");

  useEffect(() => {
    if (!currentMessage?.content) {
      setDisplayedText("");
      return;
    }
    setDisplayedText(currentMessage.content);
  }, [currentMessage]);

  useEffect(() => {
    if (currentMessage || (isUserSpeaking && currentUtterance)) {
      setThinkingDots("");
      return;
    }
    let dotCount = 0;
    const interval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      setThinkingDots(".".repeat(dotCount));
    }, 500);
    return () => clearInterval(interval);
  }, [isUserSpeaking, currentMessage, currentUtterance]);

  const cleanUtterance = currentUtterance
    ? currentUtterance.replace(/undefined/g, "").trim()
    : "";

  // Memoized animation styles to prevent re-rendering on mic state change
  const blobStyles = useMemo(() => {
    return [...Array(5)].map((_, i) => ({
      width: `${80 + Math.random() * 20}px`,
      height: `${80 + Math.random() * 20}px`,
      background: [
        "rgba(64,224,208,0.9)",    // turquoise brighter
        "rgba(72,209,204,0.9)",    // medium turquoise brighter
        "rgba(0,191,255,0.9)",     // deep sky blue brighter
        "rgba(135,206,250,0.9)",   // light sky blue brighter
        "rgba(175,238,238,0.9)",   // pale turquoise brighter
      ][i % 5],
      animationDelay: `${i * 1.2}s`,
      filter: "blur(12px)", // less blur = brighter look
      top: `${Math.random() * 60}%`,
      left: `${Math.random() * 60}%`,
    }));
  }, []);
  // Empty dependency array ensures this only runs once

  return (
    <div className="flex flex-col h-full w-full justify-center items-center bg-gray-50 p-6">
      {/* Orb */}
      <div className="relative w-72 h-72 flex items-center justify-center mb-16 z-10">
        {/* Animated blobs */}
        {blobStyles.map((style, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-blob"
            style={style}
          />
        ))}
      </div>

      {/* Subtitles */}
      <div className="w-full max-w-2xl text-center px-4 z-20">
        {cleanUtterance && (
          <div
            className="bg-blue-50/70 backdrop-blur-md rounded-2xl p-2 shadow-md mb-6
            flex items-center justify-center transition-all duration-500 ease-in-out text-sm"
          >
            <div className="text-gray-700 font-medium animate-fade-in">
              {cleanUtterance}
            </div>
          </div>
        )}

        {/* Assistant response */}
        <div
          className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-lg
          flex items-center justify-center transition-all duration-500 ease-in-out text-base"
        >
          {displayedText ? (
            <div className="text-gray-800 font-medium">
              {displayedText}
            </div>
          ) : (
            <div className="text-gray-400 font-medium">
              Waiting for your message...
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(25px, -20px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 25px) scale(0.95);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
      `}</style>
    </div>
  );
};
