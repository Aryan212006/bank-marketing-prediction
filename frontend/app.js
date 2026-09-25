/**
 * NeuroBank AI — Modern Fintech Banking Marketing Prediction Controller
 * Handles multi-page routing, real-time prediction CRUD, animated KPI counters,
 * history table filtering/sorting/pagination, CSV export, and API communication.
 */

// ============================================================
// CONFIG & INITIAL STATE
// ============================================================
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
const API_URLS = isLocal 
  ? ['http://127.0.0.1:5000', window.location.origin, 'http://127.0.0.1:8000']
  : [window.location.origin];

let activeApi = 'http://127.0.0.1:5000';
let apiOnline = false;

let allPredictions = [];
let filteredPredictions = [];
let currentPage = 1;
let pageSize = 10;
let sortCol = 'id';
let sortDir = 'desc';

// Pre-seeded high quality bank predictions
const DUMMY_DATA = [
  { id: 1, timestamp: '2026-09-24 08:12', age: 42, job: 'management', marital: 'married', education: 'tertiary', balance: 6500, duration: 680, decision: 'YES', probability: 0.981, confidence: 98.1, recommendation: 'High-priority prospect. Contact immediately for premium term deposit.', poutcome: 'success', contact: 'cellular', month: 'sep' },
  { id: 2, timestamp: '2026-09-24 09:03', age: 55, job: 'retired', marital: 'married', education: 'secondary', balance: 3200, duration: 512, decision: 'YES', probability: 0.871, confidence: 87.1, recommendation: 'High-priority prospect. Assign relationship manager for retirement savings.', poutcome: 'unknown', contact: 'cellular', month: 'oct' },
  { id: 3, timestamp: '2026-09-24 10:45', age: 27, job: 'blue-collar', marital: 'single', education: 'secondary', balance: 150, duration: 95, decision: 'NO', probability: 0.082, confidence: 91.8, recommendation: 'Low-probability lead. Avoid expensive telemarketing calls.', poutcome: 'failure', contact: 'telephone', month: 'may' },
  { id: 4, timestamp: '2026-09-24 11:20', age: 38, job: 'technician', marital: 'married', education: 'tertiary', balance: 4100, duration: 420, decision: 'YES', probability: 0.763, confidence: 76.3, recommendation: 'Moderate-priority prospect. Include in direct marketing follow-up.', poutcome: 'unknown', contact: 'cellular', month: 'mar' },
  { id: 5, timestamp: '2026-09-24 12:05', age: 61, job: 'retired', marital: 'divorced', education: 'primary', balance: 8900, duration: 730, decision: 'YES', probability: 0.944, confidence: 94.4, recommendation: 'High-priority prospect. Promote fixed-term wealth preservation.', poutcome: 'success', contact: 'cellular', month: 'sep' },
  { id: 6, timestamp: '2026-09-24 13:30', age: 33, job: 'admin.', marital: 'single', education: 'tertiary', balance: 720, duration: 180, decision: 'NO', probability: 0.143, confidence: 85.7, recommendation: 'Low-probability lead. Consider automated digital campaign.', poutcome: 'failure', contact: 'telephone', month: 'jun' },
  { id: 7, timestamp: '2026-09-24 14:15', age: 48, job: 'entrepreneur', marital: 'married', education: 'tertiary', balance: 12000, duration: 580, decision: 'YES', probability: 0.888, confidence: 88.8, recommendation: 'High-priority prospect. Senior corporate banking liaison.', poutcome: 'success', contact: 'cellular', month: 'oct' },
  { id: 8, timestamp: '2026-09-24 15:00', age: 22, job: 'student', marital: 'single', education: 'tertiary', balance: -200, duration: 62, decision: 'NO', probability: 0.038, confidence: 96.2, recommendation: 'Low-probability lead. Overdrawn account; defer outreach.', poutcome: 'unknown', contact: 'unknown', month: 'may' },
  { id: 9, timestamp: '2026-09-24 16:45', age: 44, job: 'services', marital: 'married', education: 'secondary', balance: 2800, duration: 370, decision: 'NO', probability: 0.312, confidence: 68.8, recommendation: 'Borderline candidate. Send informative digital email campaigns.', poutcome: 'other', contact: 'cellular', month: 'aug' },
  { id: 10, timestamp: '2026-09-24 17:20', age: 57, job: 'management', marital: 'married', education: 'tertiary', balance: 15000, duration: 820, decision: 'YES', probability: 0.976, confidence: 97.6, recommendation: 'High-priority prospect. Immediate personal banking consultation.', poutcome: 'success', contact: 'cellular', month: 'mar' },
  { id: 11, timestamp: '2026-09-24 18:10', age: 30, job: 'technician', marital: 'single', education: 'tertiary', balance: 1200, duration: 290, decision: 'NO', probability: 0.228, confidence: 77.2, recommendation: 'Borderline candidate. Schedule quarterly email re-engagement.', poutcome: 'failure', contact: 'cellular', month: 'nov' },
  { id: 12, timestamp: '2026-09-24 19:00', age: 52, job: 'self-employed', marital: 'married', education: 'secondary', balance: 6700, duration: 610, decision: 'YES', probability: 0.834, confidence: 83.4, recommendation: 'Moderate-priority prospect. Personalized term deposit offering.', poutcome: 'unknown', contact: 'cellular', month: 'sep' }
];

let nextId = 13;

// ============================================================
// DATA SANITIZER
// ============================================================
function sanitizeItem(p, index) {
  if (!p || typeof p !== 'object') p = {};
  return {
    id: typeof p.id === 'number' ? p.id : (index + 1),
    timestamp: p.timestamp || '2026-09-24 12:00',
    age: typeof p.age === 'number' ? p.age : (parseInt(p.age) || 35),
    job: String(p.job || 'management'),
    marital: String(p.marital || 'married'),
    education: String(p.education || 'tertiary'),
    balance: typeof p.balance === 'number' ? p.balance : (parseFloat(p.balance) || 0),
    duration: typeof p.duration === 'number' ? p.duration : (parseInt(p.duration) || 0),
    decision: String(p.decision || (p.prediction === 1 ? 'YES' : 'NO')).toUpperCase(),
    probability: typeof p.probability === 'number' ? p.probability : (parseFloat(p.subscription_probability) || 0.5),
    confidence: typeof p.confidence === 'number' ? p.confidence : (parseFloat(p.confidence_score) || 75.0),
    recommendation: String(p.recommendation || 'Standard marketing follow-up.'),
    poutcome: String(p.poutcome || 'unknown'),
    contact: String(p.contact || 'cellular'),
    month: String(p.month || 'may'),
    payload: p.payload || {}
  };
}

// ============================================================
// UI UTILITIES
// ============================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="font-weight:900;font-size:1.1em">${icons[type] || 'ℹ'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
  }, 3200);
}

function formatTime(ts) {
  if (!ts) return '—';
  const parts = String(ts).split(' ');
  return parts.length > 1 ? parts[1] : ts;
}

function probClass(prob) {
  const p = (Number(prob) || 0) * 100;
  if (p >= 70) return 'high';
  if (p >= 40) return 'mid';
  return 'low';
}

// Smooth animated KPI counter
function animateNumber(element, start, end, duration = 600, isPercent = false, decimals = 0) {
  if (!element) return;
  const range = end - start;
  const startTime = performance.now();
  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentVal = start + (range * easeOut);
    element.textContent = decimals > 0 
      ? (isPercent ? `${currentVal.toFixed(decimals)}%` : currentVal.toFixed(decimals))
      : (isPercent ? `${Math.round(currentVal)}%` : Math.round(currentVal).toLocaleString());
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = decimals > 0
        ? (isPercent ? `${end.toFixed(decimals)}%` : end.toFixed(decimals))
        : (isPercent ? `${Math.round(end)}%` : Math.round(end).toLocaleString());
    }
  }
  requestAnimationFrame(step);
}

// ============================================================
// PAGE ROUTING & NAVIGATION
// ============================================================
const PAGE_TITLES = {
  dashboard: 'Dashboard',
  predict: 'New Prediction',
  history: 'Prediction History',
  analytics: 'Model Analytics',
  insights: 'Dataset Insights',
  about: 'About & SOP'
};

function navigateTo(pageId) {
  try {
    // 1. Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));

    // 2. Remove active state from all sidebar items
    const navItems = document.querySelectorAll('.sb-item, .nav-item');
    navItems.forEach(n => n.classList.remove('active'));

    // 3. Activate target page section
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    // 4. Activate target nav button
    const targetNav = document.getElementById(`nav-${pageId}`);
    if (targetNav) targetNav.classList.add('active');

    // 5. Update topbar title
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = PAGE_TITLES[pageId] || pageId;

    // 6. Close mobile sidebar if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
      sidebar.classList.remove('mobile-open');
    }

    // 7. Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 8. Page-specific lifecycle updates
    if (pageId === 'history') {
      renderHistoryTable();
      updateHistoryKPIs();
    } else if (pageId === 'dashboard') {
      updateDashboardKPIs();
    }
  } catch (err) {
    console.error('[Navigation Error]', err);
  }
}
window.navigateTo = navigateTo;

// Universal click delegation for data-page attributes
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-page]');
  if (target && target.dataset.page && !target.classList.contains('sb-item')) {
    e.preventDefault();
    navigateTo(target.dataset.page);
  }
});

// Sidebar collapse/mobile toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('mainContent');
  if (!sidebar) return;
  if (window.innerWidth <= 900) {
    sidebar.classList.toggle('mobile-open');
  } else {
    sidebar.classList.toggle('collapsed');
    if (main) main.classList.toggle('expanded');
  }
}
window.toggleSidebar = toggleSidebar;

const sidebarToggleBtn = document.getElementById('sidebarToggle');
if (sidebarToggleBtn) {
  sidebarToggleBtn.addEventListener('click', toggleSidebar);
}

// Theme Toggle
let isLight = false;
const themeBtn = document.getElementById('themeBtn');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    isLight = !isLight;
    document.body.classList.toggle('light', isLight);
    showToast(isLight ? 'Switched to Light Theme' : 'Switched to Dark Theme', 'info');
  });
}

// Refresh Button
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.classList.add('spinning');
    await checkBackendHealth();
    updateDashboardKPIs();
    updateHistoryKPIs();
    setTimeout(() => refreshBtn.classList.remove('spinning'), 600);
    showToast('Dashboard metrics refreshed', 'success');
  });
}

// ============================================================
// BACKEND HEALTH & ANALYTICS FETCH
// ============================================================
async function checkBackendHealth() {
  let connected = false;
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  for (const url of API_URLS) {
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        activeApi = url;
        apiOnline = true;
        if (statusDot) {
          statusDot.className = 'api-dot';
          statusDot.style.background = 'var(--emerald-l)';
          statusDot.style.boxShadow = '0 0 8px var(--emerald)';
        }
        if (statusText) statusText.textContent = `API: Online (${data.framework || 'Flask'})`;
        connected = true;
        loadAnalyticsData();
        break;
      }
    } catch { /* try next candidate */ }
  }

  if (!connected) {
    apiOnline = false;
    if (statusDot) {
      statusDot.className = 'api-dot';
      statusDot.style.background = 'var(--amber-l)';
      statusDot.style.boxShadow = 'none';
    }
    if (statusText) statusText.textContent = 'API: Standalone Mode';
  }
}

async function loadAnalyticsData() {
  try {
    const res = await fetch(`${activeApi}/api/analytics`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return;
    const data = await res.json();
    if (data.feature_importance && data.feature_importance.length > 0) {
      renderFeatureImportance(data.feature_importance);
    }
  } catch { /* use existing template values */ }
}

const FEAT_LABELS = {
  duration: 'duration (Call Duration)', month: 'month (Contact Month)',
  contact: 'contact (Type)', age: 'age (Customer Age)',
  poutcome: 'poutcome (Previous Outcome)', pdays: 'pdays (Days Since Contact)',
  balance: 'balance (Account Balance €)', housing: 'housing (Housing Loan)',
  day: 'day (Day of Month)', previous: 'previous (Prior Contacts)'
};

function renderFeatureImportance(features) {
  const list = document.getElementById('featureImportanceList');
  if (!list) return;
  list.innerHTML = '';
  features.slice(0, 10).forEach(item => {
    const label = FEAT_LABELS[item.Feature] || item.Feature;
    const pct = ((Number(item.Importance) || 0) * 100).toFixed(1);
    const row = document.createElement('div');
    row.className = 'feat-row';
    row.innerHTML = `
      <div class="feat-meta"><span>${label}</span><span>${pct}%</span></div>
      <div class="feat-track"><div class="feat-fill" style="width:0%"></div></div>
    `;
    list.appendChild(row);
    setTimeout(() => {
      const fill = row.querySelector('.feat-fill');
      if (fill) fill.style.width = `${pct}%`;
    }, 100);
  });
}

// ============================================================
// SAMPLE DATA LOADERS & FORM RESET
// ============================================================
const HIGH_SAMPLE = { age: 42, job: 'management', marital: 'married', education: 'tertiary', default: 'no', balance: 6500, housing: 'no', loan: 'no', contact: 'cellular', month: 'sep', day: 18, duration: 680, campaign: 1, pdays: 90, previous: 2, poutcome: 'success' };
const LOW_SAMPLE = { age: 27, job: 'blue-collar', marital: 'single', education: 'secondary', default: 'no', balance: 120, housing: 'yes', loan: 'yes', contact: 'telephone', month: 'may', day: 8, duration: 85, campaign: 4, pdays: -1, previous: 0, poutcome: 'failure' };

function fillForm(sample) {
  Object.entries(sample).forEach(([k, v]) => {
    const el = document.getElementById(k);
    if (el) el.value = v;
  });
  showToast('Sample profile loaded into form', 'info');
}
window.fillForm = fillForm;

const loadSampleBtn = document.getElementById('loadSampleBtn');
if (loadSampleBtn) loadSampleBtn.addEventListener('click', () => fillForm(HIGH_SAMPLE));

const loadLowBtn = document.getElementById('loadLowBtn');
if (loadLowBtn) loadLowBtn.addEventListener('click', () => fillForm(LOW_SAMPLE));

const hintHigh = document.getElementById('hintHigh');
if (hintHigh) hintHigh.addEventListener('click', () => fillForm(HIGH_SAMPLE));

const clearFormBtn = document.getElementById('clearFormBtn');
if (clearFormBtn) {
  clearFormBtn.addEventListener('click', () => {
    const form = document.getElementById('predictionForm');
    if (form) form.reset();
    resetResultPanel();
    showToast('Form fields cleared', 'info');
  });
}

const retryBtn = document.getElementById('retryBtn');
if (retryBtn) {
  retryBtn.addEventListener('click', () => {
    const form = document.getElementById('predictionForm');
    if (form) form.dispatchEvent(new Event('submit'));
  });
}

function resetResultPanel() {
  const emptyState = document.getElementById('emptyState');
  const loadingState = document.getElementById('loadingState');
  const resultContent = document.getElementById('resultContent');
  const errorBox = document.getElementById('errorBox');
  if (emptyState) emptyState.style.display = 'flex';
  if (loadingState) loadingState.style.display = 'none';
  if (resultContent) resultContent.style.display = 'none';
  if (errorBox) errorBox.style.display = 'none';
}

// ============================================================
// SIMULATED INFERENCE ENGINE (OFFLINE RESILIENCE)
// ============================================================
function simulatePrediction(p) {
  let score = -0.8; // base bias
  // Call duration is the strongest factor (~47.7%)
  const dur = Number(p.duration) || 0;
  if (dur > 600) score += 2.4;
  else if (dur > 400) score += 1.6;
  else if (dur > 250) score += 0.7;
  else if (dur < 120) score -= 1.8;

  // Prior outcome
  if (p.poutcome === 'success') score += 1.9;
  if (p.poutcome === 'failure') score -= 0.6;

  // Contact month seasonality
  if (['mar', 'sep', 'oct', 'dec'].includes(p.month)) score += 0.9;
  if (p.month === 'may') score -= 0.5;

  // Balance & loans
  const bal = Number(p.balance) || 0;
  if (bal > 5000) score += 0.6;
  if (bal < 0) score -= 0.8;
  if (p.housing === 'yes') score -= 0.5;
  if (p.loan === 'yes') score -= 0.4;

  // Contact channel
  if (p.contact === 'cellular') score += 0.3;
  if (p.contact === 'unknown') score -= 0.6;

  // Sigmoid conversion to probability
  const prob = 1 / (1 + Math.exp(-score));
  const prediction = prob >= 0.5 ? 1 : 0;
  const label = prediction === 1 ? 'Yes' : 'No';
  const confidence = prediction === 1 ? prob : (1 - prob);

  let rec = '';
  if (prediction === 1) {
    rec = prob >= 0.75 
      ? 'High-priority prospect. Contact immediately via senior relationship manager for premium term deposit products.'
      : 'Moderate-priority prospect. Include in personalized digital marketing and direct phone outreach.';
  } else {
    rec = prob <= 0.20
      ? 'Low-probability lead. Avoid expensive telemarketing calls to minimize operational expenses.'
      : 'Borderline candidate. Send informative digital email campaigns before scheduling outbound telemarketing.';
  }

  return {
    prediction,
    prediction_label: label,
    subscription_probability: Math.round(prob * 10000) / 10000,
    confidence_score: Math.round(confidence * 10000) / 100,
    recommendation: rec,
    source: 'client-sim'
  };
}

// ============================================================
// PREDICTION FORM SUBMISSION & REAL-TIME DASHBOARD SYNC
// ============================================================
const predForm = document.getElementById('predictionForm');
if (predForm) {
  predForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!predForm.checkValidity()) {
      predForm.reportValidity();
      return;
    }

    const payload = {
      age: +document.getElementById('age').value,
      job: document.getElementById('job').value,
      marital: document.getElementById('marital').value,
      education: document.getElementById('education').value,
      default: document.getElementById('default').value,
      balance: +document.getElementById('balance').value,
      housing: document.getElementById('housing').value,
      loan: document.getElementById('loan').value,
      contact: document.getElementById('contact').value,
      month: document.getElementById('month').value,
      day: +document.getElementById('day').value,
      duration: +document.getElementById('duration').value,
      campaign: +document.getElementById('campaign').value,
      pdays: +document.getElementById('pdays').value,
      previous: +document.getElementById('previous').value,
      poutcome: document.getElementById('poutcome').value
    };

    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    const resultContent = document.getElementById('resultContent');
    const errorBox = document.getElementById('errorBox');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');

    if (emptyState) emptyState.style.display = 'none';
    if (resultContent) resultContent.style.display = 'none';
    if (errorBox) errorBox.style.display = 'none';
    if (loadingState) loadingState.style.display = 'flex';

    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'Analyzing...';

    let data = null;

    try {
      // 1. Try real Flask API
      const res = await fetch(`${activeApi}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.detail || `Server status ${res.status}`);
      }

      data = await res.json();
      data.source = 'api';
    } catch (err) {
      console.warn('API fetch failed, utilizing intelligent offline scoring engine:', err);
      // Fallback to client simulation so the user experience is flawless
      data = simulatePrediction(payload);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (submitText) submitText.textContent = 'Predict Subscription';
    }

    if (data) {
      renderResult(data, payload);
      saveToHistory(data, payload);
      const isYes = data.prediction === 1 || data.prediction_label === 'Yes';
      const toastType = isYes ? 'success' : 'info';
      const sourceNote = data.source === 'client-sim' ? ' (Standalone)' : '';
      showToast(`Prediction: ${data.prediction_label || (isYes ? 'YES' : 'NO')}${sourceNote}`, toastType);
    }
  });
}

function renderResult(data, payload) {
  const loadingState = document.getElementById('loadingState');
  const resultContent = document.getElementById('resultContent');
  if (loadingState) loadingState.style.display = 'none';
  if (resultContent) resultContent.style.display = 'block';

  const yes = data.prediction === 1 || String(data.prediction_label).toUpperCase() === 'YES';
  const prob = Number(data.subscription_probability) || 0;
  const probPct = (prob * 100).toFixed(1);
  const conf = Number(data.confidence_score) || 75;

  const decisionEl = document.getElementById('resultDecision');
  if (decisionEl) decisionEl.className = `result-verdict ${yes ? 'yes' : 'no'}`;

  const decIcon = document.getElementById('decisionIcon');
  if (decIcon) decIcon.textContent = yes ? '✓' : '✗';

  const decLabel = document.getElementById('decisionLabel');
  if (decLabel) decLabel.textContent = yes ? 'WILL SUBSCRIBE' : 'WILL DECLINE';

  const decDesc = document.getElementById('decisionDesc');
  if (decDesc) {
    decDesc.textContent = yes
      ? 'Customer is highly predicted to subscribe to the term deposit.'
      : 'Customer is predicted NOT to subscribe to the term deposit.';
  }

  const probVal = document.getElementById('probabilityVal');
  if (probVal) probVal.textContent = `${probPct}%`;

  const confVal = document.getElementById('confidenceVal');
  if (confVal) confVal.textContent = `${conf.toFixed(1)}%`;

  const gaugePct = document.getElementById('gaugePercent');
  if (gaugePct) gaugePct.textContent = `${probPct}%`;

  const fill = document.getElementById('gaugeFill');
  if (fill) {
    fill.style.width = '0%';
    setTimeout(() => { fill.style.width = `${probPct}%`; }, 80);
    fill.style.background = yes
      ? 'linear-gradient(90deg, #10b981, #34d399)'
      : 'linear-gradient(90deg, #f43f5e, #fb7185)';
  }

  const recText = document.getElementById('recommendationText');
  if (recText) recText.textContent = data.recommendation || 'Proceed with standard banking protocol.';

  // Hook up button to navigate directly to history table
  const viewHistBtn = document.getElementById('viewInHistoryBtn');
  if (viewHistBtn) {
    viewHistBtn.onclick = () => navigateTo('history');
  }
}

// ============================================================
// HISTORY CRUD & LOCALSTORAGE
// ============================================================
function initHistory() {
  try {
    const saved = localStorage.getItem('neurobank_history');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        allPredictions = parsed.map(sanitizeItem);
        const maxId = Math.max(...allPredictions.map(p => p.id || 0), 0);
        nextId = maxId + 1;
      } else {
        allPredictions = DUMMY_DATA.map(sanitizeItem);
        nextId = 13;
      }
    } else {
      allPredictions = DUMMY_DATA.map(sanitizeItem);
      nextId = 13;
    }
  } catch (err) {
    console.warn('History storage read error, fallback to seed data', err);
    allPredictions = DUMMY_DATA.map(sanitizeItem);
    nextId = 13;
  }
  updateHistoryBadge();
}

function saveToLocalStorage() {
  try {
    localStorage.setItem('neurobank_history', JSON.stringify(allPredictions));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

function saveToHistory(data, payload) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB');
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const entry = sanitizeItem({
    id: nextId++,
    timestamp: `${dateStr} ${timeStr}`,
    age: payload.age,
    job: payload.job,
    marital: payload.marital,
    education: payload.education,
    balance: payload.balance,
    duration: payload.duration,
    contact: payload.contact,
    month: payload.month,
    poutcome: payload.poutcome,
    decision: (data.prediction_label || (data.prediction === 1 ? 'YES' : 'NO')).toUpperCase(),
    probability: data.subscription_probability,
    confidence: data.confidence_score,
    recommendation: data.recommendation,
    payload: payload
  });
  
  allPredictions.unshift(entry);
  saveToLocalStorage();
  updateHistoryBadge();
  updateDashboardKPIs();
  updateHistoryKPIs();
}

function updateHistoryBadge() {
  const badge = document.getElementById('history-count-badge');
  if (badge) badge.textContent = allPredictions.length;
}

// ============================================================
// DASHBOARD KPIS & DYNAMIC RECENT PREDICTIONS LIST
// ============================================================
let prevTotal = 0;
let prevYes = 0;
let prevNo = 0;
let prevRate = 0;

function updateDashboardKPIs() {
  try {
    const total = allPredictions.length;
    const yes = allPredictions.filter(p => p.decision === 'YES').length;
    const no = total - yes;
    const rate = total > 0 ? (yes / total) * 100 : 0;
    const yesPct = total > 0 ? ((yes / total) * 100).toFixed(1) : '0.0';
    const noPct = total > 0 ? ((no / total) * 100).toFixed(1) : '0.0';

    const kpiTotal = document.getElementById('kpi-total');
    const kpiYes = document.getElementById('kpi-yes');
    const kpiYesPct = document.getElementById('kpi-yes-pct');
    const kpiNo = document.getElementById('kpi-no');
    const kpiNoPct = document.getElementById('kpi-no-pct');
    const kpiRate = document.getElementById('kpi-rate');

    if (kpiTotal) animateNumber(kpiTotal, prevTotal, total, 400);
    if (kpiYes) animateNumber(kpiYes, prevYes, yes, 400);
    if (kpiNo) animateNumber(kpiNo, prevNo, no, 400);
    if (kpiRate) animateNumber(kpiRate, prevRate, rate, 400, true, 1);

    if (kpiYesPct) kpiYesPct.textContent = `${yesPct}% of total`;
    if (kpiNoPct) kpiNoPct.textContent = `${noPct}% of total`;

    prevTotal = total;
    prevYes = yes;
    prevNo = no;
    prevRate = rate;

    renderRecentPredictions();
    updateHistoryBadge();
  } catch (err) {
    console.error('Error in updateDashboardKPIs:', err);
  }
}

function renderRecentPredictions() {
  const container = document.getElementById('recentPredictions');
  if (!container) return;

  const recent = allPredictions.slice(0, 5);
  if (recent.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <p>No predictions yet. <button class="link-btn" onclick="navigateTo('predict')">Make your first prediction →</button></p>
      </div>`;
    return;
  }

  container.innerHTML = recent.map(p => `
    <div class="recent-row" onclick="showDetail(${p.id})" style="cursor:pointer;" title="Click to view full details">
      <div class="recent-badge ${p.decision === 'YES' ? 'yes' : 'no'}">${p.decision === 'YES' ? '✓' : '✗'}</div>
      <div class="recent-info">
        <div class="recent-name">Age ${p.age} · ${p.job}</div>
        <div class="recent-sub">${p.education} · ${p.marital} · Bal: €${Number(p.balance || 0).toLocaleString()}</div>
      </div>
      <div class="recent-prob ${p.decision === 'YES' ? 'yes' : 'no'}">${((Number(p.probability) || 0) * 100).toFixed(1)}%</div>
      <div class="recent-time">${formatTime(p.timestamp)}</div>
    </div>
  `).join('');
}

// ============================================================
// HISTORY PAGE KPIS
// ============================================================
function updateHistoryKPIs() {
  const total = allPredictions.length;
  const yes = allPredictions.filter(p => p.decision === 'YES').length;
  const no = total - yes;
  const rate = total > 0 ? ((yes / total) * 100).toFixed(1) : '0.0';
  const avgProb = total > 0 
    ? (allPredictions.reduce((acc, p) => acc + (Number(p.probability) || 0), 0) / total * 100).toFixed(1)
    : '0.0';

  const hkpiTotal = document.getElementById('hkpi-total');
  const hkpiYes = document.getElementById('hkpi-yes');
  const hkpiNo = document.getElementById('hkpi-no');
  const hkpiRate = document.getElementById('hkpi-rate');
  const hkpiAvgProb = document.getElementById('hkpi-avgprob');

  if (hkpiTotal) hkpiTotal.textContent = total;
  if (hkpiYes) hkpiYes.textContent = yes;
  if (hkpiNo) hkpiNo.textContent = no;
  if (hkpiRate) hkpiRate.textContent = `${rate}%`;
  if (hkpiAvgProb) hkpiAvgProb.textContent = `${avgProb}%`;
}

// ============================================================
// TABLE FILTERING, SORTING & PAGINATION
// ============================================================
function applyFiltersInternal() {
  const searchEl = document.getElementById('searchFilter');
  const decisionEl = document.getElementById('decisionFilter');
  const minProbEl = document.getElementById('minProbFilter');
  const maxProbEl = document.getElementById('maxProbFilter');

  const search = (searchEl ? searchEl.value : '').toLowerCase().trim();
  const decision = decisionEl ? decisionEl.value : 'all';
  const minProb = parseFloat(minProbEl ? minProbEl.value : 0) || 0;
  const maxProb = parseFloat(maxProbEl ? maxProbEl.value : 100) || 100;

  filteredPredictions = allPredictions.filter(p => {
    const jobStr = String(p.job || '').toLowerCase();
    const decStr = String(p.decision || '').toLowerCase();
    const poutStr = String(p.poutcome || '').toLowerCase();
    const marStr = String(p.marital || '').toLowerCase();
    const eduStr = String(p.education || '').toLowerCase();
    const ageStr = String(p.age || '');
    const idStr = String(p.id || '');

    const matchSearch = !search ||
      jobStr.includes(search) ||
      decStr.includes(search) ||
      poutStr.includes(search) ||
      marStr.includes(search) ||
      eduStr.includes(search) ||
      ageStr.includes(search) ||
      idStr.includes(search);

    const matchDecision = decision === 'all' || decStr === decision.toLowerCase();
    const probPct = (Number(p.probability) || 0) * 100;
    const matchProb = probPct >= minProb && probPct <= maxProb;

    return matchSearch && matchDecision && matchProb;
  });

  filteredPredictions.sort((a, b) => {
    let av = a[sortCol];
    let bv = b[sortCol];
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av === undefined || av === null) av = '';
    if (bv === undefined || bv === null) bv = '';
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
}

function renderHistoryTable() {
  try {
    applyFiltersInternal();
    const body = document.getElementById('historyBody');
    const empty = document.getElementById('historyEmpty');
    const info = document.getElementById('tableInfo');

    if (!body) return;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredPredictions.slice(start, end);

    if (filteredPredictions.length === 0) {
      body.innerHTML = '';
      if (empty) empty.style.display = 'flex';
      if (info) info.textContent = 'No records match filter criteria';
    } else {
      if (empty) empty.style.display = 'none';
      if (info) {
        info.textContent = `Showing ${start + 1}–${Math.min(end, filteredPredictions.length)} of ${filteredPredictions.length} records`;
      }

      body.innerHTML = pageData.map(p => {
        const prob = Number(p.probability) || 0;
        const probPct = (prob * 100).toFixed(1);
        const pc = probClass(prob);
        const conf = Number(p.confidence) || 75;
        const dec = String(p.decision || 'NO').toUpperCase();
        const isYes = dec === 'YES';
        return `
          <tr>
            <td><strong style="color:var(--text)">#${p.id}</strong></td>
            <td style="white-space:nowrap;color:var(--text-muted);font-size:0.75rem">${p.timestamp}</td>
            <td>${p.age}</td>
            <td style="text-transform:capitalize">${p.job}</td>
            <td>€${Number(p.balance || 0).toLocaleString()}</td>
            <td>${p.duration}s</td>
            <td style="text-transform:capitalize">${p.education}</td>
            <td><span class="${isYes ? 'dec-yes' : 'dec-no'}">${isYes ? '✓ YES' : '✗ NO'}</span></td>
            <td><span class="prob-pill ${pc}">${probPct}%</span></td>
            <td>${conf.toFixed(1)}%</td>
            <td style="white-space:nowrap;display:flex;gap:6px;">
              <button class="tbl-btn tbl-btn-detail" onclick="showDetail(${p.id})">Detail</button>
              <button class="tbl-btn tbl-btn-del" onclick="deleteRow(${p.id})" title="Delete entry">✕</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    renderPagination();
  } catch (err) {
    console.error('Error rendering history table:', err);
  }
}
window.renderHistoryTable = renderHistoryTable;

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(filteredPredictions.length / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;

  const pgInfo = document.getElementById('pgInfo');
  if (pgInfo) pgInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  const pgPages = document.getElementById('pgPages');
  if (pgPages) {
    pgPages.innerHTML = '';
    let startP = Math.max(1, currentPage - 2);
    let endP = Math.min(totalPages, startP + 4);
    startP = Math.max(1, endP - 4);

    for (let i = startP; i <= endP; i++) {
      const btn = document.createElement('button');
      btn.className = `pg-btn${i === currentPage ? ' active' : ''}`;
      btn.textContent = i;
      btn.addEventListener('click', () => { currentPage = i; renderHistoryTable(); });
      pgPages.appendChild(btn);
    }
  }

  const pgFirst = document.getElementById('pgFirst');
  const pgPrev = document.getElementById('pgPrev');
  const pgNext = document.getElementById('pgNext');
  const pgLast = document.getElementById('pgLast');

  if (pgFirst) pgFirst.disabled = currentPage === 1;
  if (pgPrev) pgPrev.disabled = currentPage === 1;
  if (pgNext) pgNext.disabled = currentPage === totalPages;
  if (pgLast) pgLast.disabled = currentPage === totalPages;
}

// Pagination controls
const pgFirstBtn = document.getElementById('pgFirst');
if (pgFirstBtn) pgFirstBtn.addEventListener('click', () => { currentPage = 1; renderHistoryTable(); });

const pgPrevBtn = document.getElementById('pgPrev');
if (pgPrevBtn) pgPrevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderHistoryTable(); } });

const pgNextBtn = document.getElementById('pgNext');
if (pgNextBtn) pgNextBtn.addEventListener('click', () => {
  const tp = Math.ceil(filteredPredictions.length / pageSize);
  if (currentPage < tp) { currentPage++; renderHistoryTable(); }
});

const pgLastBtn = document.getElementById('pgLast');
if (pgLastBtn) pgLastBtn.addEventListener('click', () => {
  currentPage = Math.max(1, Math.ceil(filteredPredictions.length / pageSize));
  renderHistoryTable();
});

// Page size selector
const pageSizeSelect = document.getElementById('pageSizeSelect');
if (pageSizeSelect) {
  pageSizeSelect.addEventListener('change', (e) => {
    pageSize = parseInt(e.target.value) || 10;
    currentPage = 1;
    renderHistoryTable();
  });
}

// Filter inputs
['searchFilter', 'decisionFilter', 'minProbFilter', 'maxProbFilter'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => { currentPage = 1; renderHistoryTable(); });
});

const resetFiltersBtn = document.getElementById('resetFiltersBtn');
if (resetFiltersBtn) {
  resetFiltersBtn.addEventListener('click', () => {
    const s = document.getElementById('searchFilter');
    const d = document.getElementById('decisionFilter');
    const min = document.getElementById('minProbFilter');
    const max = document.getElementById('maxProbFilter');
    if (s) s.value = '';
    if (d) d.value = 'all';
    if (min) min.value = '';
    if (max) max.value = '';
    currentPage = 1;
    renderHistoryTable();
    showToast('Filters reset', 'info');
  });
}

// Column sort headers
document.querySelectorAll('th.sortable').forEach(th => {
  th.addEventListener('click', () => {
    const col = th.dataset.col;
    if (sortCol === col) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortCol = col;
      sortDir = 'asc';
    }
    document.querySelectorAll('th.sortable').forEach(t => t.classList.remove('sort-asc', 'sort-desc'));
    th.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
    currentPage = 1;
    renderHistoryTable();
  });
});

// ============================================================
// DELETE & CLEAR OPERATIONS
// ============================================================
function deleteRow(id) {
  allPredictions = allPredictions.filter(p => p.id !== id);
  saveToLocalStorage();
  updateHistoryBadge();
  updateDashboardKPIs();
  updateHistoryKPIs();
  renderHistoryTable();
  showToast('Record deleted successfully', 'info');
}
window.deleteRow = deleteRow;

const clearHistoryBtn = document.getElementById('clearHistoryBtn');
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener('click', () => {
    if (!confirm('Clear all prediction history? This will reset the table.')) return;
    allPredictions = [];
    nextId = 1;
    saveToLocalStorage();
    updateHistoryBadge();
    updateDashboardKPIs();
    updateHistoryKPIs();
    renderHistoryTable();
    showToast('All prediction records cleared', 'info');
  });
}

// ============================================================
// DETAIL MODAL
// ============================================================
function showDetail(id) {
  const p = allPredictions.find(x => x.id === id);
  if (!p) return;

  const modalTitle = document.getElementById('modalTitle');
  if (modalTitle) modalTitle.textContent = `Prediction Record #${p.id} — ${p.timestamp}`;

  const body = document.getElementById('modalBody');
  if (body) {
    const probPct = ((Number(p.probability) || 0) * 100).toFixed(1);
    const confPct = (Number(p.confidence) || 75).toFixed(1);
    const isYes = p.decision === 'YES';

    body.innerHTML = `
      <div style="margin-bottom:20px;">
        <div style="text-align:center;padding:20px;border-radius:12px;margin-bottom:16px;${isYes ? 'background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3)' : 'background:rgba(244,63,94,0.1);border:1px solid rgba(244,63,94,0.3)'}">
          <div style="font-size:2.2rem;margin-bottom:4px">${isYes ? '✓' : '✕'}</div>
          <div style="font-size:1.35rem;font-weight:900;color:${isYes ? 'var(--emerald-l)' : 'var(--rose-l)'}">${isYes ? 'WILL SUBSCRIBE' : 'WILL DECLINE'}</div>
          <div style="font-size:0.95rem;color:var(--text-sub);margin-top:6px">Propensity: <strong>${probPct}%</strong> · Model Confidence: <strong>${confPct}%</strong></div>
        </div>
        <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:14px;margin-bottom:16px;font-size:0.85rem;color:var(--text-sub)">
          💡 <strong style="color:var(--amber)">Strategic Recommendation:</strong> ${p.recommendation}
        </div>
      </div>
      <h4 style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted);margin-bottom:12px">Customer Profile Parameters</h4>
      <div class="modal-detail-grid">
        ${[
          ['Age', p.age], ['Occupation', p.job], ['Marital Status', p.marital], ['Education', p.education],
          ['Account Balance', `€${Number(p.balance || 0).toLocaleString()}`], ['Call Duration', `${p.duration}s`],
          ['Contact Channel', p.contact], ['Month', p.month], ['Previous Outcome', p.poutcome]
        ].map(([l, v]) => `
          <div class="modal-detail-item">
            <div class="mdi-label">${l}</div>
            <div class="mdi-val">${v}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) modalOverlay.classList.add('open');
}
window.showDetail = showDetail;

function closeModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) modalOverlay.classList.remove('open');
}
window.closeModal = closeModal;

const modalCloseBtn = document.getElementById('modalClose');
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

const modalOverlayEl = document.getElementById('modalOverlay');
if (modalOverlayEl) {
  modalOverlayEl.addEventListener('click', (e) => {
    if (e.target === modalOverlayEl) closeModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ============================================================
// CSV EXPORT
// ============================================================
const exportCsvBtn = document.getElementById('exportCsvBtn');
if (exportCsvBtn) {
  exportCsvBtn.addEventListener('click', () => {
    if (filteredPredictions.length === 0) {
      showToast('No records available to export', 'info');
      return;
    }
    const headers = ['ID', 'Timestamp', 'Age', 'Job', 'Marital', 'Education', 'Balance', 'Duration', 'Decision', 'Probability %', 'Confidence %', 'Recommendation'];
    const rows = filteredPredictions.map(p => [
      p.id,
      p.timestamp,
      p.age,
      p.job,
      p.marital,
      p.education,
      p.balance,
      p.duration,
      p.decision,
      ((Number(p.probability) || 0) * 100).toFixed(2),
      (Number(p.confidence) || 0).toFixed(2),
      `"${String(p.recommendation || '').replace(/"/g, '""')}"`
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurobank_predictions_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredPredictions.length} records as CSV`, 'success');
  });
}

// ============================================================
// SYSTEM BOOTSTRAP
// ============================================================
function bootstrap() {
  console.log('[NeuroBank AI] Initializing client system...');
  initHistory();
  checkBackendHealth();
  updateDashboardKPIs();
  updateHistoryKPIs();
  renderHistoryTable();
  loadAnalyticsData();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
