
const QUIZ = window.QUIZ_DATA;
let currentQuestion = 0;
let answers = {};
let recommendations = [];

// DOM Elements
const introScreen = document.getElementById("quiz-intro");
const questionsScreen = document.getElementById("quiz-questions");
const loadingScreen = document.getElementById("quiz-loading");
const resultsScreen = document.getElementById("quiz-results");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const questionContainer =
    document.getElementById("question-container");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const startBtn = document.getElementById("start-quiz");

// Start Quiz
startBtn.addEventListener("click", () => {
    showScreen("questions");
    renderQuestion();
});

// Navigation
prevBtn.addEventListener("click", () => {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
    }
});

nextBtn.addEventListener("click", () => {
    const question = QUIZ.questions[currentQuestion];
    const selected = getSelectedAnswer(question);

    if (
        !selected ||
        (Array.isArray(selected) && selected.length === 0)
    ) {
        alert("Please select an option to continue");
        return;
    }

    answers[question.id] = selected;

    if (currentQuestion < QUIZ.questions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        showResults();
    }
});

// Render Question
function renderQuestion() {
    const question = QUIZ.questions[currentQuestion];
    const total = QUIZ.questions.length;

    // Update progress
    const progress = ((currentQuestion + 1) / total) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Question ${currentQuestion + 1} of ${total}`;

    // Update buttons
    prevBtn.disabled = currentQuestion === 0;
    nextBtn.textContent =
        currentQuestion === total - 1 ? "See Results →" : "Next →";

    // Render question
    const savedAnswer = answers[question.id];

    questionContainer.innerHTML = `
          <div class="question-card">
            <h2 class="question-text">${question.question}</h2>
            <div class="options-grid ${question.type === "multiple" ? "multiple" : ""}">
              ${question.options
            .map(
                (opt) => `
                <label class="option-card ${isSelected(savedAnswer, opt.value) ? "selected" : ""}">
                  <input 
                    type="${question.type === "multiple" ? "checkbox" : "radio"}" 
                    name="q-${question.id}" 
                    value="${opt.value}"
                    ${isSelected(savedAnswer, opt.value) ? "checked" : ""}
                  />
                  <span class="option-icon">${opt.icon}</span>
                  <span class="option-label">${opt.label}</span>
                </label>
              `,
            )
            .join("")}
            </div>
            ${question.type === "multiple" ? '<p class="multi-hint">Select all that apply</p>' : ""}
          </div>
        `;

    // Add event listeners
    questionContainer
        .querySelectorAll(".option-card")
        .forEach((card) => {
            card.addEventListener("click", () => {
                if (question.type === "single") {
                    questionContainer
                        .querySelectorAll(".option-card")
                        .forEach((c) =>
                            c.classList.remove("selected"),
                        );
                }
                card.classList.toggle("selected");
            });
        });
}

function isSelected(saved, value) {
    if (!saved) return false;
    if (Array.isArray(saved)) return saved.includes(value);
    return saved === value;
}

function getSelectedAnswer(question) {
    const inputs = questionContainer.querySelectorAll(
        `input[name="q-${question.id}"]:checked`,
    );
    if (question.type === "multiple") {
        return Array.from(inputs).map((i) => i.value);
    }
    return inputs[0]?.value || null;
}

// Client-side rate limiting
const clientRateLimiter = {
    lastRequest: 0,
    requestCount: 0,
    maxRequests: 3,
    windowMs: 60000, // 1 minute
};

function checkClientRateLimit() {
    const now = Date.now();
    if (
        now - clientRateLimiter.lastRequest >
        clientRateLimiter.windowMs
    ) {
        clientRateLimiter.requestCount = 0;
    }
    if (
        clientRateLimiter.requestCount >=
        clientRateLimiter.maxRequests
    ) {
        return false;
    }
    clientRateLimiter.requestCount++;
    clientRateLimiter.lastRequest = now;
    return true;
}

// Show Results with secure API call
async function showResults() {
    showScreen("loading");

    // Client-side rate limit check
    if (!checkClientRateLimit()) {
        const aiAnalysis =
            "You've made several requests recently. Please wait a minute before trying again. In the meantime, here's our recommendation based on your profile!";
        const recommendations = matchRecommendations(answers);
        renderResults(recommendations, aiAnalysis);
        showScreen("results");
        return;
    }

    // Match recommendations locally first
    recommendations = matchRecommendations(answers);

    let aiAnalysis;

    try {
        // Try to call the API for AI analysis
        const response = await fetch("/api/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                answers: answers,
                recommendations: recommendations.slice(0, 3),
            }),
        });

        if (response.ok) {
            const data = await response.json();
            aiAnalysis = data.analysis;
        } else if (response.status === 429) {
            // Rate limited
            aiAnalysis =
                "Our AI is quite busy right now! Based on your profile, here's what we recommend:";
        } else {
            throw new Error("API error");
        }
    } catch (error) {
        // Fallback to local analysis on any error
        console.log("Using fallback analysis");
        aiAnalysis = generateFallbackAnalysis(
            answers,
            recommendations,
        );
    }

    // Render results
    renderResults(recommendations, aiAnalysis);
    showScreen("results");
}

function matchRecommendations(answers) {
    const { major, year, hours, skills, goal } = answers;
    const userTags = new Set();

    if (major) userTags.add(major);
    if (year) userTags.add(year);
    if (skills) skills.forEach((s) => userTags.add(s));

    const scored = QUIZ.options.map((option) => {
        let score = 0;
        option.tags.forEach((tag) => {
            if (userTags.has(tag)) score += 10;
        });

        const userHours =
            hours === "5"
                ? 5
                : hours === "10"
                    ? 10
                    : hours === "20"
                        ? 20
                        : 25;
        if (option.difficulty === "Easy") score += 5;
        if (goal === "high" && option.difficulty !== "Easy")
            score += 5;
        if (goal === "low" && option.difficulty === "Easy")
            score += 10;

        return { ...option, score };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 5);
}

function generateFallbackAnalysis(answers, recommendations) {
    const topRec = recommendations[0]?.name || "online tutoring";
    const hours =
        answers.hours === "5"
            ? "5"
            : answers.hours === "10"
                ? "10"
                : answers.hours === "20"
                    ? "20"
                    : "20+";

    return `Based on your profile as a ${answers.year || "college"} student studying ${answers.major || "your field"}, I recommend starting with ${topRec}. With ${hours} hours per week available, you could realistically earn ${recommendations[0]?.monthlyPotential || "$400-$800"} per month. Your skills in ${answers.skills?.join(", ") || "various areas"} make you a great fit for these opportunities!`;
}

function renderResults(recommendations, aiAnalysis) {
    const hoursNum =
        answers.hours === "5"
            ? 5
            : answers.hours === "10"
                ? 10
                : answers.hours === "20"
                    ? 20
                    : 25;

    resultsScreen.innerHTML = `
          <div class="results-container">
            <div class="results-header">
              <h1>🎉 Your Personalized Results</h1>
              <p>Based on your profile, here are the best income opportunities for you:</p>
            </div>
            
            <!-- AI Analysis Box -->
            <div class="ai-box">
              <div class="ai-box-header">
                <span class="ai-icon">✨</span>
                AI Personal Analysis
              </div>
              <div class="ai-box-content">
                ${aiAnalysis}
              </div>
            </div>
            
            <!-- Recommendations -->
            <div class="recommendations-list">
              ${recommendations
            .map((rec, index) => {
                const affiliate =
                    QUIZ.affiliates[rec.primaryAffiliate] || {};
                return `
                  <div class="recommendation-card ${index === 0 ? "featured" : ""}">
                    ${index === 0 ? '<div class="rec-badge">🏆 Best Match</div>' : ""}
                    <div class="rec-header">
                      <h3>${rec.name}</h3>
                      <span class="rec-earnings">${rec.monthlyPotential}</span>
                    </div>
                    <p class="rec-description">${rec.description}</p>
                    <div class="rec-details">
                      <span class="rec-detail">⏱️ ${rec.timeCommitment}</span>
                      <span class="rec-detail difficulty-${rec.difficulty.toLowerCase()}">
                        ${rec.difficulty === "Easy" ? "🟢" : rec.difficulty === "Medium" ? "🟡" : "🔴"} ${rec.difficulty}
                      </span>
                    </div>
                    <div class="rec-pros">
                      ${rec.pros
                        .slice(0, 3)
                        .map(
                            (pro) => `<span class="pro-item">✓ ${pro}</span>`,
                        )
                        .join("")}
                    </div>
                    ${affiliate && affiliate.url
                        ? `<a 
                             href="${affiliate.url}" 
                             target="_blank" 
                             rel="noopener sponsored"
                             class="affiliate-btn"
                             data-affiliate="${rec.primaryAffiliate}"
                             onclick="if(typeof trackAffiliateClick === 'function') trackAffiliateClick('${rec.primaryAffiliate}')"
                           >
                             ${affiliate.cta || "Get Started"} →
                           </a>`
                        : `<button 
                             class="affiliate-btn btn-disabled" 
                             disabled
                             title="We're working on adding an affiliate partner for this opportunity"
                           >
                             Affiliate Link Coming Soon
                           </button>`
                    }
                  </div>
                `;
            })
            .join("")}
            </div>
            
            <!-- Retake -->
            <div class="results-footer">
              <button id="retake-btn" class="btn btn-outline">
                ← Take Quiz Again
              </button>
            </div>

            <!-- Skills Roadmap CTA -->
            <div class="roadmap-cta" id="roadmap-cta">
              <div class="roadmap-cta-content">
                <span class="roadmap-badge">🗺️ AI-Powered</span>
                <h3>Want to know how to start?</h3>
                <p>Get a personalized 4-week learning roadmap for your top recommendation.</p>
                <button id="get-roadmap-btn" class="btn btn-primary">
                  Generate My 4-Week Roadmap →
                </button>
              </div>
            </div>

            <!-- Skills Roadmap CTA -->
            <div class="roadmap-cta" id="roadmap-cta">
              <div class="roadmap-cta-content">
                <span class="roadmap-badge">🗺️ AI-Powered</span>
                <h3>Want to know how to start?</h3>
                <p>Get a personalized 4-week learning roadmap for your top recommendation.</p>
                <button id="get-roadmap-btn" class="btn btn-secondary">
                  ✨ Generate My Roadmap
                </button>
              </div>
            </div>

            <!-- Roadmap Modal -->
            <div id="roadmap-modal" class="roadmap-modal" style="display:none;">
              <div class="roadmap-modal-content">
                <button class="roadmap-close" id="roadmap-close">&times;</button>
                <div id="roadmap-loading" class="roadmap-loading">
                  <div class="loading-spinner"></div>
                  <p>🧠 AI is creating your roadmap...</p>
                </div>
                <div id="roadmap-content"></div>
              </div>
            </div>
            
            <!-- Affiliate Disclosure -->
            <p class="affiliate-disclosure">
              <small>
                Affiliate Disclosure: Some links above are affiliate links. We may earn a commission 
                if you sign up through these links, at no extra cost to you.
              </small>
            </p>
          </div>
        `;

    // Retake button
    document
        .getElementById("retake-btn")
        .addEventListener("click", () => {
            currentQuestion = 0;
            answers = {};
            showScreen("intro");
        });

    // Get roadmap modal elements (dynamically rendered)
    const roadmapModal = document.getElementById("roadmap-modal");
    const roadmapClose = document.getElementById("roadmap-close");
    const roadmapContent = document.getElementById("roadmap-content");
    const roadmapLoading = document.getElementById("roadmap-loading");

    if (roadmapClose) {
        roadmapClose.addEventListener("click", () => {
            roadmapModal.style.display = "none";
        });
    }

    function displayRoadmap(roadmap) {
        roadmapContent.innerHTML = `
                        <h2>${roadmap.title}</h2>
                        <p class="roadmap-overview">${roadmap.overview}</p>
                        <div class="roadmap-weeks">
                            ${roadmap.weeks
                .map(
                    (w) => `
                                <div class="roadmap-week">
                                    <div class="week-header">
                                        <span class="week-number">Week ${w.week}</span>
                                        <h4>${w.title}</h4>
                                    </div>
                                    <p class="week-goal"><strong>Goal:</strong> ${w.goal}</p>
                                    <ul class="week-tasks">
                                        ${w.tasks.map((t) => `<li>✓ ${t}</li>`).join("")}
                                    </ul>
                                    ${w.resource
                            ? `
                                        <div class="week-resource">
                                            📚 <strong>${w.resource.name}</strong> (${w.resource.type})
                                        </div>
                                    `
                            : ""
                        }
                                </div>
                            `,
                )
                .join("")}
                        </div>
                        <div class="roadmap-milestones">
                            <h4>🎯 Key Milestones</h4>
                            <div class="milestone">Week 1: ${roadmap.milestones?.week1 || "Get started"}</div>
                            <div class="milestone">Week 2: ${roadmap.milestones?.week2 || "Build skills"}</div>
                            <div class="milestone final">Week 4: ${roadmap.milestones?.week4 || "First income!"}</div>
                        </div>
                    `;
    }

    function getFallbackRoadmap(hustleName) {
        return {
            title: `Your 4-Week ${hustleName} Roadmap`,
            overview: `A practical guide to start earning with ${hustleName} in just 4 weeks.`,
            weeks: [
                {
                    week: 1,
                    title: "Foundation",
                    goal: "Set up your profile",
                    tasks: [
                        "Research platforms",
                        "Create account",
                        "Complete profile",
                    ],
                    resource: {
                        name: "YouTube tutorials",
                        type: "Free",
                    },
                },
                {
                    week: 2,
                    title: "Skill Building",
                    goal: "Build core skills",
                    tasks: [
                        "Take a course",
                        "Practice",
                        "Get feedback",
                    ],
                    resource: {
                        name: "Online courses",
                        type: "Free",
                    },
                },
                {
                    week: 3,
                    title: "First Clients",
                    goal: "Land first opportunity",
                    tasks: [
                        "Apply to 5+ jobs",
                        "Follow up",
                        "Complete work",
                    ],
                    resource: { name: "Templates", type: "Free" },
                },
                {
                    week: 4,
                    title: "Scale Up",
                    goal: "Increase earnings",
                    tasks: [
                        "Get reviews",
                        "Raise rates",
                        "Optimize workflow",
                    ],
                    resource: {
                        name: "Productivity tools",
                        type: "Free",
                    },
                },
            ],
            milestones: {
                week1: "Profile complete",
                week2: "Portfolio ready",
                week4: "First payment! 🎉",
            },
        };
    }
}

// Screen Navigation
function showScreen(screen) {
    [
        introScreen,
        questionsScreen,
        loadingScreen,
        resultsScreen,
    ].forEach((s) => {
        s.classList.remove("active");
    });

    if (screen === "intro") introScreen.classList.add("active");
    if (screen === "questions")
        questionsScreen.classList.add("active");
    if (screen === "loading") loadingScreen.classList.add("active");
    if (screen === "results") resultsScreen.classList.add("active");
}
// Global Event Delegation for dynamic elements
document.addEventListener("click", async (e) => {
    // Handle Roadmap Button
    const roadmapBtn = e.target.closest("#get-roadmap-btn");
    if (roadmapBtn) {
        const topRec = recommendations[0];
        if (!topRec) return;

        const roadmapModal =
            document.getElementById("roadmap-modal");
        const roadmapLoading =
            document.getElementById("roadmap-loading");
        const roadmapContent =
            document.getElementById("roadmap-content");

        if (roadmapModal) roadmapModal.style.display = "flex";
        if (roadmapLoading) roadmapLoading.style.display = "block";
        if (roadmapContent) roadmapContent.innerHTML = "";

        try {
            const response = await fetch("/api/generate-roadmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hustleName: topRec.name,
                    userProfile: answers,
                }),
            });

            const data = await response.json();
            let roadmap;
            if (data.success && data.roadmap) {
                roadmap = data.roadmap;
            } else {
                throw new Error("Failed to generate");
            }

            // Render roadmap inline
            if (roadmapContent) {
                roadmapContent.innerHTML = `
                    <h2>${roadmap.title}</h2>
                    <p class="roadmap-overview">${roadmap.overview}</p>
                    <div class="roadmap-weeks">
                        ${roadmap.weeks.map((w) => `
                            <div class="roadmap-week">
                                <div class="week-header">
                                    <span class="week-number">Week ${w.week}</span>
                                    <h4>${w.title}</h4>
                                </div>
                                <p class="week-goal"><strong>Goal:</strong> ${w.goal}</p>
                                <ul class="week-tasks">
                                    ${w.tasks.map((t) => `<li>✓ ${t}</li>`).join("")}
                                </ul>
                                ${w.resource ? `
                                    <div class="week-resource">
                                        📚 <strong>${w.resource.name}</strong> (${w.resource.type})
                                    </div>
                                ` : ""}
                            </div>
                        `).join("")}
                    </div>
                    <div class="roadmap-milestones">
                        <h4>🎯 Key Milestones</h4>
                        <div class="milestone">Week 1: ${roadmap.milestones?.week1 || "Get started"}</div>
                        <div class="milestone">Week 2: ${roadmap.milestones?.week2 || "Build skills"}</div>
                        <div class="milestone final">Week 4: ${roadmap.milestones?.week4 || "First income!"}</div>
                    </div>
                `;
            }
        } catch (error) {
            console.error("Roadmap error:", error);
            // Show fallback
            if (roadmapContent) {
                roadmapContent.innerHTML = `
                    <h2>Your 4-Week ${topRec.name} Roadmap</h2>
                    <p class="roadmap-overview">A practical guide to get started.</p>
                    <div class="roadmap-weeks">
                        <div class="roadmap-week">
                            <div class="week-header"><span class="week-number">Week 1</span><h4>Foundation</h4></div>
                            <p class="week-goal"><strong>Goal:</strong> Set up basics</p>
                            <ul class="week-tasks"><li>✓ Research</li><li>✓ Create profile</li></ul>
                        </div>
                        <div class="roadmap-week">
                            <div class="week-header"><span class="week-number">Week 2</span><h4>Build Skills</h4></div>
                            <p class="week-goal"><strong>Goal:</strong> Develop skills</p>
                            <ul class="week-tasks"><li>✓ Practice</li><li>✓ Create portfolio</li></ul>
                        </div>
                        <div class="roadmap-week">
                            <div class="week-header"><span class="week-number">Week 3</span><h4>First Clients</h4></div>
                            <p class="week-goal"><strong>Goal:</strong> Land first gig</p>
                            <ul class="week-tasks"><li>✓ Apply</li><li>✓ Complete task</li></ul>
                        </div>
                        <div class="roadmap-week">
                            <div class="week-header"><span class="week-number">Week 4</span><h4>Scale</h4></div>
                            <p class="week-goal"><strong>Goal:</strong> Grow income</p>
                            <ul class="week-tasks"><li>✓ Get reviews</li><li>✓ Optimize</li></ul>
                        </div>
                    </div>
                `;
            }
        }

        if (roadmapLoading) roadmapLoading.style.display = "none";
    }

    // Handle Retake Button
    const retakeBtn = e.target.closest("#retake-btn");
    if (retakeBtn) {
        currentQuestion = 0;
        answers = {};
        showScreen("intro");
    }
});
