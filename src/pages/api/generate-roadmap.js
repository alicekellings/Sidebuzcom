// Astro API endpoint for AI Skills Roadmap Generator (local development)
export const prerender = false;

export async function POST({ request }) {
    console.log('=== API /api/generate-roadmap called ===');

    try {
        const body = await request.json();
        const { hustleName, userProfile } = body;
        console.log('Hustle name:', hustleName);

        if (!hustleName || typeof hustleName !== 'string') {
            return new Response(JSON.stringify({
                error: 'Invalid input',
                message: 'Please provide a hustle name',
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const sanitizedHustle = hustleName.trim().substring(0, 100);

        const apiKey = import.meta.env.GROQ_API_KEY;
        console.log('API Key exists:', !!apiKey);

        if (!apiKey || apiKey === 'gsk_placeholder_replace_with_your_key') {
            console.log('No valid API key, returning fallback');
            return new Response(JSON.stringify({
                success: true,
                roadmap: getFallbackRoadmap(sanitizedHustle),
                source: 'fallback',
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        console.log('Calling Groq API...');
        const roadmap = await generateRoadmap(sanitizedHustle, userProfile, apiKey);

        console.log('✅ Groq API Success!');

        return new Response(JSON.stringify({
            success: true,
            roadmap,
            source: 'ai',
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({
            success: true,
            roadmap: getFallbackRoadmap('Side Hustle'),
            source: 'fallback',
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
}

async function generateRoadmap(hustleName, userProfile, apiKey) {
    const profileInfo = userProfile ? `
Student Profile:
- Major: ${userProfile.major || 'Not specified'}
- Available hours: ${userProfile.hours || 'Flexible'}
- Skills: ${userProfile.skills?.join(', ') || 'Various'}
` : '';

    const prompt = `Create a practical 4-week learning roadmap for "${hustleName}" side hustle.

${profileInfo}

Respond in this EXACT JSON format:
{
  "title": "Your 4-Week ${hustleName} Roadmap",
  "overview": "One sentence about what they'll achieve",
  "weeks": [
    {
      "week": 1,
      "title": "Week title",
      "goal": "Main goal for this week",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "resource": {
        "name": "Resource name",
        "type": "Free/Paid",
        "description": "Brief description"
      }
    }
  ],
  "milestones": {
    "week1": "First milestone",
    "week2": "Second milestone",
    "week4": "Final milestone"
  }
}

Return ONLY valid JSON, no other text`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: 'You are a career coach. Always respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
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

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response');

    const roadmap = JSON.parse(jsonMatch[0]);

    return {
        title: String(roadmap.title || `Your ${hustleName} Roadmap`).substring(0, 100),
        overview: String(roadmap.overview || '').substring(0, 200),
        weeks: Array.isArray(roadmap.weeks) ? roadmap.weeks.slice(0, 4).map((w, i) => ({
            week: i + 1,
            title: String(w.title || `Week ${i + 1}`).substring(0, 50),
            goal: String(w.goal || '').substring(0, 100),
            tasks: Array.isArray(w.tasks) ? w.tasks.slice(0, 4).map(t => String(t).substring(0, 100)) : [],
            resource: w.resource ? {
                name: String(w.resource.name || '').substring(0, 50),
                type: w.resource.type === 'Paid' ? 'Paid' : 'Free',
                description: String(w.resource.description || '').substring(0, 100),
            } : null
        })) : getFallbackRoadmap(hustleName).weeks,
        milestones: roadmap.milestones || {}
    };
}

function getFallbackRoadmap(hustleName) {
    return {
        title: `Your 4-Week ${hustleName} Roadmap`,
        overview: `A practical guide to start earning with ${hustleName} in just 4 weeks.`,
        weeks: [
            {
                week: 1,
                title: "Foundation & Setup",
                goal: "Set up your profile and understand the basics",
                tasks: [
                    "Research the platform and requirements",
                    "Create your account and complete your profile",
                    "Study top performers in this area",
                    "Set up your workspace and tools"
                ],
                resource: {
                    name: "YouTube Tutorial Series",
                    type: "Free",
                    description: "Search for beginner guides on YouTube"
                }
            },
            {
                week: 2,
                title: "Skill Building",
                goal: "Develop core skills needed for success",
                tasks: [
                    "Complete a beginner course or tutorial",
                    "Practice with sample projects",
                    "Get feedback on your work",
                    "Create 2-3 portfolio samples"
                ],
                resource: {
                    name: "Free online courses",
                    type: "Free",
                    description: "Check Coursera or Skillshare free trials"
                }
            },
            {
                week: 3,
                title: "First Clients",
                goal: "Land your first paying opportunity",
                tasks: [
                    "Apply to 5-10 opportunities",
                    "Customize your pitches for each",
                    "Respond quickly to any interest",
                    "Complete your first task/project"
                ],
                resource: {
                    name: "Cold outreach templates",
                    type: "Free",
                    description: "Use proven templates for reaching out"
                }
            },
            {
                week: 4,
                title: "Scale & Optimize",
                goal: "Build momentum and increase earnings",
                tasks: [
                    "Request reviews from satisfied clients",
                    "Raise your rates slightly",
                    "Streamline your workflow",
                    "Set recurring income goals"
                ],
                resource: {
                    name: "Productivity tools",
                    type: "Free",
                    description: "Use Notion or Trello to organize"
                }
            }
        ],
        milestones: {
            week1: "Profile complete and ready to go",
            week2: "Portfolio created with sample work",
            week4: "First payment received! 🎉"
        }
    };
}
