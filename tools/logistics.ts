import { Tool, ToolResult } from './types';

export class ChowdeckTool implements Tool {
    name = "chowdeck_delivery";
    description = "Order delivery via Chowdeck";
    parameters = {
        type: "OBJECT",
        properties: {
            item: { type: "STRING", description: "Food item" },
            restaurant: { type: "STRING", description: "Restaurant name" },
            address: { type: "STRING", description: "Delivery address" }
        },
        required: ["item", "restaurant", "address"]
    };

    async execute(params: { item: string; restaurant: string; address: string }): Promise<ToolResult> {
        console.log(`[Chowdeck] Ordering ${params.item} from ${params.restaurant} to ${params.address}`);

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate dynamic pricing
        const estimatedCost = Math.floor(Math.random() * 3000) + 1500;

        return {
            success: true,
            costIncurred: estimatedCost,
            artifacts: [`Tracking Link: https://chowdeck.com/track/${Math.random().toString(36).substring(7)}`],
            data: { status: "ORDER_PLACED", eta: "45 mins" }
        };
    }
}
