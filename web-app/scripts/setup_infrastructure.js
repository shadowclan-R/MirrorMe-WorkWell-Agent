const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load env vars from ROOT
const envPath = path.resolve(__dirname, '../../.env.local');
console.log(`Loading env from: ${envPath}`);

if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} else {
    console.error("❌ .env.local not found in root!");
    process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function runSQL() {
    console.log('🔌 Connecting to Database...');

    // Parse connection string manually to avoid parsing issues with special chars
    // Connection string: process.env.DATABASE_URL
    // We need the RAW password for the object config

    const client = new Client({
        host: process.env.DB_HOST || 'db.mqjnexnvtgejrlxfgkyu.supabase.co',
        port: 5432,
        user: 'postgres',
        password: process.env.DB_PASSWORD || 'PLACEHOLDER_PASSWORD',
        database: 'postgres',
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
        await client.connect();
        console.log('✅ Connected to Database.');

        // Read Schema
        const schemaPath = path.resolve(__dirname, '../../db/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('📜 Running Schema...');
        await client.query(schemaSql);
        console.log('✅ Schema applied.');

        // Read Seed
        const seedPath = path.resolve(__dirname, '../../db/seed.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');

        console.log('🌱 Running Seed...');
        await client.query(seedSql);
        console.log('✅ Seed data applied.');

    } catch (err) {
        console.error('❌ Database Error:', err);
    } finally {
        await client.end();
    }
}

async function setupBuckets() {
    console.log('🪣 Setting up Storage Buckets...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const buckets = ['manager_packets', 'employee_packets'];

    for (const bucket of buckets) {
        const { data, error } = await supabase.storage.getBucket(bucket);

        if (error && error.message.includes('not found')) {
            console.log(`   Creating bucket: ${bucket}`);
            const { error: createError } = await supabase.storage.createBucket(bucket, {
                public: false,
                fileSizeLimit: 10485760, // 10MB
                allowedMimeTypes: ['application/json', 'text/plain', 'application/pdf']
            });

            if (createError) {
                console.error(`   ❌ Failed to create ${bucket}:`, createError.message);
            } else {
                console.log(`   ✅ Created bucket: ${bucket}`);
            }
        } else if (data) {
            console.log(`   ℹ️ Bucket ${bucket} already exists.`);
        } else {
            // Sometimes getBucket returns error even if it exists but we don't have permission, 
            // or it returns a specific error object.
            // Let's try to create it anyway if it's not found, otherwise log.
            console.log(`   ⚠️ Checking bucket ${bucket} returned error: ${error?.message ?? 'Unknown issue'}. Attempting creation...`);
            const { error: createError } = await supabase.storage.createBucket(bucket, {
                public: false,
                fileSizeLimit: 10485760, // 10MB
                allowedMimeTypes: ['application/json', 'text/plain', 'application/pdf']
            });
            if (createError) {
                console.error(`   ❌ Failed to create ${bucket}:`, createError.message);
            } else {
                console.log(`   ✅ Created bucket: ${bucket}`);
            }
        }
    }
}

async function main() {
    await runSQL();
    await setupBuckets();
    console.log('🚀 Infrastructure Setup Complete.');
}

main();
