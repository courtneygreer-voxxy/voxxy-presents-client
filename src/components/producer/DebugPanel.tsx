import { Database } from 'lucide-react';

interface DebugPanelProps {
  title: string;
  data: any;
  isAdmin?: boolean;
}

export function DebugPanel({ title, data, isAdmin = false }: DebugPanelProps) {
  // Only render for admin users
  if (!isAdmin) return null;

  return (
    <div className="mt-6 bg-black/40 backdrop-blur-sm border-2 border-red-500/50 rounded-lg p-4 shadow-lg shadow-red-500/20">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-red-500/20 border border-red-400/50 rounded flex items-center justify-center animate-pulse">
          <Database className="h-4 w-4 text-red-300" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-red-300 font-mono flex items-center gap-2">
            <span className="text-green-400">{'>'}</span> DEBUG_{title.toUpperCase().replace(/\s/g, '_')}
          </h3>
          <p className="text-[10px] text-red-400/60 font-mono">admin.debug.context</p>
        </div>
        <div className="ml-auto px-2 py-1 bg-red-500/20 border border-red-400/50 rounded">
          <p className="text-[9px] text-red-300 font-mono font-bold">ADMIN ONLY</p>
        </div>
      </div>

      <details className="bg-black/60 border border-red-500/30 rounded p-3">
        <summary className="text-red-300 cursor-pointer hover:text-red-200 transition-colors font-mono text-xs flex items-center gap-2">
          <span className="text-green-400">{'>'}</span>
          <span>JSON.stringify({title})</span>
          <span className="text-yellow-400 ml-2">[FULL CONTEXT]</span>
        </summary>
        <pre className="mt-3 p-3 bg-black/80 rounded text-[10px] overflow-auto max-h-[600px] text-red-300 border border-red-500/20">
{JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}
