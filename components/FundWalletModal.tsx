import { useState } from 'react';
import { Wallet, X } from 'lucide-react';
import { initializePaystack } from '../src/lib/paystack';
import { useStore } from '../store';
import { toast } from 'sonner';

interface FundWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PRESET_AMOUNTS = [5000, 10000, 20000, 50000];

export function FundWalletModal({ isOpen, onClose }: FundWalletModalProps) {
    const [amount, setAmount] = useState<number>(5000);
    const [isLoading, setIsLoading] = useState(false);
    const { user, walletBalance, setWalletBalance } = useStore();

    if (!isOpen) return null;

    const handleFund = async () => {
        if (!user?.email) {
            toast.error('Please sign in to fund your wallet');
            return;
        }

        if (amount < 100) {
            toast.error('Minimum amount is ₦100');
            return;
        }

        setIsLoading(true);

        try {
            await initializePaystack({
                email: user.email,
                amount,
                onSuccess: async (response) => {
                    // Update wallet balance
                    const newBalance = walletBalance + amount;
                    await setWalletBalance(newBalance);

                    toast.success(`Successfully added ₦${amount.toLocaleString()} to your wallet!`);
                    onClose();
                },
                onClose: () => {
                    setIsLoading(false);
                }
            });
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Failed to initialize payment');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 border border-slate-700 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Wallet className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Fund Wallet</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Current Balance */}
                <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-slate-400 mb-1">Current Balance</p>
                    <p className="text-2xl font-bold text-white">₦{walletBalance.toLocaleString()}</p>
                </div>

                {/* Preset Amounts */}
                <div className="mb-4">
                    <p className="text-sm text-slate-400 mb-3">Quick Select</p>
                    <div className="grid grid-cols-4 gap-2">
                        {PRESET_AMOUNTS.map((preset) => (
                            <button
                                key={preset}
                                onClick={() => setAmount(preset)}
                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${amount === preset
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                            >
                                ₦{(preset / 1000)}k
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Amount */}
                <div className="mb-6">
                    <label className="text-sm text-slate-400 mb-2 block">Or enter custom amount</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₦</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            min={100}
                            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Enter amount"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleFund}
                        disabled={isLoading || amount < 100}
                        className="flex-1 py-3 px-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>Pay ₦{amount.toLocaleString()}</>
                        )}
                    </button>
                </div>

                {/* Security Note */}
                <p className="text-xs text-slate-500 text-center mt-4">
                    Secured by Paystack. Your payment information is encrypted.
                </p>
            </div>
        </div>
    );
}
