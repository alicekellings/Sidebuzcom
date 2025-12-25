// SideBuz.com Affiliate Links Configuration
// Update these URLs with your actual affiliate links

export const affiliates = {
    // Student Tutoring Platforms
    chegg: {
        id: 'chegg',
        name: "Chegg Tutors",
        url: "https://www.chegg.com/tutors/become-a-tutor/",
        cta: "Start Tutoring",
        earnings: "$20+/hour",
        description: "Help students with homework and earn money",
        category: "tutoring",
        logo: "/images/affiliates/chegg.svg"
    },

    coursehero: {
        id: 'coursehero',
        name: "Course Hero",
        url: "https://www.coursehero.com/tutors/become-a-tutor/",
        cta: "Become a Tutor",
        earnings: "$3+/question",
        description: "Answer questions and upload study materials",
        category: "tutoring",
        logo: "/images/affiliates/coursehero.svg"
    },

    studypool: {
        id: 'studypool',
        name: "Studypool",
        url: "https://www.studypool.com/",
        cta: "Answer Questions",
        earnings: "$5,000+/month potential",
        description: "Micro-tutoring platform for quick earnings",
        category: "tutoring",
        logo: "/images/affiliates/studypool.svg"
    },

    tutorme: {
        id: 'tutorme',
        name: "TutorMe",
        url: "https://tutorme.com/apply/",
        cta: "Apply Now",
        earnings: "$16-20/hour",
        description: "On-demand tutoring for 300+ subjects",
        category: "tutoring",
        logo: "/images/affiliates/tutorme.svg"
    },

    // Freelance Platforms
    fiverr: {
        id: 'fiverr',
        name: "Fiverr",
        url: "https://www.fiverr.com/",
        cta: "Create Your Gig",
        earnings: "$5-500+/gig",
        description: "Offer any skill as a service",
        category: "freelance",
        logo: "/images/affiliates/fiverr.svg"
    },

    upwork: {
        id: 'upwork',
        name: "Upwork",
        url: "https://www.upwork.com/",
        cta: "Find Freelance Work",
        earnings: "$15-150+/hour",
        description: "World's largest freelance marketplace",
        category: "freelance",
        logo: "/images/affiliates/upwork.svg"
    },

    // Learning Platforms
    udemy: {
        id: 'udemy',
        name: "Udemy",
        url: "https://www.udemy.com/",
        cta: "Start Learning",
        earnings: null,
        description: "Learn new skills to increase your earning potential",
        category: "learning",
        logo: "/images/affiliates/udemy.svg"
    },

    skillshare: {
        id: 'skillshare',
        name: "Skillshare",
        url: "https://www.skillshare.com/",
        cta: "Get Free Trial",
        earnings: null,
        description: "Learn creative and business skills",
        category: "learning",
        logo: "/images/affiliates/skillshare.svg"
    },

    // Business/Entrepreneurship
    shopify: {
        id: 'shopify',
        name: "Shopify",
        url: "https://www.shopify.com/",
        cta: "Start Free Trial",
        earnings: "$1,000+/month potential",
        description: "Start your own online store",
        category: "business",
        logo: "/images/affiliates/shopify.svg"
    },

    teachable: {
        id: 'teachable',
        name: "Teachable",
        url: "https://teachable.com/",
        cta: "Create Your Course",
        earnings: "$500-5,000+/month",
        description: "Create and sell online courses",
        category: "business",
        logo: "/images/affiliates/teachable.svg"
    },

    bluehost: {
        id: 'bluehost',
        name: "Bluehost",
        url: "https://www.bluehost.com/",
        cta: "Get Started",
        earnings: null,
        description: "Start a blog or website",
        category: "business",
        logo: "/images/affiliates/bluehost.svg"
    }
};

// Get affiliate by ID
export function getAffiliate(id) {
    return affiliates[id] || null;
}

// Get affiliates by category
export function getAffiliatesByCategory(category) {
    return Object.values(affiliates).filter(a => a.category === category);
}

// Get all affiliate IDs
export function getAllAffiliateIds() {
    return Object.keys(affiliates);
}

// Track click (for analytics)
export function trackAffiliateClick(affiliateId) {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'affiliate_click', {
            'affiliate_id': affiliateId,
            'affiliate_name': affiliates[affiliateId]?.name,
            'page_path': window.location.pathname
        });
    }
}
