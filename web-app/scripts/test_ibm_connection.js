const https = require('https');
const fs = require('fs');
const path = require('path');

// Load env manually since we are running a standalone script
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const apiKey = env.IBM_ORCHESTRATE_API_KEY;
const baseUrl = env.IBM_ORCHESTRATE_BASE_URL;

console.log('Testing IBM Connection...');
console.log('URL:', baseUrl);
console.log('Key Length:', apiKey ? apiKey.length : 0);

// Function to get IAM Token
function getIamToken(apiKey) {
    return new Promise((resolve, reject) => {
        const data = new URLSearchParams();
        data.append('grant_type', 'urn:ibm:params:oauth:grant-type:apikey');
        data.append('apikey', apiKey);

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
        };

        const req = https.request('https://iam.cloud.ibm.com/identity/token', options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(body).access_token);
                } else {
                    reject(`IAM Error: ${res.statusCode} ${body}`);
                }
            });
        });

        req.on('error', reject);
        req.write(data.toString());
        req.end();
    });
}

async function testConnection() {
    try {
        console.log('1. Getting IAM Token...');
        const accessToken = await getIamToken(apiKey);
        console.log('✅ IAM Token received.');

        // Try the Orchestrate-specific endpoint structure
        // Orchestrate often uses /v1/skills or a different path for agents
        // Let's try the original URL but with /v2/assistants path, maybe the region prefix was the issue
        // Or it could be that we need to use the exact URL provided in credentials + /v2/assistants/...

        const agentId = 'c3a24b6e-6ee6-4a86-a7e4-14cb6393c1d4';
        // Try the base URL from env again, but ensure no double slashes
        const cleanBaseUrl = baseUrl.replace(/\/$/, '');
        const testUrl = `${cleanBaseUrl}/v2/assistants/${agentId}/message?version=2023-06-15`;

        console.log(`2. Testing Message to Agent (Original Base URL): ${agentId}`);
        console.log(`URL: ${testUrl}`);

        console.log(`2. Testing Message to Agent (Direct Assistant URL): ${agentId}`);
        console.log(`URL: ${testUrl}`);

        const payload = JSON.stringify({
            input: {
                message_type: 'text',
                text: 'Hello, are you online?'
            }
        });

        const url = new URL(testUrl);
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const req = https.request(url, options, (res) => {
            console.log(`Status Code: ${res.statusCode}`);
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('Response Body:', data);
                if (res.statusCode === 200) {
                    console.log('✅ Connection Successful! Agent responded.');
                } else {
                    console.log('❌ Connection Failed.');
                }
            });
        });

        req.on('error', (e) => console.error(e));
        req.write(payload);
        req.end();

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testConnection();
