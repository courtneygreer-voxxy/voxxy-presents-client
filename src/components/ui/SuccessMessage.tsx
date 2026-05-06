import { CheckCircle2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessMessageProps {
  title?: string;
  message?: string;
  onComplete?: () => void;
  autoCloseDelay?: number; // milliseconds
}

export default function SuccessMessage({
  title = 'Success!',
  message = 'Your action was completed successfully.',
  onComplete,
  autoCloseDelay,
}: SuccessMessageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 50);

    // Auto close if specified
    if (autoCloseDelay && onComplete) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300); // Wait for fade out animation
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoCloseDelay, onComplete]);

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 transition-all duration-500 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="max-w-md space-y-6 text-center">
        {/* Success Icon with Animation */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-full border-2 border-green-500/40">
            <CheckCircle2 className="w-16 h-16 text-green-400 animate-scale-in" />
          </div>

          {/* Sparkles */}
          <Sparkles
            className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-spin-slow"
          />
          <Sparkles
            className="absolute -bottom-2 -left-2 w-5 h-5 text-primary animate-spin-slow"
            style={{ animationDelay: '0.5s' }}
          />
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground animate-fade-in-up">
            {title}
          </h3>
          <p className="text-foreground/70 text-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {message}
          </p>
        </div>

        {/* Confetti effect */}
        <div className="flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary animate-confetti"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
