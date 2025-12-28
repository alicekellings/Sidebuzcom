// Astro API endpoint for AI Hustle Generator (local development)
export const prerender = false;

export async function POST({ request }) {
    console.log('=== API /api/generate-hustles called ===');

    try {
        const body = await request.json();
        const { description } = body;
        console.log('Received description:', description?.substring(0, 50) + '...');

        // Validate input
        if (!description || typeof description !== 'string') {
            return new Response(JSON.stringify({
                error: 'Invalid input',
                message: 'Please provide a description',
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const sanitizedDescription = description.replace(/<[^>]*>/g, '').trim().substring(0, 500);

        if (sanitizedDescription.length < 10) {
            return new Response(JSON.stringify({
                error: 'Invalid input',
                message: 'Description too short',
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const apiKey = import.meta.env.GROQ_API_KEY;
        console.log('API Key exists:', !!apiKey);

        if (!apiKey || apiKey === 'gsk_placeholder_replace_with_your_key') {
            console.log('No valid API key, returning fallback');
            return new Response(JSON.stringify({
                success: true,
                hustles: getFallbackHustles(),
                source: 'fallback',
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        console.log('Calling Groq API...');
        const hustles = await generateHustles(sanitizedDescription, apiKey);

        console.log('✅ Groq API Success!');
        console.log('Generated hustles:', hustles.length);

        return new Response(JSON.stringify({
            success: true,
            hustles,
            source: 'ai',
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({
            success: true,
            hustles: getFallbackHustles(),
            source: 'fallback',
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
}

async function generateHustles(description, apiKey) {
    const prompt = `Based on this student's description:
"${description}"

Generate exactly 3 unique side hustle ideas tailored to them.

For each idea, respond in this EXACT JSON format:
[
  {
    "name": "Side Hustle Name",
    "emoji": "💼",
    "earnings": "$X-$Y/month",
    "timeNeeded": "X-Y hours/week",
    "difficulty": "Easy/Medium/Hard",
    "description": "One sentence explaining why this fits them",
    "firstStep": "One actionable first step to start today"
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
                { role: 'system', content: 'You are a creative side hustle advisor. Always respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.8,
            max_tokens: 600,
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

    const hustles = JSON.parse(jsonMatch[0]);

    return hustles.slice(0, 3).map(h => ({
        name: String(h.name || 'Side Hustle').substring(0, 50),
        emoji: String(h.emoji || '💼').substring(0, 4),
        earnings: String(h.earnings || '$100-$500/month').substring(0, 30),
        timeNeeded: String(h.timeNeeded || '5-10 hours/week').substring(0, 30),
        difficulty: ['Easy', 'Medium', 'Hard'].includes(h.difficulty) ? h.difficulty : 'Medium',
        description: String(h.description || '').substring(0, 150),
        firstStep: String(h.firstStep || '').substring(0, 150),
    }));
}

function getFallbackHustles() {
    return [
        {
            name: "Freelance Content Writing",
            emoji: "✍️",
            earnings: "$200-$800/month",
            timeNeeded: "5-10 hours/week",
            difficulty: "Easy",
            description: "Turn your ideas into paid articles for blogs and websites.",
            firstStep: "Create a profile on Medium and publish your first article today."
        },
        {
            name: "Online Tutoring",
            emoji: "📚",
            earnings: "$300-$1,000/month",
            timeNeeded: "5-15 hours/week",
            difficulty: "Medium",
            description: "Help other students learn subjects you're good at.",
            firstStep: "Sign up on Wyzant or Tutor.com and set your availability."
        },
        {
            name: "Social Media Management",
            emoji: "📱",
            earnings: "$400-$1,200/month",
            timeNeeded: "10-20 hours/week",
            difficulty: "Medium",
            description: "Help small businesses grow their online presence.",
            firstStep: "Create a portfolio with 3 sample posts and reach out to local businesses."
        }
    ];
}
