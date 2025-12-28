// Astro API endpoint for Self-Employed Business Generator (local development)
export const prerender = false;

export async function POST({ request }) {
    console.log('=== API /api/generate-business called ===');

    try {
        const body = await request.json();
        const { budget, skills, timeCommitment, goals } = body;
        console.log('Received:', { budget, skills: skills?.length, timeCommitment, goals });

        if (!budget || !skills) {
            return new Response(JSON.stringify({
                error: 'Invalid input',
                message: 'Please provide budget and skills',
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const apiKey = import.meta.env.GROQ_API_KEY;
        console.log('API Key exists:', !!apiKey);

        if (!apiKey || apiKey === 'gsk_placeholder_replace_with_your_key') {
            console.log('No valid API key, returning fallback');
            return new Response(JSON.stringify({
                success: true,
                businesses: getFallbackBusinesses(budget, skills),
                source: 'fallback',
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        console.log('Calling Groq API...');
        const businesses = await generateBusinesses(budget, skills, timeCommitment, goals, apiKey);

        console.log('✅ Groq API Success!');
        console.log('Generated businesses:', businesses.length);

        return new Response(JSON.stringify({
            success: true,
            businesses,
            source: 'ai',
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({
            success: true,
            businesses: getFallbackBusinesses('$0-$500', []),
            source: 'fallback',
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
}

async function generateBusinesses(budget, skills, timeCommitment, goals, apiKey) {
    const prompt = `Based on this profile:
- Starting Budget: ${budget}
- Skills: ${skills.join(', ')}
- Time Available: ${timeCommitment}
- Goals: ${goals}

Generate exactly 3 unique self-employed business ideas.

Respond in this EXACT JSON format:
[
  {
    "name": "Business Name",
    "emoji": "🏪",
    "category": "E-commerce/Service/Digital/Local",
    "startupCost": "$X-$Y",
    "monthlyEarnings": "$X-$Y potential",
    "timeToProfit": "X-Y months",
    "difficulty": "Easy/Medium/Hard",
    "description": "2-3 sentences about why this fits their profile",
    "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
    "firstWeekPlan": ["Day 1-2 action", "Day 3-4 action", "Day 5-7 action"]
  }
]

Return ONLY the JSON array, no other text`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: 'You are a business advisor specializing in low-cost startups. Always respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.8,
            max_tokens: 800,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API Error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    console.log('Tokens used:', data.usage?.total_tokens || 'N/A');

    if (!content) throw new Error('Empty response');

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Invalid JSON response');

    const businesses = JSON.parse(jsonMatch[0]);

    return businesses.slice(0, 3).map(b => ({
        name: String(b.name || 'Business Idea').substring(0, 60),
        emoji: String(b.emoji || '💼').substring(0, 4),
        category: String(b.category || 'Service').substring(0, 30),
        startupCost: String(b.startupCost || '$0-$500').substring(0, 30),
        monthlyEarnings: String(b.monthlyEarnings || '$500-$2,000').substring(0, 40),
        timeToProfit: String(b.timeToProfit || '1-3 months').substring(0, 30),
        difficulty: ['Easy', 'Medium', 'Hard'].includes(b.difficulty) ? b.difficulty : 'Medium',
        description: String(b.description || '').substring(0, 250),
        requirements: Array.isArray(b.requirements) ? b.requirements.slice(0, 4).map(r => String(r).substring(0, 80)) : [],
        firstWeekPlan: Array.isArray(b.firstWeekPlan) ? b.firstWeekPlan.slice(0, 3).map(p => String(p).substring(0, 100)) : [],
    }));
}

function getFallbackBusinesses(budget, skills) {
    return [
        {
            name: "Freelance Service Business",
            emoji: "💻",
            category: "Service",
            startupCost: "$0-$100",
            monthlyEarnings: "$1,000-$5,000 potential",
            timeToProfit: "1-2 months",
            difficulty: "Easy",
            description: "Start offering your skills as a freelance service. Perfect for beginners with low overhead.",
            requirements: ["A marketable skill", "Laptop and internet", "Portfolio samples"],
            firstWeekPlan: ["Days 1-2: Set up profiles on Upwork/Fiverr", "Days 3-4: Create 3 portfolio pieces", "Days 5-7: Apply to 10+ jobs"]
        },
        {
            name: "Print-on-Demand Store",
            emoji: "👕",
            category: "E-commerce",
            startupCost: "$0-$200",
            monthlyEarnings: "$500-$3,000 potential",
            timeToProfit: "2-4 months",
            difficulty: "Medium",
            description: "Sell custom-designed products without inventory. Great for creative people.",
            requirements: ["Design skills or AI tools", "Printful/Printify account", "Shopify or Etsy store"],
            firstWeekPlan: ["Days 1-2: Research niche", "Days 3-4: Create 10 designs", "Days 5-7: Set up store"]
        },
        {
            name: "Digital Product Business",
            emoji: "📚",
            category: "Digital",
            startupCost: "$0-$500",
            monthlyEarnings: "$1,000-$10,000 potential",
            timeToProfit: "2-6 months",
            difficulty: "Medium",
            description: "Create and sell digital products like courses, templates, or ebooks.",
            requirements: ["Expertise in a topic", "Content creation tools", "Sales platform"],
            firstWeekPlan: ["Days 1-2: Outline product", "Days 3-5: Create MVP", "Days 6-7: Set up sales page"]
        }
    ];
}
