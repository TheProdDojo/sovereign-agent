export enum TaskStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface UserProfile {
  name: string;
  email: string;
  context: string;
}

export interface ExecutionStep {
  id: string;
  description: string;
  tool?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface ExecutionPlan {
  title: string;
  intent: string;
  reasoning: string;
  steps: ExecutionStep[];
  riskLevel: RiskLevel;
  estimatedCost?: string;
  requiredTools: string[];
}

export interface TaskResult {
  summary: string;
  artifacts?: string[];
  costIncurred?: string;
  timestamp: string;
}

export interface Task {
  id: string;
  rawInput: string;
  status: TaskStatus;
  plan?: ExecutionPlan;
  result?: TaskResult;
  createdAt: number;
}
