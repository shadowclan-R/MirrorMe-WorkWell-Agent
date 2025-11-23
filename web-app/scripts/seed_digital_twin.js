const { createClient } = require('@supabase/supabase-js');
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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDigitalTwin() {
    console.log('Seeding Digital Twin Data...');

    // 1. Get the test employee
    const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('email', 'ryan.alfaid@company.com')
        .single();

    if (empError || !employee) {
        console.error('Test employee not found. Run seed_data_api.js first.');
        return;
    }

    const employeeId = employee.id;
    console.log(`Found Employee ID: ${employeeId}`);

    // 2. Upsert Digital Twin State
    const { error: stateError } = await supabase
        .from('digital_twin_states')
        .upsert({
            employee_id: employeeId,
            current_state: 'STABLE',
            summary_text: 'Your digital twin is functioning normally. Recent activity indicates balanced workload.',
            metrics: { physical: 85, emotional: 78, productivity: 92 },
            last_updated: new Date().toISOString()
        }, { onConflict: 'employee_id' });

    if (stateError) {
        console.error('Error seeding state:', stateError);
    } else {
        console.log('✅ Digital Twin State seeded.');
    }

    // 3. Insert Digital Twin Report
    const { error: reportError } = await supabase
        .from('digital_twin_reports')
        .insert({
            employee_id: employeeId,
            health_score: 88,
            risk_level: 'LOW',
            energy_level: 'HIGH',
            focus_score: 9.2,
            task_completion: 95,
            stress_profile: [
                { period: 'Morning', level: 'Low', percentage: 20 },
                { period: 'Afternoon', level: 'Medium', percentage: 40 },
                { period: 'Evening', level: 'Low', percentage: 10 }
            ],
            communication_stats: {
                Slack: { messages: 45, engagement: 'High' },
                Email: { messages: 12, engagement: 'Medium' }
            },
            work_life_balance: {
                work_hours: { value: '40h', percentage: 100 },
                personal_time: { value: 'Good', percentage: 80 }
            },
            team_interactions: {
                meetings: 5,
                collaboration_score: 'Excellent'
            },
            risk_items: [],
            recommendations: [
                { title: 'Keep it up', recommendation: 'Maintain your current schedule.', priority: 'low' }
            ],
            timeline: [
                { date: new Date().toISOString(), event: 'Report Generated', type: 'info' }
            ]
        });

    if (reportError) {
        console.error('Error seeding report:', reportError);
    } else {
        console.log('✅ Digital Twin Report seeded.');
    }
}

seedDigitalTwin();
