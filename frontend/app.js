/**
 * BankWise AI v2.2 — Bulletproof Application Controller
 * Handles client-side multi-page navigation, prediction CRUD,
 * table filtering/sorting/pagination, CSV export, and API communication.
 */

// ============================================================
// CONFIG & INITIAL STATE
// ============================================================
const API_URLS = ['http://127.0.0.1:5000', 'http://127.0.0.1:8000'];
let activeApi = API_URLS[0];
let apiOnline = false;

let allPredictions = [];
let filteredPredictions = [];
let currentPage = 1;
let pageSize = 10;
let sortCol = 'id';
let sortDir = 'desc';

// Pre-seeded bank predictions
const DUMMY_DATA = [
  { id: 1, timestamp: '2026-09-24 08:12', age: 42, job: 'management', marital: 'married', education: 'tertiary', balance: 6500, duration: 680, decision: 'YES', probability: 0.981, confidence: 98.1, recommendation: 'High-priority prospect. Contact immediately.', poutcome: 'success', contact: 'cellular', month: 'sep' },
  { id: 2, timestamp: '2026-09-24 09:03', age: 55, job: 'retired', marital: 'married', education: 'secondary', balance: 3200, duration: 512, decision: 'YES', probability: 0.871, confidence: 87.1, recommendation: 'High-priority prospect. Assign relationship manager.', poutcome: 'unknown', contact: 'cellular', month: 'oct' },
  { id: 3, timestamp: '2026-09-24 10:45', age: 27, job: 'blue-collar', marital: 'single', education: 'secondary', balance: 150, duration: 95, decision: 'NO', probability: 0.082, confidence: 91.8, recommendation: 'Low-probability lead. Avoid expensive telemarketing.', poutcome: 'failure', contact: 'telephone', month: 'may' },
  { id: 4, timestamp: '2026-09-24 11:20', age: 38, job: 'technician', marital: 'married', education: 'tertiary', balance: 4100, duration: 420, decision: 'YES', probability: 0.763, confidence: 76.3, recommendation: 'Moderate-priority prospect. Include in direct marketing.', poutcome: 'unknown', contact: 'cellular', month: 'mar' },
  { id: 5, timestamp: '2026-09-24 12:05', age: 61, job: 'retired', marital: 'divorced', education: 'primary', balance: 8900, duration: 730, decision: 'YES', probability: 0.944, confidence: 94.4, recommendation: 'High-priority prospect. Premium deposit products.', poutcome: 'success', contact: 'cellular', month: 'sep' },
  { id: 6, timestamp: '2026-09-24 13:30', age: 33, job: 'admin.', marital: 'single', education: 'tertiary', balance: 720, duration: 180, decision: 'NO', probability: 0.143, confidence: 85.7, recommendation: 'Low-probability lead. Consider email follow-up.', poutcome: 'failure', contact: 'telephone', month: 'jun' },
  { id: 7, timestamp: '2026-09-24 14:15', age: 48, job: 'entrepreneur', marital: 'married', education: 'tertiary', balance: 12000, duration: 580, decision: 'YES', probability: 0.888, confidence: 88.8, recommendation: 'High-priority prospect. Senior manager contact.', poutcome: 'success', contact: 'cellular', month: 'oct' },
  { id: 8, timestamp: '2026-09-24 15:00', age: 22, job: 'student', marital: 'single', education: 'tertiary', balance: -200, duration: 62, decision: 'NO', probability: 0.038, confidence: 96.2, recommendation: 'Low-probability lead. Minimal investment.', poutcome: 'unknown', contact: 'unknown', month: 'may' },
  { id: 9, timestamp: '2026-09-24 16:45', age: 44, job: 'services', marital: 'married', education: 'secondary', balance: 2800, duration: 370, decision: 'NO', probability: 0.312, confidence: 68.8, recommendation: 'Borderline candidate. Send digital email campaign.', poutcome: 'other', contact: 'cellular', month: 'aug' },
  { id: 10, timestamp: '2026-09-24 17:20', age: 57, job: 'management', marital: 'married', education: 'tertiary', balance: 15000, duration: 820, decision: 'YES', probability: 0.976, confidence: 97.6, recommendation: 'High-priority prospect. Immediate senior manager contact.', poutcome: 'success', contact: 'cellular', month: 'mar' },
  { id: 11, timestamp: '2026-09-24 18:10', age: 30, job: 'technician', marital: 'single', education: 'tertiary', balance: 1200, duration: 290, decision: 'NO', probability: 0.228, confidence: 77.2, recommendation: 'Borderline candidate. Follow-up email.', poutcome: 'failure', contact: 'cellular', month: 'nov' },
  { id: 12, timestamp: '2026-09-24 19:00', age: 52, job: 'self-employed', marital: 'married', education: 'secondary', balance: 6700, duration: 610, decision: 'YES', probability: 0.834, confidence: 83.4, recommendation: 'Moderate-priority prospect. Include in personalized marketing.', poutcome: 'unknown', contact: 'cellular', month: 'sep' },
];

let nextId = 13;

// ============================================================
// SANITIZE HELPER (Prevents undefined crashes on legacy/corrupt data)
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
  const icons = { success: '✅', error: '❌', info: '💬' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '💬'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3200);
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
  console.log('[BankWise Navigation] Navigating to page:', pageId);
  try {
    // 1. Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));

    // 2. Remove active state from all sidebar nav buttons
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(n => n.classList.remove('active'));

    // 3. Activate target page section
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
      targetPage.classList.add('active');
    } else {
      console.warn(`Target page "#page-${pageId}" not found in DOM`);
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
    } else if (pageId === 'dashboard') {
      updateDashboardKPIs();
    }
  } catch (err) {
    console.error('[BankWise Navigation Error]', err);
  }
}
// Expose globally so onclick="" always resolves
window.navigateTo = navigateTo;

// Universal click delegation for data-page attributes
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-page]');
  if (target && target.dataset.page) {
    e.preventDefault();
    navigateTo(target.dataset.page);
  }
});

// Sidebar collapse/mobile toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.querySelector('.main-content');
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
    showToast(isLight ? 'Switched to Light Mode' : 'Switched to Dark Mode', 'info');
  });
}

// Refresh Button
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.classList.add('spinning');
    await checkBackendHealth();
    setTimeout(() => refreshBtn.classList.remove('spinning'), 800);
    showToast('Dashboard refreshed', 'success');
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
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        activeApi = url;
        apiOnline = true;
        if (statusDot) statusDot.className = 'status-dot online';
        if (statusText) statusText.textContent = `API: Online (${data.framework || 'Flask'})`;
        connected = true;
        loadAnalyticsData();
        break;
      }
    } catch { /* try next */ }
  }

  if (!connected) {
    apiOnline = false;
    if (statusDot) statusDot.className = 'status-dot offline';
    if (statusText) statusText.textContent = 'API: Standalone';
  }
}

async function loadAnalyticsData() {
  try {
    const res = await fetch(`${activeApi}/api/analytics`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.feature_importance && data.feature_importance.length > 0) {
      renderFeatureImportance(data.feature_importance);
    }
  } catch { /* use existing HTML values */ }
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
    row.className = 'feat-bar-row';
    row.innerHTML = `
      <div class="feat-bar-meta"><span>${label}</span><span>${pct}%</span></div>
      <div class="feat-bar-track"><div class="feat-bar-fill" style="width:0%"></div></div>
    `;
    list.appendChild(row);
    setTimeout(() => {
      const bar = row.querySelector('.feat-bar-fill');
      if (bar) bar.style.width = `${pct}%`;
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
    showToast('Form cleared', 'info');
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
// PREDICTION FORM SUBMISSION
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

    try {
      const res = await fetch(`${activeApi}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || `Server returned ${res.status}`);
      }

      const data = await res.json();
      renderResult(data, payload);
      saveToHistory(data, payload);
      showToast(`Prediction: ${data.prediction_label}`, data.prediction === 1 ? 'success' : 'info');

    } catch (err) {
      if (loadingState) loadingState.style.display = 'none';
      if (errorBox) errorBox.style.display = 'flex';
      const errTitle = document.getElementById('errorTitle');
      const errMsg = document.getElementById('errorMessage');
      if (errTitle) errTitle.textContent = 'Prediction Request Failed';
      if (errMsg) errMsg.textContent = err.message || 'Could not connect to backend prediction model.';
      showToast('Error: ' + (err.message || 'Prediction failed'), 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (submitText) submitText.textContent = 'Predict Subscription';
    }
  });
}

function renderResult(data, payload) {
  const loadingState = document.getElementById('loadingState');
  const resultContent = document.getElementById('resultContent');
  if (loadingState) loadingState.style.display = 'none';
  if (resultContent) resultContent.style.display = 'block';

  const yes = data.prediction === 1;
  const prob = Number(data.subscription_probability) || 0;
  const probPct = (prob * 100).toFixed(1);
  const conf = Number(data.confidence_score) || 75;

  const decisionEl = document.getElementById('resultDecision');
  if (decisionEl) decisionEl.className = `result-decision ${yes ? 'yes' : 'no'}`;

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
    setTimeout(() => { fill.style.width = `${probPct}%`; }, 100);
    fill.style.background = yes
      ? 'linear-gradient(90deg, #10b981, #34d399)'
      : 'linear-gradient(90deg, #f43f5e, #fb7185)';
  }

  const recText = document.getElementById('recommendationText');
  if (recText) recText.textContent = data.recommendation || 'Proceed with normal marketing protocols.';
}

// ============================================================
// HISTORY CRUD & LOCALSTORAGE
// ============================================================
function initHistory() {
  try {
    const saved = localStorage.getItem('bankwise_history');
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
    localStorage.setItem('bankwise_history', JSON.stringify(allPredictions));
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
}

function updateHistoryBadge() {
  const badge = document.getElementById('history-count-badge');
  if (badge) badge.textContent = allPredictions.length;
}

// ============================================================
// DASHBOARD KPIS & RECENT LIST
// ============================================================
function updateDashboardKPIs() {
  try {
    const total = allPredictions.length;
    const yes = allPredictions.filter(p => p.decision === 'YES').length;
    const no = total - yes;
    const rate = total > 0 ? Math.round((yes / total) * 100) : 0;

    const kpiTotal = document.getElementById('kpi-total');
    const kpiYes = document.getElementById('kpi-yes');
    const kpiNo = document.getElementById('kpi-no');
    const kpiRate = document.getElementById('kpi-rate');

    if (kpiTotal) kpiTotal.textContent = total;
    if (kpiYes) kpiYes.textContent = yes;
    if (kpiNo) kpiNo.textContent = no;
    if (kpiRate) kpiRate.textContent = `${rate}%`;

    renderRecentPredictions();
  } catch (err) {
    console.error('Error in updateDashboardKPIs:', err);
  }
}

function renderRecentPredictions() {
  const container = document.getElementById('recentPredictions');
  if (!container) return;

  const recent = allPredictions.slice(0, 5);
  if (recent.length === 0) {
    container.innerHTML = `<div class="empty-placeholder"><p>No predictions yet. <button class="link-btn" onclick="navigateTo('predict')">Make your first prediction →</button></p></div>`;
    return;
  }

  container.innerHTML = recent.map(p => `
    <div class="recent-row">
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
      if (info) info.textContent = 'No records match filters';
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
        return `
          <tr>
            <td><strong>#${p.id}</strong></td>
            <td style="white-space:nowrap;color:var(--text-muted);font-size:0.78rem">${p.timestamp}</td>
            <td>${p.age}</td>
            <td style="text-transform:capitalize">${p.job}</td>
            <td>€${Number(p.balance || 0).toLocaleString()}</td>
            <td>${p.duration}s</td>
            <td><span class="badge-${dec.toLowerCase()}">${dec === 'YES' ? '✓ YES' : '✗ NO'}</span></td>
            <td><span class="prob-pill ${pc}">${probPct}%</span></td>
            <td>${conf.toFixed(1)}%</td>
            <td style="white-space:nowrap;display:flex;gap:6px;">
              <button class="tbl-action-btn" onclick="showDetail(${p.id})">Details</button>
              <button class="tbl-del-btn" onclick="deleteRow(${p.id})">✕</button>
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
    let startP = Math.max(1, currentPage - 3);
    let endP = Math.min(totalPages, startP + 6);
    startP = Math.max(1, endP - 6);

    for (let i = startP; i <= endP; i++) {
      const btn = document.createElement('button');
      btn.className = `pg-num${i === currentPage ? ' active' : ''}`;
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

// Page size change
const pageSizeSelect = document.getElementById('pageSizeSelect');
if (pageSizeSelect) {
  pageSizeSelect.addEventListener('change', (e) => {
    pageSize = parseInt(e.target.value) || 10;
    currentPage = 1;
    renderHistoryTable();
  });
}

// Filter listeners
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
  renderHistoryTable();
  showToast('Prediction record removed', 'info');
}
window.deleteRow = deleteRow;

const clearHistoryBtn = document.getElementById('clearHistoryBtn');
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener('click', () => {
    if (!confirm('Clear all prediction history? This will restore initial seed state.')) return;
    allPredictions = [];
    nextId = 1;
    saveToLocalStorage();
    updateHistoryBadge();
    updateDashboardKPIs();
    renderHistoryTable();
    showToast('History cleared', 'info');
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
          <div style="font-size:2.2rem;margin-bottom:4px">${isYes ? '✅' : '❌'}</div>
          <div style="font-size:1.35rem;font-weight:900">${isYes ? 'WILL SUBSCRIBE' : 'WILL DECLINE'}</div>
          <div style="font-size:0.95rem;color:var(--text-sub);margin-top:6px">Propensity: <strong>${probPct}%</strong> · Model Confidence: <strong>${confPct}%</strong></div>
        </div>
        <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:14px;margin-bottom:16px;font-size:0.85rem;color:var(--text-sub)">
          💡 <strong style="color:var(--amber)">Strategic Recommendation:</strong> ${p.recommendation}
        </div>
      </div>
      <h4 style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted);margin-bottom:12px">Customer Profile Parameters</h4>
      <div class="modal-detail-grid">
        ${[
          ['Age', p.age], ['Occupation', p.job], ['Marital Status', p.marital], ['Education', p.education],
          ['Account Balance', `€${Number(p.balance || 0).toLocaleString()}`], ['Call Duration', `${p.duration}s`],
          ['Contact Channel', p.contact], ['Month', p.month], ['Previous Outcome', p.poutcome]
        ].map(([l, v]) => `
          <div class="modal-detail-item">
            <div class="mdi-label">${l}</div>
            <div class="mdi-val" style="text-transform:capitalize">${v}</div>
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

// ============================================================
// CSV EXPORT
// ============================================================
const exportCsvBtn = document.getElementById('exportCsvBtn');
if (exportCsvBtn) {
  exportCsvBtn.addEventListener('click', () => {
    if (filteredPredictions.length === 0) {
      showToast('No records to export', 'info');
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
    a.download = `bankwise_predictions_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredPredictions.length} records as CSV`, 'success');
  });
}

// ============================================================
// SYSTEM BOOTSTRAP
// ============================================================
function bootstrap() {
  console.log('[BankWise AI] Bootstrapping UI system...');
  initHistory();
  checkBackendHealth();
  updateDashboardKPIs();
  renderHistoryTable();
  loadAnalyticsData();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
