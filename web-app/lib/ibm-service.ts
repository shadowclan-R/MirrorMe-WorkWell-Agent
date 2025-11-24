// Helper to get IAM Token
async function getIamToken(apiKey: string): Promise<string> {
    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ibm:params:oauth:grant-type:apikey');
    params.append('apikey', apiKey);

    const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: params
    });

    if (!response.ok) {
        throw new Error(`Failed to get IAM token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
}

export async function sendMessageToIBM(message: string, history: { role: string; content: string }[], systemPrompt: string) {
    const apiKey = process.env.IBM_ORCHESTRATE_API_KEY;
    const apiUrl = process.env.IBM_ORCHESTRATE_BASE_URL;
    // We need the Assistant ID / Agent ID to target the specific agent
    const assistantId = process.env.IBM_ORCHESTRATE_AGENT_ID;

    if (!apiKey || !apiUrl) {
        throw new Error('IBM Credentials not configured in .env.local');
    }

    try {
        // 1. Get Access Token
        const accessToken = await getIamToken(apiKey);

        // 2. Send Message to Assistant v2 API (Standard for Orchestrate Agents)
        // Endpoint: {url}/v2/assistants/{assistant_id}/message?version=2023-06-15

        if (!assistantId) {
            console.warn('IBM_ORCHESTRATE_AGENT_ID is missing. Please add it to .env.local');
            // For now, throw error so the UI falls back to mock response
            throw new Error('Agent ID is missing');
        }

        // Note: The URL structure might vary. Usually it is {instance_url}/v2/assistants/{id}/message
        // If the provided URL is 'watson-orchestrate', we might need to switch to 'assistant.watson.cloud.ibm.com'
        // or use the specific Orchestrate endpoint.

        const endpoint = `${apiUrl}/v2/assistants/${assistantId}/message?version=2023-06-15`;

        // If the base URL is orchestrate, but we are using an Assistant ID, we might need to target the Assistant API directly
        // However, 403 suggests the Key is valid for IAM but not for that specific resource instance.
        // This usually means the Service Credential created is for 'Orchestrate' but we are trying to hit 'Assistant'.
        // OR the Agent ID is from a different service instance.

        // For now, we will stick to the provided URL but log the error clearly.
        // If this fails in production, we might need to ask the user to check if they created a 'Watson Assistant' credential or 'Orchestrate' credential.

        const payload = {
            input: {
                message_type: 'text',
                text: message,
                options: {
                    return_context: true
                }
            },
            context: {
                global: {
                    system: {
                        user_id: 'my_user_id' // Should be dynamic in real app
                    }
                },
                skills: {
                    'main skill': {
                        user_defined: {
                            system_prompt: systemPrompt
                        }
                    }
                }
            }
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('IBM API Error Body:', errorText);
            throw new Error(`IBM API responded with ${response.status}`);
        }

        const data = await response.json();
        // Assistant v2 response structure
        return data.output?.generic?.[0]?.text || 'I am processing your request...';

    } catch (error) {
        console.error('Error calling IBM service:', error);
        throw error;
    }
}

/**
 * Fetches AI-driven analytics insights.
 * Tries IBM first, then returns null to allow fallback.
 */
export async function getAIAnalytics(contextData: unknown, type: 'HR' | 'EMPLOYEE' = 'HR') {
    const systemPrompt = type === 'HR'
        ? `You are an expert HR Data Analyst. Analyze the provided data and return a JSON object with insights.
           Format:
           {
             "insights": [
               { "type": "risk"|"trend"|"positive", "title": "string", "description": "string", "priority": "high"|"medium"|"low" }
             ],
             "recommendations": [
               { "title": "string", "action": "string", "target": "string" }
             ]
           }
           Keep it concise.`
        : `You are a personal wellbeing coach. Analyze the user's data and return a JSON object.
           Format:
           {
             "insights": [ ... ],
             "recommendations": [ ... ]
           }
           Keep it encouraging.`;

    const message = `Analyze this data: ${JSON.stringify(contextData)}`;

    try {
        // 1. Try IBM
        console.log('Attempting to fetch analytics from IBM...');
        const ibmResponse = await sendMessageToIBM(message, [], systemPrompt);

        // Try to parse JSON from IBM response (it might be wrapped in text)
        const jsonMatch = ibmResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch (ibmError) {
        console.warn('IBM Analytics failed:', ibmError);
        return null;
    }
}
