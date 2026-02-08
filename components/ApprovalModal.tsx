import React from 'react';
import { Task, ExecutionPlan } from '../types';
import { ShieldAlert, CheckCircle, XCircle, ChevronRight, Activity, Cpu } from 'lucide-react';

interface ApprovalModalProps {
  task: Task;
  onApprove: () => void;
  onReject: () => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ task, onApprove, onReject }) => {
  const plan = task.plan as ExecutionPlan;
  if (!plan) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/20 dark:bg-slate-950/90 backdrop-blur-sm" onClick={onReject}></div>
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-amber-500">
              <ShieldAlert size={20} />
              <span className="text-sm font-bold uppercase tracking-wider">Bounded Autonomy Gate</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-bold border ${
                plan.riskLevel === 'HIGH' ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400' :
                plan.riskLevel === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400' :
                'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }`}>
              {plan.riskLevel} RISK
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{plan.title}</h2>
        </div>

        {/* Content Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {/* Reasoning Trace */}
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2 mb-2 text-indigo-600 dark:text-indigo-400">
                    <Cpu size={16} />
                    <h3 className="text-sm font-semibold uppercase">Reasoning Trace</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {plan.reasoning}
                </p>
            </div>

            {/* Financial Impact */}
            {plan.estimatedCost && plan.estimatedCost !== '0 NGN' && (
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Estimated Financial Impact</span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold text-lg">{plan.estimatedCost}</span>
                </div>
            )}

            {/* Steps */}
            <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Execution Plan</h3>
                <div className="space-y-3">
                    {plan.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800/50">
                            <div className="mt-0.5 w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-xs font-mono text-slate-600 dark:text-slate-300">
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <p className="text-slate-700 dark:text-slate-200 text-sm">{step.description}</p>
                                {step.tool && (
                                    <div className="flex items-center space-x-1 mt-1 text-xs text-slate-500 dark:text-slate-500">
                                        <Activity size={10} />
                                        <span>Using: {step.tool}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0">
            <div className="flex space-x-4">
                <button 
                    onClick={onReject}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition font-medium flex items-center justify-center space-x-2"
                >
                    <XCircle size={18} />
                    <span>Reject Plan</span>
                </button>
                <button 
                    onClick={onApprove}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-primary-600 text-white hover:from-indigo-500 hover:to-primary-500 transition font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2"
                >
                    <CheckCircle size={18} />
                    <span>Approve Execution</span>
                    <ChevronRight size={16} className="opacity-50" />
                </button>
            </div>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
                By approving, you authorize the Sovereign Agent to execute these actions on your behalf.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;