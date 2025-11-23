const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Load env manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const apiKey = env.GEMINI_API_KEY;
console.log("API Key found:", apiKey ? "Yes (Length: " + apiKey.length + ")" : "No");

async function testGemini() {
    if (!apiKey) {
        console.error("❌ No API Key found.");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Try 'gemini-2.0-flash' (latest) or just list models
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        console.log("Sending message to Gemini (gemini-2.0-flash)...");
        const result = await model.generateContent("Hello, are you online?");
        const response = await result.response;
        const text = response.text();

        console.log("✅ Gemini Response:", text);
    } catch (error) {
        console.error("❌ Gemini Error:", error.message);
    }
}

testGemini();
