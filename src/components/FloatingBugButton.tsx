import { Bug } from 'lucide-react';

interface FloatingBugButtonProps {
  onClick: () => void;
}

export default function FloatingBugButton({ onClick }: FloatingBugButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center z-40 group"
      title="Report a bug"
    >
      <Bug className="w-5 h-5 group-hover:scale-110 transition-transform" />
      <span className="absolute -top-10 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Report Bug
      </span>
    </button>
  );
}
