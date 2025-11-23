const https = require('https');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const apiKey = env.IBM_ORCHESTRATE_API_KEY;
const baseUrl = env.IBM_ORCHESTRATE_BASE_URL.replace(/\/$/, '');

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

function makeRequest(url, method, token) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        };

        console.log(`Testing ${method} ${url}`);
        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: body });
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function debugEndpoints() {
    try {
        console.log('Getting IAM Token...');
        const token = await getIamToken(apiKey);
        console.log('Token received.');

        // Test 1: List Assistants (Assistant v2)
        const assistantsUrl = `${baseUrl}/v2/assistants?version=2023-06-15`;
        const res1 = await makeRequest(assistantsUrl, 'GET', token);
        console.log(`\n--- /v2/assistants ---`);
        console.log(`Status: ${res1.status}`);
        console.log(`Body: ${res1.body.substring(0, 500)}`); // Truncate

        // Test 2: List Skills (Orchestrate)
        // Note: Orchestrate API might be different.
        // Trying a common Orchestrate endpoint if it exists
        const skillsUrl = `${baseUrl}/v1/skills`;
        const res2 = await makeRequest(skillsUrl, 'GET', token);
        console.log(`\n--- /v1/skills ---`);
        console.log(`Status: ${res2.status}`);
        console.log(`Body: ${res2.body.substring(0, 500)}`);

        // Test 3: Check if the base URL itself returns something
        const res3 = await makeRequest(baseUrl, 'GET', token);
        console.log(`\n--- Base URL ---`);
        console.log(`Status: ${res3.status}`);
        console.log(`Body: ${res3.body.substring(0, 500)}`);

        // Test 4: Try US-South Region (Speculative)
        const usSouthUrl = baseUrl.replace('au-syd', 'us-south') + '/v2/assistants?version=2023-06-15';
        const res4 = await makeRequest(usSouthUrl, 'GET', token);
        console.log(`\n--- US-South Speculative Check ---`);
        console.log(`Status: ${res4.status}`);
        console.log(`Body: ${res4.body.substring(0, 500)}`);

        // Test 5: Try Watson Assistant Domain (instead of Orchestrate)
        const assistantDomainUrl = baseUrl.replace('watson-orchestrate.cloud.ibm.com', 'assistant.watson.cloud.ibm.com') + '/v2/assistants?version=2023-06-15';
        const res5 = await makeRequest(assistantDomainUrl, 'GET', token);
        console.log(`\n--- Watson Assistant Domain Check ---`);
        console.log(`Status: ${res5.status}`);
        console.log(`Body: ${res5.body}`); // Print full body

        // Test 6: Try Watson Assistant Domain with US-South
        const assistantDomainUsSouthUrl = baseUrl.replace('au-syd', 'us-south').replace('watson-orchestrate.cloud.ibm.com', 'assistant.watson.cloud.ibm.com') + '/v2/assistants?version=2023-06-15';
        const res6 = await makeRequest(assistantDomainUsSouthUrl, 'GET', token);
        console.log(`\n--- Watson Assistant Domain (US-South) Check ---`);
        console.log(`Status: ${res6.status}`);
        console.log(`Body: ${res6.body.substring(0, 500)}`);

        // Test 8: Try Messaging the Agent directly on Watson Assistant Domain
        // We got 403 on listing, but maybe we can message?
        const agentId = 'c3a24b6e-6ee6-4a86-a7e4-14cb6393c1d4';
        const messageUrl = baseUrl.replace('watson-orchestrate.cloud.ibm.com', 'assistant.watson.cloud.ibm.com') + `/v2/assistants/${agentId}/message?version=2023-06-15`;

        const payload = JSON.stringify({
            input: {
                message_type: 'text',
                text: 'Hello'
            }
        });

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        console.log(`\n--- Messaging Agent on Watson Assistant Domain ---`);
        console.log(`URL: ${messageUrl}`);

        const req = https.request(messageUrl, options, (res) => {
            console.log(`Status: ${res.statusCode}`);
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log(`Body: ${body.substring(0, 500)}`);
            });
        });
        req.on('error', (e) => console.error(e));
        req.write(payload);
        req.end();
    } catch (err) {
        console.error('Debug failed:', err);
    }
}

debugEndpoints();
