import { useEffect, useState } from 'react';

interface SimsLoadingScreenProps {
  message?: string;
}

const QUIRKY_MESSAGES = [
  "Reticulating splines...",
  "Calculating llama trajectory...",
  "Summoning digital gremlins...",
  "Polishing pixels...",
  "Warming up the hamsters...",
  "Caffeinating the code...",
  "Teaching robots to dance...",
  "Counting backwards from infinity...",
  "Herding cats...",
  "Convincing electrons to cooperate...",
  "Spinning up the magic...",
  "Downloading more RAM...",
  "Asking nicely...",
  "Wrangling data cowboys...",
  "Consulting the crystal ball...",
  "Turning it off and on again...",
  "Feeding the algorithm...",
  "Organizing the chaos...",
  "Making it look effortless...",
  "Doing the heavy lifting...",
];

export default function SimsLoadingScreen({ message }: SimsLoadingScreenProps) {
  const [currentMessage, setCurrentMessage] = useState(
    message || QUIRKY_MESSAGES[Math.floor(Math.random() * QUIRKY_MESSAGES.length)]
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Rotate messages every 2 seconds
    const messageInterval = setInterval(() => {
      if (!message) {
        setCurrentMessage(
          QUIRKY_MESSAGES[Math.floor(Math.random() * QUIRKY_MESSAGES.length)]
        );
      }
    }, 2000);

    // Animate progress bar (smooth random increments)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // Don't go to 100% until actually done
        const increment = Math.random() * 15 + 5; // Random 5-20% increments
        return Math.min(prev + increment, 95);
      });
    }, 800);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [message]);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="w-full max-w-md space-y-6">
        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-background/10 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Loading Message */}
        <div className="text-center">
          <p className="text-foreground/90 text-lg font-medium animate-pulse">
            {currentMessage}
          </p>
        </div>

        {/* Optional decorative elements */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
