const d=window.QUIZ_DATA;let n=0,l={};const h=document.getElementById("quiz-intro"),v=document.getElementById("quiz-questions"),g=document.getElementById("quiz-loading"),p=document.getElementById("quiz-results"),A=document.getElementById("progress-bar"),k=document.getElementById("progress-text"),f=document.getElementById("question-container"),b=document.getElementById("prev-btn"),E=document.getElementById("next-btn"),B=document.getElementById("start-quiz");B.addEventListener("click",()=>{m("questions"),y()});b.addEventListener("click",()=>{n>0&&(n--,y())});E.addEventListener("click",()=>{const e=d.questions[n],t=I(e);if(!t||Array.isArray(t)&&t.length===0){alert("Please select an option to continue");return}l[e.id]=t,n<d.questions.length-1?(n++,y()):L()});function y(){const e=d.questions[n],t=d.questions.length,s=(n+1)/t*100;A.style.width=`${s}%`,k.textContent=`Question ${n+1} of ${t}`,b.disabled=n===0,E.textContent=n===t-1?"See Results →":"Next →";const o=l[e.id];f.innerHTML=`
          <div class="question-card">
            <h2 class="question-text">${e.question}</h2>
            <div class="options-grid ${e.type==="multiple"?"multiple":""}">
              ${e.options.map(i=>`
                <label class="option-card ${$(o,i.value)?"selected":""}">
                  <input 
                    type="${e.type==="multiple"?"checkbox":"radio"}" 
                    name="q-${e.id}" 
                    value="${i.value}"
                    ${$(o,i.value)?"checked":""}
                  />
                  <span class="option-icon">${i.icon}</span>
                  <span class="option-label">${i.label}</span>
                </label>
              `).join("")}
            </div>
            ${e.type==="multiple"?'<p class="multi-hint">Select all that apply</p>':""}
          </div>
        `,f.querySelectorAll(".option-card").forEach(i=>{i.addEventListener("click",()=>{e.type==="single"&&f.querySelectorAll(".option-card").forEach(c=>c.classList.remove("selected")),i.classList.toggle("selected")})})}function $(e,t){return e?Array.isArray(e)?e.includes(t):e===t:!1}function I(e){const t=f.querySelectorAll(`input[name="q-${e.id}"]:checked`);return e.type==="multiple"?Array.from(t).map(s=>s.value):t[0]?.value||null}async function L(){m("loading"),await new Promise(s=>setTimeout(s,2e3));const e=S(l),t=x(l,e);w(e,t),m("results")}function S(e){const{major:t,year:s,hours:o,skills:i,goal:c}=e,u=new Set;return t&&u.add(t),s&&u.add(s),i&&i.forEach(a=>u.add(a)),d.options.map(a=>{let r=0;return a.tags.forEach(q=>{u.has(q)&&(r+=10)}),a.difficulty==="Easy"&&(r+=5),c==="high"&&a.difficulty!=="Easy"&&(r+=5),c==="low"&&a.difficulty==="Easy"&&(r+=10),{...a,score:r}}).sort((a,r)=>r.score-a.score).slice(0,5)}function x(e,t){const s=t[0]?.name||"online tutoring",o=e.hours==="5"?"5":e.hours==="10"?"10":e.hours==="20"?"20":"20+";return`Based on your profile as a ${e.year||"college"} student studying ${e.major||"your field"}, I recommend starting with ${s}. With ${o} hours per week available, you could realistically earn ${t[0]?.monthlyPotential||"$400-$800"} per month. Your skills in ${e.skills?.join(", ")||"various areas"} make you a great fit for these opportunities!`}function w(e,t){l.hours==="5"||l.hours==="10"||l.hours,p.innerHTML=`
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
              ${e.map((s,o)=>{const i=d.affiliates[s.primaryAffiliate]||{};return`
                  <div class="recommendation-card ${o===0?"featured":""}">
                    ${o===0?'<div class="rec-badge">🏆 Best Match</div>':""}
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
                      ${s.pros.slice(0,3).map(c=>`<span class="pro-item">✓ ${c}</span>`).join("")}
                    </div>
                    <a 
                      href="${i.url||"#"}" 
                      target="_blank" 
                      rel="noopener sponsored"
                      class="affiliate-btn"
                      data-affiliate="${s.primaryAffiliate}"
                    >
                      ${i.cta||"Get Started"} →
                    </a>
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
        `,document.getElementById("retake-btn").addEventListener("click",()=>{n=0,l={},m("intro")})}function m(e){[h,v,g,p].forEach(t=>{t.classList.remove("active")}),e==="intro"&&h.classList.add("active"),e==="questions"&&v.classList.add("active"),e==="loading"&&g.classList.add("active"),e==="results"&&p.classList.add("active")}
