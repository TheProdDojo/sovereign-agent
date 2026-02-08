export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
    costIncurred?: number;
    artifacts?: string[]; // e.g., Receipt URL, Tracking Link
}

export interface Tool {
    name: string;
    description: string;
    parameters: any; // Schema object for function calling
    execute: (params: any) => Promise<ToolResult>;
}
