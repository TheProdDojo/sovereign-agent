import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Task, UserProfile } from '../types';

interface SovereignDB extends DBSchema {
    tasks: {
        key: string;
        value: Task;
    };
    settings: {
        key: string;
        value: number | UserProfile; // Wallet balance or profile
    };
}

const DB_NAME = 'SovereignAgentDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<SovereignDB>>;

export const getDB = () => {
    if (!dbPromise) {
        dbPromise = openDB<SovereignDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('tasks')) {
                    db.createObjectStore('tasks', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings');
                }
            },
        });
    }
    return dbPromise;
};

// --- Tasks ---

export const saveTask = async (task: Task) => {
    const db = await getDB();
    return db.put('tasks', task);
};

export const getAllTasks = async () => {
    const db = await getDB();
    return db.getAll('tasks');
};

export const deleteTask = async (id: string) => {
    const db = await getDB();
    return db.delete('tasks', id);
};

// --- Settings (Wallet & Profile) ---

export const getWalletBalance = async (): Promise<number> => {
    const db = await getDB();
    const balance = await db.get('settings', 'walletBalance');
    return (balance as number) || 254000; // Default
};

export const updateWalletBalance = async (newBalance: number) => {
    const db = await getDB();
    return db.put('settings', newBalance, 'walletBalance');
};

export const getUserProfile = async (): Promise<UserProfile | undefined> => {
    const db = await getDB();
    const profile = await db.get('settings', 'userProfile');
    return profile as UserProfile;
};

export const saveUserProfile = async (profile: UserProfile) => {
    const db = await getDB();
    return db.put('settings', profile, 'userProfile');
};
