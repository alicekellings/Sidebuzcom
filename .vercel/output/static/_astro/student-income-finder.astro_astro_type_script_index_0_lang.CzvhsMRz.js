const d=window.QUIZ_DATA;let a=0,o={};const g=document.getElementById("quiz-intro"),v=document.getElementById("quiz-questions"),$=document.getElementById("quiz-loading"),y=document.getElementById("quiz-results"),B=document.getElementById("progress-bar"),I=document.getElementById("progress-text"),p=document.getElementById("question-container"),A=document.getElementById("prev-btn"),E=document.getElementById("next-btn"),L=document.getElementById("start-quiz");L.addEventListener("click",()=>{f("questions"),h()});A.addEventListener("click",()=>{a>0&&(a--,h())});E.addEventListener("click",()=>{const e=d.questions[a],t=S(e);if(!t||Array.isArray(t)&&t.length===0){alert("Please select an option to continue");return}o[e.id]=t,a<d.questions.length-1?(a++,h()):R()});function h(){const e=d.questions[a],t=d.questions.length,s=(a+1)/t*100;B.style.width=`${s}%`,I.textContent=`Question ${a+1} of ${t}`,A.disabled=a===0,E.textContent=a===t-1?"See Results →":"Next →";const n=o[e.id];p.innerHTML=`
          <div class="question-card">
            <h2 class="question-text">${e.question}</h2>
            <div class="options-grid ${e.type==="multiple"?"multiple":""}">
              ${e.options.map(i=>`
                <label class="option-card ${b(n,i.value)?"selected":""}">
                  <input 
                    type="${e.type==="multiple"?"checkbox":"radio"}" 
                    name="q-${e.id}" 
                    value="${i.value}"
                    ${b(n,i.value)?"checked":""}
                  />
                  <span class="option-icon">${i.icon}</span>
                  <span class="option-label">${i.label}</span>
                </label>
              `).join("")}
            </div>
            ${e.type==="multiple"?'<p class="multi-hint">Select all that apply</p>':""}
          </div>
        `,p.querySelectorAll(".option-card").forEach(i=>{i.addEventListener("click",()=>{e.type==="single"&&p.querySelectorAll(".option-card").forEach(u=>u.classList.remove("selected")),i.classList.toggle("selected")})})}function b(e,t){return e?Array.isArray(e)?e.includes(t):e===t:!1}function S(e){const t=p.querySelectorAll(`input[name="q-${e.id}"]:checked`);return e.type==="multiple"?Array.from(t).map(s=>s.value):t[0]?.value||null}const c={lastRequest:0,requestCount:0,maxRequests:3,windowMs:6e4};function x(){const e=Date.now();return e-c.lastRequest>c.windowMs&&(c.requestCount=0),c.requestCount>=c.maxRequests?!1:(c.requestCount++,c.lastRequest=e,!0)}async function R(){if(f("loading"),!x()){const s="You've made several requests recently. Please wait a minute before trying again. In the meantime, here's our recommendation based on your profile!",n=q(o);k(n,s),f("results");return}const e=q(o);let t;try{const s=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({answers:o,recommendations:e.slice(0,3)})});if(s.ok)t=(await s.json()).analysis;else if(s.status===429)t="Our AI is quite busy right now! Based on your profile, here's what we recommend:";else throw new Error("API error")}catch{console.log("Using fallback analysis"),t=C(o,e)}k(e,t),f("results")}function q(e){const{major:t,year:s,hours:n,skills:i,goal:u}=e,m=new Set;return t&&m.add(t),s&&m.add(s),i&&i.forEach(l=>m.add(l)),d.options.map(l=>{let r=0;return l.tags.forEach(w=>{m.has(w)&&(r+=10)}),l.difficulty==="Easy"&&(r+=5),u==="high"&&l.difficulty!=="Easy"&&(r+=5),u==="low"&&l.difficulty==="Easy"&&(r+=10),{...l,score:r}}).sort((l,r)=>r.score-l.score).slice(0,5)}function C(e,t){const s=t[0]?.name||"online tutoring",n=e.hours==="5"?"5":e.hours==="10"?"10":e.hours==="20"?"20":"20+";return`Based on your profile as a ${e.year||"college"} student studying ${e.major||"your field"}, I recommend starting with ${s}. With ${n} hours per week available, you could realistically earn ${t[0]?.monthlyPotential||"$400-$800"} per month. Your skills in ${e.skills?.join(", ")||"various areas"} make you a great fit for these opportunities!`}function k(e,t){o.hours==="5"||o.hours==="10"||o.hours,y.innerHTML=`
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
                ${t}
              </div>
            </div>
            
            <!-- Recommendations -->
            <div class="recommendations-list">
              ${e.map((s,n)=>{const i=d.affiliates[s.primaryAffiliate]||{};return`
                  <div class="recommendation-card ${n===0?"featured":""}">
                    ${n===0?'<div class="rec-badge">🏆 Best Match</div>':""}
                    <div class="rec-header">
                      <h3>${s.name}</h3>
                      <span class="rec-earnings">${s.monthlyPotential}</span>
                    </div>
                    <p class="rec-description">${s.description}</p>
                    <div class="rec-details">
                      <span class="rec-detail">⏱️ ${s.timeCommitment}</span>
                      <span class="rec-detail difficulty-${s.difficulty.toLowerCase()}">
                        ${s.difficulty==="Easy"?"🟢":s.difficulty==="Medium"?"🟡":"🔴"} ${s.difficulty}
                      </span>
                    </div>
                    <div class="rec-pros">
                      ${s.pros.slice(0,3).map(u=>`<span class="pro-item">✓ ${u}</span>`).join("")}
                    </div>
                    ${i&&i.url?`<a 
                             href="${i.url}" 
                             target="_blank" 
                             rel="noopener sponsored"
                             class="affiliate-btn"
                             data-affiliate="${s.primaryAffiliate}"
                             onclick="if(typeof trackAffiliateClick === 'function') trackAffiliateClick('${s.primaryAffiliate}')"
                           >
                             ${i.cta||"Get Started"} →
                           </a>`:`<button 
                             class="affiliate-btn btn-disabled" 
                             disabled
                             title="We're working on adding an affiliate partner for this opportunity"
                           >
                             Affiliate Link Coming Soon
                           </button>`}
                  </div>
                `}).join("")}
            </div>
            
            <!-- Retake -->
            <div class="results-footer">
              <button id="retake-btn" class="btn btn-outline">
                ← Take Quiz Again
              </button>
            </div>
            
            <!-- Affiliate Disclosure -->
            <p class="affiliate-disclosure">
              <small>
                Affiliate Disclosure: Some links above are affiliate links. We may earn a commission 
                if you sign up through these links, at no extra cost to you.
              </small>
            </p>
          </div>
        `,document.getElementById("retake-btn").addEventListener("click",()=>{a=0,o={},f("intro")})}function f(e){[g,v,$,y].forEach(t=>{t.classList.remove("active")}),e==="intro"&&g.classList.add("active"),e==="questions"&&v.classList.add("active"),e==="loading"&&$.classList.add("active"),e==="results"&&y.classList.add("active")}
