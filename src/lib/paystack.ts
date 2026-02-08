// Paystack Integration Service
// Uses the Paystack Popup for seamless payment

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

interface PaystackConfig {
    email: string;
    amount: number; // Amount in Naira (will be converted to kobo)
    reference?: string;
    onSuccess: (response: { reference: string; transaction: string }) => void;
    onClose: () => void;
}

// Load Paystack script dynamically
function loadPaystackScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.PaystackPop) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v2/inline.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Paystack script'));
        document.head.appendChild(script);
    });
}

export async function initializePaystack(config: PaystackConfig) {
    await loadPaystackScript();

    const reference = config.reference || `ref_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const popup = new window.PaystackPop();
    popup.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email: config.email,
        amount: config.amount * 100, // Convert Naira to Kobo
        reference,
        onSuccess: (transaction: any) => {
            config.onSuccess({
                reference: transaction.reference,
                transaction: transaction.trxref
            });
        },
        onCancel: () => {
            config.onClose();
        }
    });
}

// Extend Window interface for Paystack
declare global {
    interface Window {
        PaystackPop: any;
    }
}
