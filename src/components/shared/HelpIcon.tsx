import { HelpCircle } from 'lucide-react';

interface HelpIconProps {
  onClick: () => void;
  label?: string;
}

export function HelpIcon({ onClick, label = 'Start guide' }: HelpIconProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3 py-2 voxxy-btn-solid text-xs font-medium rounded-full shadow-lg shadow-primary/25 transition-all hover:scale-105"
      aria-label={label}
    >
      <HelpCircle className="w-4 h-4" />
      <span className="hidden sm:inline">Guide</span>
    </button>
  );
}
