// SideBuz.com Affiliate Links Configuration
// 只包含已批准的联盟链接
// 最后更新: 2025-12-25

export const affiliates = {
    // ========================================
    // IMPACT 联盟平台
    // ========================================

    shopify: {
        id: 'shopify',
        name: "Shopify",
        url: "https://shopify.pxf.io/Z62ZXW",
        cta: "Start Free Trial",
        earnings: "$1,000+/month potential",
        description: "Start your own online store",
        category: "business",
        logo: "/images/affiliates/shopify.svg"
    },

    capcut: {
        id: 'capcut',
        name: "CapCut",
        url: "https://capcutaffiliateprogram.pxf.io/gOY3EO",
        cta: "Download Free",
        earnings: "Free tool for video editing",
        description: "Professional video editing for TikTok & YouTube",
        category: "content",
        logo: "/images/affiliates/capcut.svg"
    },

    filmora: {
        id: 'filmora',
        name: "Filmora",
        url: "https://filmora.pxf.io/APrbmD",
        cta: "Try Free",
        earnings: "Video editing side hustle",
        description: "Easy video editing software for beginners",
        category: "content",
        logo: "/images/affiliates/filmora.svg"
    },

    // ========================================
    // CLICKBANK 联盟平台
    // ========================================

    livechatjobs: {
        id: 'livechatjobs',
        name: "Live Chat Jobs",
        url: "https://35cd7cyysbdh389du8v60ixz2a.hop.clickbank.net/?&traffic_source=blog",
        cta: "Get Started",
        earnings: "$25-$35/hour",
        description: "Get paid to work as a live chat assistant from home",
        category: "jobs",
        logo: "/images/affiliates/clickbank.svg"
    },

    writingjobs: {
        id: 'writingjobs',
        name: "Paid Online Writing Jobs",
        url: "https://7dbd0cxbh5sl1ba6qo-ry2v3yq.hop.clickbank.net/?&traffic_source=blog",
        cta: "Start Writing",
        earnings: "$20-$50/article",
        description: "Get paid to write articles and content online",
        category: "jobs",
        logo: "/images/affiliates/clickbank.svg"
    },

    writeappreviews: {
        id: 'writeappreviews',
        name: "Write App Reviews",
        url: "https://c6f537m9tbqhpidht5y8qhxd39.hop.clickbank.net/?&traffic_source=blog",
        cta: "Review Apps",
        earnings: "$25-$50/review",
        description: "Get paid to review apps on your phone",
        category: "jobs",
        logo: "/images/affiliates/clickbank.svg"
    },

    virtualassistant: {
        id: 'virtualassistant',
        name: "Virtual Assistant Jobs",
        url: "https://04b9efu1o1gcvc37v9h9zfhcyq.hop.clickbank.net/?&traffic_source=blog",
        cta: "Apply Now",
        earnings: "$20-$40/hour",
        description: "Work from home as a virtual online assistant",
        category: "jobs",
        logo: "/images/affiliates/clickbank.svg"
    },

    salehoo: {
        id: 'salehoo',
        name: "SaleHoo Dropshipping",
        url: "https://06e09fv0jcpn-c2qb6fgyk1m5s.hop.clickbank.net/?&traffic_source=blog",
        cta: "Start Dropshipping",
        earnings: "$500-$3,000/month",
        description: "Find wholesale suppliers and start dropshipping business",
        category: "business",
        logo: "/images/affiliates/salehoo.svg"
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
