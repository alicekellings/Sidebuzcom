// Student Income Recommendations Data
// Matching algorithm uses tags to find best fit

export const incomeOptions = [
    {
        id: 'online-tutoring',
        name: 'Online Tutoring',
        description: 'Help students with homework and exam prep on tutoring platforms.',
        earnings: {
            min: 15,
            max: 40,
            unit: 'hour'
        },
        monthlyPotential: '$400-$1,200',
        timeCommitment: '5-15 hours/week',
        difficulty: 'Easy',
        tags: ['stem', 'humanities', 'business', 'teaching', 'graduate', 'senior'],
        platforms: [],
        primaryAffiliate: null,
        pros: [
            'Flexible schedule',
            'Good hourly rate',
            'Improves your own knowledge'
        ],
        cons: [
            'Requires subject expertise',
            'Income varies by demand'
        ]
    },
    {
        id: 'homework-help',
        name: 'Homework Help & Q&A',
        description: 'Answer student questions and provide step-by-step solutions.',
        earnings: {
            min: 3,
            max: 20,
            unit: 'question'
        },
        monthlyPotential: '$200-$800',
        timeCommitment: '5-10 hours/week',
        difficulty: 'Easy',
        tags: ['stem', 'business', 'writing', 'freshman', 'sophomore'],
        platforms: [],
        primaryAffiliate: null,
        pros: [
            'Quick tasks',
            'Work anytime',
            'No scheduling needed'
        ],
        cons: [
            'Lower per-task pay',
            'Volume-dependent'
        ]
    },
    {
        id: 'freelance-writing',
        name: 'Freelance Writing',
        description: 'Write articles, blog posts, and content for clients.',
        earnings: {
            min: 15,
            max: 100,
            unit: 'article'
        },
        monthlyPotential: '$300-$1,500',
        timeCommitment: '8-20 hours/week',
        difficulty: 'Medium',
        tags: ['writing', 'humanities', 'arts', 'creative'],
        platforms: ['writingjobs'],
        primaryAffiliate: 'writingjobs',
        pros: [
            'Build a portfolio',
            'Scale your rates',
            'Remote work'
        ],
        cons: [
            'Takes time to build clients',
            'Competitive market'
        ]
    },
    {
        id: 'graphic-design',
        name: 'Graphic Design',
        description: 'Create logos, social media graphics, and marketing materials.',
        earnings: {
            min: 25,
            max: 150,
            unit: 'project'
        },
        monthlyPotential: '$400-$2,000',
        timeCommitment: '10-20 hours/week',
        difficulty: 'Medium',
        tags: ['design', 'arts', 'creative', 'visual'],
        platforms: [],
        primaryAffiliate: null,
        pros: [
            'Creative work',
            'High demand',
            'Can charge premium rates'
        ],
        cons: [
            'Requires design skills',
            'Need software tools'
        ]
    },
    {
        id: 'web-development',
        name: 'Web Development',
        description: 'Build websites and web applications for clients.',
        earnings: {
            min: 30,
            max: 150,
            unit: 'hour'
        },
        monthlyPotential: '$800-$3,000+',
        timeCommitment: '10-25 hours/week',
        difficulty: 'Hard',
        tags: ['coding', 'tech', 'stem', 'programming'],
        platforms: [],
        primaryAffiliate: null,
        pros: [
            'Highest earning potential',
            'Always in demand',
            'Build real projects'
        ],
        cons: [
            'Requires strong coding skills',
            'Project deadlines'
        ]
    },
    {
        id: 'virtual-assistant',
        name: 'Virtual Assistant',
        description: 'Provide administrative support to businesses remotely.',
        earnings: {
            min: 12,
            max: 30,
            unit: 'hour'
        },
        monthlyPotential: '$300-$1,000',
        timeCommitment: '10-20 hours/week',
        difficulty: 'Easy',
        tags: ['business', 'admin', 'no-skills', 'organized'],
        platforms: ['virtualassistant'],
        primaryAffiliate: 'virtualassistant',
        pros: [
            'No special skills needed',
            'Flexible hours',
            'Learn business skills'
        ],
        cons: [
            'Lower hourly rate',
            'Can be repetitive'
        ]
    },
    {
        id: 'social-media',
        name: 'Social Media Management',
        description: 'Manage social media accounts for businesses and creators.',
        earnings: {
            min: 15,
            max: 50,
            unit: 'hour'
        },
        monthlyPotential: '$400-$1,500',
        timeCommitment: '8-15 hours/week',
        difficulty: 'Medium',
        tags: ['creative', 'marketing', 'business', 'social'],
        platforms: [],
        primaryAffiliate: null,
        pros: [
            'Fun creative work',
            'Retainer potential',
            'Build connections'
        ],
        cons: [
            'Need social media knowledge',
            'Constant content creation'
        ]
    },
    {
        id: 'data-entry',
        name: 'Data Entry',
        description: 'Enter and organize data for businesses.',
        earnings: {
            min: 10,
            max: 20,
            unit: 'hour'
        },
        monthlyPotential: '$200-$600',
        timeCommitment: '5-15 hours/week',
        difficulty: 'Easy',
        tags: ['no-skills', 'admin', 'detail-oriented'],
        platforms: [],
        primaryAffiliate: null,
        pros: [
            'No experience needed',
            'Straightforward work',
            'Flexible timing'
        ],
        cons: [
            'Lower pay',
            'Can be monotonous'
        ]
    },
    {
        id: 'note-selling',
        name: 'Sell Study Notes',
        description: 'Upload and sell your class notes to other students.',
        earnings: {
            min: 5,
            max: 50,
            unit: 'document'
        },
        monthlyPotential: '$100-$500',
        timeCommitment: '2-5 hours/week',
        difficulty: 'Easy',
        tags: ['studying', 'organized', 'freshman', 'sophomore', 'stem', 'humanities'],
        platforms: [],
        primaryAffiliate: null,
        pros: [
            'Passive income potential',
            'Monetize existing work',
            'Low time commitment'
        ],
        cons: [
            'Smaller earnings',
            'Depends on note quality'
        ]
    },
    {
        id: 'translation',
        name: 'Translation Services',
        description: 'Translate documents and content between languages.',
        earnings: {
            min: 0.05,
            max: 0.25,
            unit: 'word'
        },
        monthlyPotential: '$300-$1,200',
        timeCommitment: '8-20 hours/week',
        difficulty: 'Medium',
        tags: ['language', 'bilingual', 'humanities', 'international'],
        platforms: [],
        primaryAffiliate: null,
        pros: [
            'Leverage language skills',
            'Remote work',
            'Specialized skill premium'
        ],
        cons: [
            'Need fluency in 2+ languages',
            'Deadlines can be tight'
        ]
    },
    {
        id: 'video-editing',
        name: 'Video Editing',
        description: 'Edit videos for YouTubers, TikTokers, and businesses.',
        earnings: {
            min: 25,
            max: 150,
            unit: 'video'
        },
        monthlyPotential: '$500-$2,500',
        timeCommitment: '10-20 hours/week',
        difficulty: 'Medium',
        tags: ['creative', 'arts', 'video', 'tech', 'design'],
        platforms: [],
        primaryAffiliate: null,
        tools: ['capcut', 'filmora'],
        pros: [
            'High demand from creators',
            'Creative work',
            'Can charge premium rates'
        ],
        cons: [
            'Requires editing software',
            'Learning curve for beginners'
        ]
    },
    {
        id: 'content-creator',
        name: 'Content Creator (YouTube/TikTok)',
        description: 'Create your own video content and earn from ads and sponsorships.',
        earnings: {
            min: 0,
            max: 100,
            unit: 'variable'
        },
        monthlyPotential: '$100-$5,000+',
        timeCommitment: '10-25 hours/week',
        difficulty: 'Hard',
        tags: ['creative', 'arts', 'social', 'video', 'influencer'],
        platforms: [],
        primaryAffiliate: null,
        tools: ['capcut', 'filmora'],
        pros: [
            'Build personal brand',
            'Passive income potential',
            'Fun creative work'
        ],
        cons: [
            'Takes time to grow',
            'Inconsistent income initially'
        ]
    },
    {
        id: 'ecommerce',
        name: 'E-commerce Store',
        description: 'Start your own online store selling products.',
        earnings: {
            min: 100,
            max: 3000,
            unit: 'month'
        },
        monthlyPotential: '$500-$5,000+',
        timeCommitment: '15-30 hours/week',
        difficulty: 'Hard',
        tags: ['business', 'entrepreneur', 'marketing', 'ambitious'],
        platforms: ['shopify'],
        primaryAffiliate: 'shopify',
        pros: [
            'High income potential',
            'Build real business',
            'Scalable'
        ],
        cons: [
            'Requires capital',
            'Steep learning curve'
        ]
    },
    {
        id: 'live-chat-jobs',
        name: 'Live Chat Support',
        description: 'Work from home as a live chat assistant helping customers.',
        earnings: {
            min: 25,
            max: 35,
            unit: 'hour'
        },
        monthlyPotential: '$500-$2,000',
        timeCommitment: '10-25 hours/week',
        difficulty: 'Easy',
        tags: ['no-skills', 'customer-service', 'typing', 'flexible'],
        platforms: ['livechatjobs'],
        primaryAffiliate: 'livechatjobs',
        pros: [
            'No experience needed',
            'Work from anywhere',
            'Flexible schedule'
        ],
        cons: [
            'Can be repetitive',
            'Need good typing speed'
        ]
    },
    {
        id: 'app-reviews',
        name: 'App Review Jobs',
        description: 'Get paid to test and review mobile apps on your phone.',
        earnings: {
            min: 25,
            max: 50,
            unit: 'review'
        },
        monthlyPotential: '$200-$800',
        timeCommitment: '5-10 hours/week',
        difficulty: 'Easy',
        tags: ['no-skills', 'mobile', 'easy', 'flexible', 'freshman', 'sophomore'],
        platforms: ['writeappreviews'],
        primaryAffiliate: 'writeappreviews',
        pros: [
            'Fun and easy',
            'Use your phone',
            'No experience needed'
        ],
        cons: [
            'Limited availability',
            'Lower income ceiling'
        ]
    },
    {
        id: 'dropshipping',
        name: 'Dropshipping Business',
        description: 'Start an online store without holding inventory.',
        earnings: {
            min: 500,
            max: 3000,
            unit: 'month'
        },
        monthlyPotential: '$500-$5,000+',
        timeCommitment: '15-30 hours/week',
        difficulty: 'Hard',
        tags: ['business', 'entrepreneur', 'ecommerce', 'ambitious'],
        platforms: ['salehoo', 'shopify'],
        primaryAffiliate: 'salehoo',
        pros: [
            'No inventory needed',
            'Low startup cost',
            'Scalable business'
        ],
        cons: [
            'Competitive market',
            'Requires marketing skills'
        ]
    }
];

// Question definitions for the quiz
export const quizQuestions = [
    {
        id: 'major',
        question: "What's your field of study?",
        type: 'single',
        options: [
            { value: 'stem', label: 'STEM (Science, Tech, Engineering, Math)', icon: '🔬' },
            { value: 'business', label: 'Business / Economics', icon: '📊' },
            { value: 'humanities', label: 'Humanities / Social Sciences', icon: '📚' },
            { value: 'arts', label: 'Arts / Design', icon: '🎨' },
            { value: 'other', label: 'Other / Undeclared', icon: '❓' }
        ]
    },
    {
        id: 'year',
        question: 'What year are you in?',
        type: 'single',
        options: [
            { value: 'freshman', label: 'Freshman / First Year', icon: '1️⃣' },
            { value: 'sophomore', label: 'Sophomore / Second Year', icon: '2️⃣' },
            { value: 'senior', label: 'Junior / Senior', icon: '3️⃣' },
            { value: 'graduate', label: 'Graduate Student', icon: '🎓' }
        ]
    },
    {
        id: 'hours',
        question: 'How many hours per week can you dedicate?',
        type: 'single',
        options: [
            { value: '5', label: 'Less than 5 hours', icon: '⏰' },
            { value: '10', label: '5-10 hours', icon: '⏰' },
            { value: '20', label: '10-20 hours', icon: '⏰' },
            { value: '20+', label: '20+ hours', icon: '⏰' }
        ]
    },
    {
        id: 'skills',
        question: 'What skills do you have? (Select all that apply)',
        type: 'multiple',
        options: [
            { value: 'writing', label: 'Writing / Content Creation', icon: '✍️' },
            { value: 'coding', label: 'Programming / Coding', icon: '💻' },
            { value: 'design', label: 'Graphic Design', icon: '🎨' },
            { value: 'language', label: 'Bilingual / Languages', icon: '🌍' },
            { value: 'teaching', label: 'Teaching / Tutoring', icon: '📖' },
            { value: 'no-skills', label: 'No special skills yet', icon: '🌱' }
        ]
    },
    {
        id: 'goal',
        question: 'How much do you want to earn monthly?',
        type: 'single',
        options: [
            { value: 'low', label: '$100-$300 (Pocket money)', icon: '💵' },
            { value: 'medium', label: '$300-$800 (Part-time income)', icon: '💰' },
            { value: 'high', label: '$800+ (Significant income)', icon: '🤑' }
        ]
    }
];

/**
 * Match income options based on user answers
 * @param {Object} answers - User's quiz answers
 * @returns {Array} - Sorted array of matching income options
 */
export function matchRecommendations(answers) {
    const { major, year, hours, skills, goal } = answers;

    // Build user tags from answers
    const userTags = new Set();

    // Add major tag
    if (major) userTags.add(major);

    // Add year tag
    if (year) userTags.add(year);

    // Add skill tags
    if (skills && Array.isArray(skills)) {
        skills.forEach(s => userTags.add(s));
    }

    // Score each option
    const scored = incomeOptions.map(option => {
        let score = 0;

        // Tag matching
        option.tags.forEach(tag => {
            if (userTags.has(tag)) score += 10;
        });

        // Hours compatibility
        const userHours = hours === '5' ? 5 : hours === '10' ? 10 : hours === '20' ? 20 : 25;
        const requiredHours = option.timeCommitment.includes('5-10') ? 7 :
            option.timeCommitment.includes('10-20') ? 15 :
                option.timeCommitment.includes('5-15') ? 10 : 15;

        if (userHours >= requiredHours) {
            score += 15;
        } else if (userHours >= requiredHours * 0.7) {
            score += 8;
        }

        // Goal matching
        if (goal === 'high' && option.difficulty === 'Hard') score += 10;
        if (goal === 'low' && option.difficulty === 'Easy') score += 10;
        if (goal === 'medium') score += 5;

        // Difficulty bonus for beginners
        if ((year === 'freshman' || year === 'sophomore') && option.difficulty === 'Easy') {
            score += 8;
        }

        return { ...option, score };
    });

    // Sort by score and return top matches
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
}

/**
 * Calculate estimated monthly income
 * @param {Object} option - Income option
 * @param {number} hours - Weekly hours available
 * @returns {Object} - Income range estimate
 */
export function calculateIncome(option, hours) {
    const weeklyHours = Math.min(hours, 20);
    const monthlyHours = weeklyHours * 4;

    let minMonthly, maxMonthly;

    if (option.earnings.unit === 'hour') {
        minMonthly = option.earnings.min * monthlyHours;
        maxMonthly = option.earnings.max * monthlyHours;
    } else if (option.earnings.unit === 'question' || option.earnings.unit === 'article') {
        // Estimate tasks per hour
        const tasksPerHour = 2;
        minMonthly = option.earnings.min * tasksPerHour * monthlyHours;
        maxMonthly = option.earnings.max * tasksPerHour * monthlyHours;
    } else {
        // Default to option's stated potential
        const range = option.monthlyPotential.match(/\$?([\d,]+)-?\$?([\d,]+)?/);
        minMonthly = range ? parseInt(range[1].replace(',', '')) : 200;
        maxMonthly = range && range[2] ? parseInt(range[2].replace(',', '')) : minMonthly * 2;
    }

    return {
        min: Math.round(minMonthly),
        max: Math.round(maxMonthly),
        formatted: `$${Math.round(minMonthly).toLocaleString()}-$${Math.round(maxMonthly).toLocaleString()}`
    };
}
