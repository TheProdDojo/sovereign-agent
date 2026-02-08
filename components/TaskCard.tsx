import React from 'react';
import { Task, TaskStatus } from '../types';
import { Clock, CheckCircle2, AlertTriangle, Loader2, ArrowRight, Banknote, RotateCcw } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onReview: (task: Task) => void;
  onRetry: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onReview, onRetry }) => {
  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.ANALYZING:
        return { color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/20', icon: Loader2, label: 'Analyzing', animate: true };
      case TaskStatus.APPROVAL_REQUIRED:
        return { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20', icon: Clock, label: 'Review Needed', animate: false };
      case TaskStatus.EXECUTING:
        return { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20', icon: Loader2, label: 'Executing', animate: true };
      case TaskStatus.COMPLETED:
        return { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20', icon: CheckCircle2, label: 'Completed', animate: false };
      case TaskStatus.FAILED:
        return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-100 dark:border-red-500/20', icon: AlertTriangle, label: 'Failed', animate: false };
      default:
        return { color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700', icon: Clock, label: 'Pending', animate: false };
    }
  };

  const config = getStatusConfig(task.status);
  const Icon = config.icon;

  return (
    <div className={`group relative bg-white dark:bg-slate-900/40 border ${config.border} dark:border-slate-700 rounded-xl p-5 hover:bg-slate-50 dark:hover:bg-slate-900/60 shadow-sm transition-all duration-300`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.color} ${config.border}`}>
          <Icon size={12} className={config.animate ? 'animate-spin' : ''} />
          <span>{config.label}</span>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
          {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-slate-900 dark:text-white font-medium text-lg leading-snug mb-1">
          {task.plan?.title || task.rawInput}
        </h3>
        {task.plan && (
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{task.plan.reasoning}</p>
        )}
      </div>

      {/* Task Result Summary */}
      {task.status === TaskStatus.COMPLETED && task.result && (
        <div className="mt-4 bg-slate-50 dark:bg-slate-950/50 rounded-lg p-3 border border-slate-200 dark:border-slate-800/50">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <CheckCircle2 size={14} />
            <span className="text-xs font-bold uppercase">Success Report</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{task.result.summary}</p>
          {task.result.costIncurred && (
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-500 space-x-1">
              <Banknote size={12} />
              <span>Cost: {task.result.costIncurred}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      {task.status === TaskStatus.APPROVAL_REQUIRED && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-end">
          <button
            onClick={() => onReview(task)}
            className="flex items-center space-x-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 transition-colors"
          >
            <span>Review Plan</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {task.status === TaskStatus.FAILED && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-end">
          <button
            onClick={() => onRetry(task)}
            className="flex items-center space-x-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors"
          >
            <RotateCcw size={16} />
            <span>Retry</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;