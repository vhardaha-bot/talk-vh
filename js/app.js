/* ════════════════════════════════════════
   TALK VH — js/app.js
   All logic: Modals, Bhadas burn, Payment
════════════════════════════════════════ */

'use strict';

/* ── CONFIG ── */
const CFG = {
  upiId:   'v.hardaha@oksbi',
  upiName: 'TalkVH',
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbzxhFL50AJsD0R9-VN0E-suTH-m1cQ20kL4evpNcJJf9A8PSSPSwpgT1sQMhFouTJ_n/exec'
};

/* ── DOM REFS — grabbed once on DOMContentLoaded ── */
let DOM = {};

document.addEventListener('DOMContentLoaded', () => {

  DOM = {
    /* Booking modal */
    bookingModal:  document.getElementById('bookingModal'),
    closeBooking:  document.getElementById('closeBooking'),
    bookingError:  document.getElementById('bookingError'),
    bName:         document.getElementById('bName'),
    bContact:      document.getElementById('bContact'),
    bTopic:        document.getElementById('bTopic'),
    bPlanName:     document.getElementById('bPlanName'),
    bPrice:        document.getElementById('bPrice'),
    payBtn:        document.getElementById('payBtn'),

    /* Free modal */
    freeModal:     document.getElementById('freeModal'),
    closeFree:     document.getElementById('closeFree'),
    freeError:     document.getElementById('freeError'),
    freeName:      document.getElementById('freeName'),
    freePhone:     document.getElementById('freePhone'),
    freeSubmitBtn: document.getElementById('freeSubmitBtn'),
    freeSuccess:   document.getElementById('freeSuccess'),

    /* Payment success screen */
    paySuccess:      document.getElementById('paySuccess'),
    closePaySuccess: document.getElementById('closePaySuccess'),

    /* Bhadas */
    bhadasText:    document.getElementById('bhadasText'),
    burnBtn:       document.getElementById('burnBtn'),
    bhadasDefault: document.getElementById('bhadasDefault'),
    bhadasSuccess: document.getElementById('bhadasSuccess'),
  };

  attachListeners();
  initPWA();
});

/* ════════════════════════════════════════
   ATTACH ALL EVENT LISTENERS
════════════════════════════════════════ */
function attachListeners() {

  /* Close booking modal */
  DOM.closeBooking.addEventListener('click', closeBookingModal);
  DOM.bookingModal.addEventListener('click', (e) => {
    if (e.target === DOM.bookingModal) closeBookingModal();
  });

  /* Pay button */
  DOM.payBtn.addEventListener('click', handlePayment);

  /* Close free modal */
  DOM.closeFree.addEventListener('click', closeFreeModal);
  DOM.freeModal.addEventListener('click', (e) => {
    if (e.target === DOM.freeModal) closeFreeModal();
  });

  /* Free submit */
  DOM.freeSubmitBtn.addEventListener('click', handleFreeSubmit);

  /* Phone number — digits only */
  DOM.freePhone.addEventListener('input', () => {
    DOM.freePhone.value = DOM.freePhone.value.replace(/\D/g, '').slice(0, 10);
  });

  /* Pay success close */
  DOM.closePaySuccess.addEventListener('click', () => {
    DOM.paySuccess.classList.add('hidden');
    document.body.style.overflow = '';
  });

  /* Burn button */
  DOM.burnBtn.addEventListener('click', handleBurn);

  /* ESC key closes any open modal */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeBookingModal();
      closeFreeModal();
    }
  });
}

/* ════════════════════════════════════════
   BOOKING MODAL
════════════════════════════════════════ */
function openBookingModal(planName, price) {
  DOM.bPlanName.textContent = planName;
  DOM.bPrice.textContent    = price;
  DOM.bookingError.style.display = 'none';
  DOM.bName.value    = '';
  DOM.bContact.value = '';
  DOM.bTopic.selectedIndex = 0;
  DOM.bookingModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => DOM.bName.focus(), 300);
}

function closeBookingModal() {
  DOM.bookingModal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ════════════════════════════════════════
   FREE TRIAL MODAL
════════════════════════════════════════ */
function openFreeModal() {
  DOM.freeError.style.display   = 'none';
  DOM.freeSuccess.classList.add('hidden');
  DOM.freeSubmitBtn.style.display = 'block';
  DOM.freeName.value  = '';
  DOM.freePhone.value = '';
  DOM.freeModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeFreeModal() {
  DOM.freeModal.classList.remove('open');
  document.body.style.overflow = '';
}

function handleFreeSubmit() {
  const name  = DOM.freeName.value.trim();
  const phone = DOM.freePhone.value.trim();

  if (!name || phone.length < 10) {
    DOM.freeError.style.display = 'block';
    return;
  }
  DOM.freeError.style.display = 'none';

  /* Send to Apps Script if configured */
  sendToSheet({ type: 'FREE_TRIAL', name, phone });

  /* Show success */
  DOM.freeSubmitBtn.style.display = 'none';
  DOM.freeSuccess.classList.remove('hidden');
}

/* ════════════════════════════════════════
   PAYMENT
════════════════════════════════════════ */
function handlePayment() {
  const name    = DOM.bName.value.trim();
  const contact = DOM.bContact.value.trim();
  const price   = DOM.bPrice.textContent;
  const plan    = DOM.bPlanName.textContent;
  const topic   = DOM.bTopic.value;

  if (!name) {
    DOM.bookingError.style.display = 'block';
    DOM.bookingError.textContent   = 'कृपया नाम लिखें!';
    DOM.bName.focus();
    return;
  }
  DOM.bookingError.style.display = 'none';

  /* Build UPI deep link */
  const note   = 'TalkVH_' + name.replace(/\s+/g, '_').slice(0, 18);
  const upiUrl = `upi://pay?pa=${CFG.upiId}&pn=${encodeURIComponent(CFG.upiName)}&am=${price}&cu=INR&tn=${encodeURIComponent(note)}`;

  closeBookingModal();

  /* Open UPI app */
  window.location.href = upiUrl;

  /* After 4s show success screen */
  setTimeout(() => {
    sendToSheet({ type: 'BOOKING', name, contact: contact || 'N/A', plan, amount: price, topic });
    showPaySuccess();
  }, 4000);
}

function showPaySuccess() {
  DOM.paySuccess.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

/* ════════════════════════════════════════
   BHADAS BURN 🔥
   Pure CSS + JS — no external libs
════════════════════════════════════════ */
function handleBurn() {
  const textarea = DOM.bhadasText;
  const text     = textarea.value.trim();

  /* Nothing typed — prompt gently */
  if (!text) {
    textarea.placeholder = 'पहले कुछ लिखो तो... 😄';
    textarea.focus();
    return;
  }

  /* Disable button immediately */
  DOM.burnBtn.disabled     = true;
  DOM.burnBtn.textContent  = '🔥 जल रहा है...';

  /* PHASE 1 (0ms) — Shake the textarea */
  textarea.classList.add('shake');

  /* PHASE 2 (450ms) — Text turns red, fades out */
  setTimeout(() => {
    textarea.classList.remove('shake');
    textarea.classList.add('burning');
  }, 450);

  /* PHASE 3 (1800ms) — Clear text silently */
  setTimeout(() => {
    textarea.value = '';
    textarea.style.opacity = '1';          /* reset inline opacity for next use */
    textarea.classList.remove('burning');
  }, 1800);

  /* PHASE 4 (2000ms) — Show success message */
  setTimeout(() => {
    DOM.bhadasDefault.classList.add('hidden');
    DOM.bhadasSuccess.classList.remove('hidden');
  }, 2000);
}

/* ════════════════════════════════════════
   APPS SCRIPT — SEND DATA
════════════════════════════════════════ */
function sendToSheet(data) {
  if (!CFG.appsScriptUrl) return;
  data.timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  fetch(CFG.appsScriptUrl, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data)
  }).catch(() => {/* silent fail */});
}

/* ════════════════════════════════════════
   PWA SERVICE WORKER
════════════════════════════════════════ */
function initPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(r => console.log('✅ SW registered', r.scope))
      .catch(e => console.log('SW error', e));
  }
}

/* ════════════════════════════════════════
   GLOBAL FUNCTIONS (called from HTML onclick)
════════════════════════════════════════ */
window.openBookingModal = openBookingModal;
window.openFreeModal    = openFreeModal;
