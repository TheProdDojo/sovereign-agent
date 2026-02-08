import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import Header from './components/Header';
import TaskInput from './components/TaskInput';
import TaskCard from './components/TaskCard';
import AuthForm from './components/AuthForm';
import ApprovalModal from './components/ApprovalModal';
import ProfileModal from './components/ProfileModal';
import { Task, TaskStatus } from './types';
import { createExecutionPlan, executeTaskWithAgent } from './services/gemini';
import { getErrorMessage } from './services/errorHandler';
import { useStore } from './store';

const App: React.FC = () => {
  // Global State
  const {
    tasks,
    walletBalance,
    userProfile,
    isProcessing,
    initialize,
    user,
    addTask,
    updateTask,
    removeTask,
    setWalletBalance,
    updateUserProfile,
    setProcessing
  } = useStore();

  // Local UI State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Initialize Store (Load from DB)
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleAddTask = async (rawInput: string) => {
    setProcessing(true);
    const toastId = toast.loading('Analyzing your request...');

    const newTask: Task = {
      id: crypto.randomUUID(),
      rawInput,
      status: TaskStatus.ANALYZING,
      createdAt: Date.now(),
    };

    try {
      await addTask(newTask);

      // 1. Generate Plan with Profile Context
      const plan = await createExecutionPlan(rawInput, userProfile);

      const updatedTask = {
        ...newTask,
        status: TaskStatus.APPROVAL_REQUIRED,
        plan: { ...plan, riskLevel: plan.riskLevel as RiskLevel }
      };
      await updateTask(updatedTask);

      toast.success('Plan generated! Please review.', { id: toastId });

    } catch (error: any) {
      console.error(error);
      const failedTask = { ...newTask, status: TaskStatus.FAILED };
      await updateTask(failedTask);
      toast.error(getErrorMessage(error), { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveTask = async () => {
    if (!selectedTask || !selectedTask.plan) return;

    const taskToExecute = selectedTask;
    setSelectedTask(null); // Close modal

    const toastId = toast.loading('Executing plan...');

    // Update status to Executing
    const executingTask = { ...taskToExecute, status: TaskStatus.EXECUTING };
    await updateTask(executingTask);

    try {
      // 2. Execute Task
      const result = await executeTaskWithAgent(executingTask.plan!);

      // Update Balance if cost incurred
      if (result.costIncurred) {
        const cost = parseInt(result.costIncurred.replace(/[^0-9]/g, '')) || 0;
        await setWalletBalance(walletBalance - cost);
      }

      const completedTask = { ...executingTask, status: TaskStatus.COMPLETED, result };
      await updateTask(completedTask);

      toast.success('Task executed successfully!', { id: toastId });

    } catch (error: any) {
      console.error(error);
      const failedTask = { ...executingTask, status: TaskStatus.FAILED };
      await updateTask(failedTask);
      toast.error(getErrorMessage(error), { id: toastId });
    }
  };

  const handleRejectTask = async () => {
    if (!selectedTask) return;
    await removeTask(selectedTask.id);
    setSelectedTask(null);
    toast.info('Task cancelled');
  };

  const handleUpdateProfile = async (profile: any) => {
    await updateUserProfile(profile);
    setIsProfileOpen(false);
    toast.success('Profile updated');
  };

  const handleRetryTask = async (task: Task) => {
    await removeTask(task.id);
    handleAddTask(task.rawInput);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-indigo-500/30 transition-colors duration-300">
      <Toaster position="top-center" richColors theme={isDarkMode ? 'dark' : 'light'} />

      <Header
        walletBalance={walletBalance}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <main className="pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto">

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Command Center
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Delegate complex execution to your Sovereign Agent.
          </p>
        </div>

        {!user ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AuthForm />
          </div>
        ) : (
          <>
            <TaskInput onAddTask={handleAddTask} isProcessing={isProcessing} />

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Operations</h3>
                <span className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded text-slate-500">
                  {tasks.length} Total
                </span>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-300 dark:border-slate-900 rounded-2xl">
                  <p className="text-slate-500 dark:text-slate-600">No active operations. Initiate a task to begin.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onReview={setSelectedTask}
                      onRetry={handleRetryTask}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {selectedTask && (
        <ApprovalModal
          task={selectedTask}
          onApprove={handleApproveTask}
          onReject={handleRejectTask}
        />
      )}

      <ProfileModal
        profile={userProfile}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSave={handleUpdateProfile}
      />
    </div>
  );
};

export default App;
