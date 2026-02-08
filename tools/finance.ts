import { Tool, ToolResult } from './types';

export class MoniepointTool implements Tool {
    name = "moniepoint_transfer";
    description = "Tansfer money via Moniepoint";
    parameters = {
        type: "OBJECT",
        properties: {
            amount: { type: "NUMBER", description: "Amount in NGN" },
            recipient: { type: "STRING", description: "Recipient name" },
            bank: { type: "STRING", description: "Bank name" }
        },
        required: ["amount", "recipient", "bank"]
    };

    async execute(params: { amount: number; recipient: string; bank: string }): Promise<ToolResult> {
        console.log(`[Moniepoint] Initiating transfer of NGN ${params.amount} to ${params.recipient} (${params.bank})`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        return {
            success: true,
            costIncurred: params.amount, // The transfer amount is the cost
            artifacts: [`Transaction Receipt: MNP-${Math.random().toString(36).substring(7).toUpperCase()}`],
            data: { status: "SUCCESS", reference: `Ref-${Date.now()}` }
        };
    }
}
