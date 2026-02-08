import { Tool } from './types';
import { MoniepointTool } from './finance';
import { ChowdeckTool } from './logistics';
import { EmailTool } from './communication';

export * from './finance';
export * from './logistics';
export * from './communication';
export * from './types';

// Instantiate tools
export const moniepointTool = new MoniepointTool();
export const chowdeckTool = new ChowdeckTool();
export const emailTool = new EmailTool();

// Helper to get all tool definitions for Gemini
export const getAllToolsForGemini = () => {
    return [moniepointTool, chowdeckTool, emailTool].map(tool => ({
        functionDeclarations: [{
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
        }]
    }));
};
