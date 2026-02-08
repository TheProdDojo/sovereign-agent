import React from 'react';
import { Wallet, ShieldCheck } from 'lucide-react';

interface WalletWidgetProps {
  balance: number;
}

const WalletWidget: React.FC<WalletWidgetProps> = ({ balance }) => {
  return (
    <div className="flex items-center space-x-4 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 backdrop-blur-sm transition-colors duration-300">
      <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-full text-indigo-500 dark:text-indigo-400">
        <Wallet size={20} />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Managed Wallet</p>
        <div className="flex items-baseline space-x-2">
          <span className="text-lg font-bold text-slate-900 dark:text-white">₦{balance.toLocaleString()}</span>
          <span className="text-xs text-emerald-500 dark:text-emerald-400 flex items-center">
            <ShieldCheck size={12} className="mr-1" />
            Protected
          </span>
        </div>
      </div>
    </div>
  );
};

export default WalletWidget;