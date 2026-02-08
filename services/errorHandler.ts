/**
 * Parses diverse error objects into user-friendly messages.
 * handles Gemini API specific errors like 429 quota limits.
 */
export const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;

    const msg = error.message || JSON.stringify(error);

    // Check for Gemini/Google API Quota Limit (429)
    if (msg.includes('429') || msg.includes('Quota exceeded') || msg.includes('RESOURCE_EXHAUSTED')) {
        return "You've hit the Gemini free tier rate limit. Please wait a moment and try again.";
    }

    // Check for 503 Overloaded
    if (msg.includes('503') || msg.includes('overloaded')) {
        return "The AI service is currently overloaded. Please try again later.";
    }

    // Check for specific Zod parsing errors
    if (msg.includes('Schema validation failed')) {
        return "The AI didn't return a valid plan. Please try rephrasing your request.";
    }

    // Clean up generic "Error: " prefix
    return msg.replace(/^Error: /, '');
};
