import { Tool, ToolResult } from './types';

export class EmailTool implements Tool {
    name = "send_email";
    description = "Send an email";
    parameters = {
        type: "OBJECT",
        properties: {
            to: { type: "STRING", description: "Recipient email" },
            subject: { type: "STRING", description: "Email subject" },
            body: { type: "STRING", description: "Email body" }
        },
        required: ["to", "subject", "body"]
    };

    async execute(params: { to: string; subject: string; body: string }): Promise<ToolResult> {
        console.log(`[Email] Sending to ${params.to}: ${params.subject}`);

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            success: true,
            costIncurred: 0,
            artifacts: [],
            data: { status: "SENT" }
        };
    }
}
