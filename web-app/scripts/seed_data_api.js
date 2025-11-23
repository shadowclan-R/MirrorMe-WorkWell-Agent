const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load env vars
const envPath = path.resolve(__dirname, '../../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedData() {
    console.log('🌱 Starting Data Seeding via API...');

    // 1. Clear existing data (Order matters due to FKs)
    console.log('🧹 Cleaning up old data...');
    await supabase.from('analysis_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('daily_checkins').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('chat_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('digital_twin_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('digital_twin_states').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('hr_managers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Insert HR Manager (Ruqayya)
    console.log('👤 Creating HR Manager: Ruqayya...');
    const { data: hrData, error: hrError } = await supabase.from('hr_managers').insert({
        full_name: 'Ruqayya Alyamani',
        email: 'ruqayya.alyamani@company.com',
        role_title: 'HR Director',
        permissions: ['view_all', 'manage_users', 'generate_reports', 'receive_alerts']
    }).select().single();

    if (hrError) { console.error('❌ Error creating HR:', hrError); return; }
    const hrId = hrData.id;

    // 3. Insert Employee (Ryan)
    console.log('👨‍💻 Creating Employee: Ryan...');
    const { data: empData, error: empError } = await supabase.from('employees').insert({
        full_name: 'Ryan Alfaid',
        email: 'ryan.alfaid@company.com',
        department: 'Engineering',
        job_title: 'Senior Backend Developer',
        bio: 'Passionate about scalable systems and AI. Often works late nights.',
        skills: ['Node.js', 'PostgreSQL', 'System Design', 'React'],
        status: 'ACTIVE',
        avatar_url: 'https://img.freepik.com/free-photo/portrait-man-laughing_23-2148859448.jpg'
    }).select().single();

    if (empError) { console.error('❌ Error creating Employee:', empError); return; }
    const empId = empData.id;

    // 4. Insert Daily Check-ins (Last 5 days)
    console.log('📅 Creating Check-ins...');
    const checkins = [
        {
            employee_id: empId,
            mood_score: 4,
            note_text: 'Feeling good today, finished the sprint early.',
            created_at: new Date(Date.now() - 4 * 86400000).toISOString()
        },
        {
            employee_id: empId,
            mood_score: 2,
            note_text: 'Struggling with the new API integration. Documentation is missing.',
            created_at: new Date(Date.now() - 3 * 86400000).toISOString()
        },
        {
            employee_id: empId,
            mood_score: 3,
            note_text: 'Okay day. Many meetings, couldn\'t focus on code.',
            created_at: new Date(Date.now() - 2 * 86400000).toISOString()
        },
        {
            employee_id: empId,
            mood_score: 1,
            note_text: 'Very stressed. Deadline is tomorrow and we have a critical bug.',
            created_at: new Date(Date.now() - 1 * 86400000).toISOString()
        },
        {
            employee_id: empId,
            mood_score: 3,
            note_text: 'Recovering from yesterday. Tired but hopeful.',
            created_at: new Date().toISOString()
        }
    ];

    const { data: checkinData, error: checkinError } = await supabase.from('daily_checkins').insert(checkins).select();
    if (checkinError) console.error('❌ Error creating Check-ins:', checkinError);

    // 5. Insert Analysis Logs (Linked to Check-ins)
    if (checkinData) {
        console.log('🧠 Creating Analysis Logs...');
        const analyses = checkinData.map((ci) => ({
            checkin_id: ci.id,
            sentiment: ci.mood_score > 3 ? 'POSITIVE' : (ci.mood_score < 3 ? 'NEGATIVE' : 'NEUTRAL'),
            sentiment_score: ci.mood_score * 0.2,
            risk_level: ci.mood_score < 3 ? 'HIGH' : (ci.mood_score === 3 ? 'MEDIUM' : 'LOW'),
            recommendation: ci.mood_score < 3 ? 'Take a break and talk to your manager.' : 'Keep up the good work!',
            model_source: 'HuggingFace-DistilBERT'
        }));
        await supabase.from('analysis_logs').insert(analyses);
    }

    // 6. Insert Chat Logs (Conversations)
    console.log('💬 Creating Chat Logs...');
    const chats = [
        {
            employee_id: empId,
            role: 'user',
            content: 'I feel overwhelmed with the current workload.',
            timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
            employee_id: empId,
            role: 'assistant',
            content: 'I understand. Have you tried breaking down your tasks into smaller chunks? Also, remember to take short breaks.',
            timestamp: new Date(Date.now() - 3600000 * 4.9).toISOString()
        },
        {
            employee_id: empId,
            role: 'user',
            content: 'Yes, but the deadlines are too tight.',
            timestamp: new Date(Date.now() - 3600000 * 4.8).toISOString()
        },
        {
            employee_id: empId,
            role: 'assistant',
            content: 'It might be helpful to discuss prioritization with your lead. Would you like me to draft a message for them?',
            timestamp: new Date(Date.now() - 3600000 * 4.7).toISOString()
        },
        {
            employee_id: empId,
            role: 'user',
            content: 'No thanks, I will handle it.',
            timestamp: new Date(Date.now() - 3600000 * 4.6).toISOString()
        }
    ];
    await supabase.from('chat_logs').insert(chats);

    // 7. Insert Activity Logs
    console.log('📊 Creating Activity Logs...');
    const activities = [
        {
            employee_id: empId,
            activity_type: 'CODE_COMMIT',
            description: 'Pushed changes to feature/auth-flow',
            duration_minutes: 45,
            timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
            employee_id: empId,
            activity_type: 'TEAMS_MEETING',
            description: 'Daily Standup',
            duration_minutes: 30,
            timestamp: new Date(Date.now() - 18000000).toISOString()
        },
        {
            employee_id: empId,
            activity_type: 'SLACK_ACTIVITY',
            description: 'Active in #dev-ops channel',
            duration_minutes: 45,
            timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
            employee_id: empId,
            activity_type: 'CRM_UPDATE',
            description: 'Updated client integration status',
            duration_minutes: 15,
            timestamp: new Date(Date.now() - 5400000).toISOString()
        },
        {
            employee_id: empId,
            activity_type: 'EMAIL_SENT',
            description: 'Weekly Report to Management',
            duration_minutes: 10,
            timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
            employee_id: empId,
            activity_type: 'JIRA_UPDATE',
            description: 'Moved ticket #420 to In Progress',
            duration_minutes: 5,
            timestamp: new Date(Date.now() - 3600000).toISOString()
        }
    ];
    await supabase.from('activity_logs').insert(activities);

    // 8. Set Digital Twin State
    console.log('🤖 Setting Digital Twin State...');
    await supabase.from('digital_twin_states').insert({
        employee_id: empId,
        current_state: 'UNDER_PRESSURE',
        summary_text: 'Ryan has shown signs of high stress over the last 3 days due to tight deadlines.',
        metrics: { physical: 65, emotional: 45, productivity: 92 },
        last_updated: new Date().toISOString()
    });

    console.log('📘 Creating Digital Twin Report snapshot...');
    await supabase.from('digital_twin_reports').insert({
        employee_id: empId,
        health_score: 68,
        risk_level: 'HIGH',
        energy_level: 'Stable mornings, dips afternoon',
        focus_score: 8.4,
        task_completion: 92,
        stress_profile: [
            { period: 'Morning', level: 'Low', percentage: 20 },
            { period: 'Midday', level: 'Moderate', percentage: 45 },
            { period: 'Afternoon', level: 'High', percentage: 70 },
            { period: 'Evening', level: 'Low', percentage: 25 },
        ],
        communication_stats: {
            Slack: { messages: 127, engagement: 'High' },
            Teams: { messages: 84, engagement: 'Medium' },
            Email: { messages: 45, engagement: 'Low' },
        },
        work_life_balance: {
            work_hours: { value: '42h', percentage: 70 },
            personal_time: { value: '18h', percentage: 30 },
            sleep_quality: { value: '7.5h avg', percentage: 85 },
        },
        team_interactions: {
            meetings: 12,
            collaboration_score: 'Excellent',
            response_time: '< 15 min',
        },
        risk_items: [
            { label: 'Burnout Risk', level: 'Low', color: 'green' },
            { label: 'Anxiety Indicators', level: 'Low', color: 'green' },
            { label: 'Social Isolation', level: 'Very Low', color: 'green' },
            { label: 'Work Overload', level: 'Moderate', color: 'yellow' },
        ],
        recommendations: [
            { title: 'Focus Time', recommendation: 'Block 9-11 AM for deep work when focus is highest', priority: 'high' },
            { title: 'Stress Management', recommendation: 'Take 5-minute mindfulness breaks every 2 hours', priority: 'medium' },
            { title: 'Team Connection', recommendation: 'Schedule 1-on-1 coffee chats weekly', priority: 'low' },
            { title: 'Work-Life Balance', recommendation: 'Set a hard stop at 5 PM to ensure personal time', priority: 'high' },
        ],
        timeline: [
            { date: 'Nov 20', event: 'Achieved 5-day streak of positive check-ins', type: 'success' },
            { date: 'Nov 15', event: 'Completed stress management workshop', type: 'milestone' },
            { date: 'Nov 10', event: 'High stress alert resolved', type: 'warning' },
            { date: 'Nov 5', event: 'Started new team collaboration project', type: 'info' },
            { date: 'Oct 28', event: 'Improved sleep schedule by 15%', type: 'success' },
        ],
        created_at: new Date().toISOString(),
    });

    console.log('✅ Data Seeding Complete!');
    console.log(`   Employee ID: ${empId}`);
    console.log(`   HR ID: ${hrId}`);
}

seedData().catch(err => console.error('Fatal Error:', err));
