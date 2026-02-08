import React, { useState } from 'react';
import { Send, Mic, Sparkles } from 'lucide-react';

interface TaskInputProps {
  onAddTask: (text: string) => void;
  isProcessing: boolean;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, isProcessing }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onAddTask(input);
      setInput('');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xl dark:shadow-2xl transition-colors duration-300">
          <button
            type="button"
            className="p-3 text-slate-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Mic size={20} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            placeholder="Describe a task (e.g., 'Pay my IKEDC bill of 5,000 NGN')"
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 text-lg"
          />

          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className={`p-3 rounded-xl flex items-center justify-center transition-all duration-300 ${input.trim() && !isProcessing
              ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-500'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
          >
            {isProcessing ? (
              <Sparkles className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <div className="mt-3 flex justify-between items-center px-2">
          <div className="flex space-x-2 text-xs text-slate-500">
            <span className="bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded">⌘K Commands</span>
            <span className="bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded">Voice Mode</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-600">Powered by Gemini 2.5 Flash</p>
        </div>
      </form>
    </div>
  );
};

export default TaskInput;