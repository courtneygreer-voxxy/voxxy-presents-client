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
    <div className="mt-6 rounded-lg border-2 border-red-500/50 bg-card/90 p-4 shadow-lg shadow-red-500/20 backdrop-blur-sm dark:bg-black/40">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-red-500/20 border border-red-400/50 rounded flex items-center justify-center animate-pulse">
          <Database className="h-4 w-4 text-red-700 dark:text-red-300" />
        </div>
        <div>
          <h3 className="flex items-center gap-2 font-mono text-sm font-bold text-red-700 dark:text-red-300">
            <span className="text-green-400">{'>'}</span> DEBUG_{title.toUpperCase().replace(/\s/g, '_')}
          </h3>
          <p className="font-mono text-[10px] text-red-700/70 dark:text-red-400/60">admin.debug.context</p>
        </div>
        <div className="ml-auto px-2 py-1 bg-red-500/20 border border-red-400/50 rounded">
          <p className="font-mono text-[9px] font-bold text-red-700 dark:text-red-300">ADMIN ONLY</p>
        </div>
      </div>

      <details className="rounded border border-red-500/30 bg-card/95 p-3 dark:bg-black/60">
        <summary className="flex cursor-pointer items-center gap-2 font-mono text-xs text-red-700 transition-colors hover:text-red-800 dark:text-red-300 dark:hover:text-red-200">
          <span className="text-green-400">{'>'}</span>
          <span>JSON.stringify({title})</span>
          <span className="ml-2 text-amber-700 dark:text-yellow-400">[FULL CONTEXT]</span>
        </summary>
        <pre className="mt-3 max-h-[600px] overflow-auto rounded border border-red-500/20 bg-card p-3 text-[10px] text-red-700 dark:bg-black/80 dark:text-red-300">
{JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}
