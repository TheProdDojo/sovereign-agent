import React, { useState } from 'react';
import { Wallet, Sun, Moon, User, LogOut, Plus } from 'lucide-react';
import { UserProfile } from '../types';
import { useStore } from '../store';
import { FundWalletModal } from './FundWalletModal';

interface HeaderProps {
  walletBalance: number;
  isDarkMode: boolean;
  toggleTheme: () => void;
  userProfile: UserProfile;
  onOpenProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({
  walletBalance,
  isDarkMode,
  toggleTheme,
  userProfile,
  onOpenProfile
}) => {
  const { user, signOut } = useStore();
  const [showFundModal, setShowFundModal] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">
              Sovereign Agent
            </h1>
          </div>

          <div className="flex items-center space-x-3 md:space-x-6">
            {/* Wallet Balance with Fund Button */}
            {user && (
              <button
                onClick={() => setShowFundModal(true)}
                className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group"
              >
                <Wallet size={16} className="text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-semibold font-mono text-slate-700 dark:text-slate-300">
                  ₦{walletBalance.toLocaleString()}
                </span>
                <Plus size={14} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onOpenProfile}
                    className="flex items-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2 rounded-full hover:opacity-90 transition-opacity"
                  >
                    <User size={18} />
                    <span className="text-sm font-medium hidden md:inline">{userProfile.name || 'Profile'}</span>
                  </button>
                  <button
                    onClick={signOut}
                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Fund Wallet Modal */}
      <FundWalletModal
        isOpen={showFundModal}
        onClose={() => setShowFundModal(false)}
      />
    </>
  );
};

export default Header;

