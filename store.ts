import { create } from 'zustand';
import { Task, UserProfile } from './types';
import { supabase } from './src/lib/supabase';
import { toast } from 'sonner';

interface State {
    tasks: Task[];
    walletBalance: number;
    userProfile: UserProfile;
    isProcessing: boolean;
    user: any | null; // Supabase user

    // Actions
    initialize: () => Promise<void>;
    addTask: (task: Task) => Promise<void>;
    updateTask: (task: Task) => Promise<void>;
    removeTask: (id: string) => Promise<void>;
    setWalletBalance: (amount: number) => Promise<void>;
    updateUserProfile: (profile: UserProfile) => Promise<void>;
    setProcessing: (isProcessing: boolean) => void;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    loadUserData: (userId: string, email?: string) => Promise<void>;
}

export const useStore = create<State>((set, get) => ({
    tasks: [],
    walletBalance: 254000,
    userProfile: { name: '', email: '', context: '' },
    isProcessing: false,
    user: null,

    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            set({ user: session?.user || null });

            if (session?.user) {
                await get().loadUserData(session.user.id, session.user.email);
            }

            supabase.auth.onAuthStateChange(async (_event, session) => {
                const currentUser = get().user;
                const newUser = session?.user || null;

                if (currentUser?.id !== newUser?.id) {
                    set({ user: newUser });
                    if (newUser) {
                        await get().loadUserData(newUser.id, newUser.email);
                    } else {
                        set({ tasks: [], walletBalance: 254000, userProfile: { name: '', email: '', context: '' } });
                    }
                }
            });

        } catch (error) {
            console.error('Failed to initialize store:', error);
        }
    },

    addTask: async (task: Task) => {
        const { user } = get();
        if (!user) {
            toast.error("Please sign in to save tasks");
            return;
        }

        const { error } = await supabase.from('tasks').insert({
            id: task.id,
            user_id: user.id,
            raw_input: task.rawInput,
            status: task.status,
            created_at: new Date(task.createdAt).toISOString(),
            plan: task.plan,
            result: task.result
        });

        if (error) {
            console.error('Supabase error:', error);
            toast.error("Failed to save task");
        } else {
            set(state => ({ tasks: [task, ...state.tasks] }));
        }
    },

    updateTask: async (updatedTask: Task) => {
        const { user } = get();
        if (!user) return;

        const { error } = await supabase.from('tasks').update({
            status: updatedTask.status,
            plan: updatedTask.plan,
            result: updatedTask.result
        }).eq('id', updatedTask.id);

        if (error) {
            console.error('Supabase error:', error);
        } else {
            set(state => ({
                tasks: state.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
            }));
        }
    },

    removeTask: async (id: string) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (!error) {
            set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
        }
    },

    setWalletBalance: async (amount: number) => {
        const { user } = get();
        set({ walletBalance: amount }); // Optimistic update

        if (user) {
            await supabase.from('profiles').update({ wallet_balance: amount }).eq('id', user.id);
        }
    },

    updateUserProfile: async (profile: UserProfile) => {
        const { user } = get();
        set({ userProfile: profile }); // Optimistic

        if (user) {
            await supabase.from('profiles').update({
                full_name: profile.name,
                context: profile.context
            }).eq('id', user.id);
        }
    },

    setProcessing: (isProcessing: boolean) => set({ isProcessing }),

    signInWithEmail: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            toast.error(error.message);
            throw error;
        }
    },

    signUpWithEmail: async (email, password) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: email.split('@')[0]
                }
            }
        });
        if (error) {
            toast.error(error.message);
            throw error;
        } else {
            toast.success("Account created! You may need to verify your email.", { duration: 5000 });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, tasks: [], userProfile: { name: '', email: '', context: '' } });
    },

    loadUserData: async (userId: string, email?: string) => {
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileData) {
            set({
                userProfile: {
                    name: profileData.full_name || '',
                    email: email || '',
                    context: profileData.context || ''
                },
                walletBalance: profileData.wallet_balance || 254000
            });
        }

        const { data: tasksData } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (tasksData) {
            const mappedTasks = tasksData.map((t: any) => ({
                ...t,
                createdAt: new Date(t.created_at).getTime(),
                plan: t.plan,
                result: t.result
            }));
            set({ tasks: mappedTasks });
        }
    }
}));
