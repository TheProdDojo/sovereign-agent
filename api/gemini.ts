import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

if (!apiKey) {
    console.error("API Key not found in environment variables");
    console.log("Available Env Keys:", Object.keys(process.env));
}

const ai = new GoogleGenerativeAI(apiKey);

export default async function handler(req, res) {
    // CORS Support
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, model, systemInstruction, tools, generationConfig } = req.body;

        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
        }

        const genModel = ai.getGenerativeModel({
            model: model || 'gemini-2.0-flash',
            systemInstruction,
            // tools: tools, // Client passes tools definitions? 
            // Note: passing tools definitions from client to server might be tricky if they are not plain objects.
            // But for now let's assume they are passed as JSON compatible objects (FunctionDeclarations).
            // If tools are not passed, we don't include them.
            ...(tools ? { tools } : {}),
            generationConfig
        });

        const result = await genModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // We strictly return text for simplicity in this architecture
        return res.status(200).json({
            text
        });

    } catch (error) {
        console.error('Gemini API Error:', error);
        return res.status(500).json({
            error: error.message || 'Internal Server Error',
            details: error
        });
    }
}
