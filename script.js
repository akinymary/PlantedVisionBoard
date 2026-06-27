/* =====================================================
   THE PLANTED WOMAN – VISION GARDEN
   script.js
   Vanilla JS — no frameworks
   LocalStorage persistence, share, gallery, progress
   ===================================================== */

'use strict';

/* ---- DATA ---- */

const CATEGORIES = [
  { id: 'faith',          emoji: '🙏', title: 'Faith',          placeholder: 'How do you want your faith to grow this year?' },
  { id: 'family',         emoji: '👨‍👩‍👧', title: 'Family',         placeholder: 'What do you believe God for in your family?' },
  { id: 'career',         emoji: '💼', title: 'Career',         placeholder: 'What doors do you trust God to open professionally?' },
  { id: 'finances',       emoji: '💛', title: 'Finances',       placeholder: 'What financial breakthroughs are you believing for?' },
  { id: 'ministry',       emoji: '✝️',  title: 'Ministry',       placeholder: 'How is God calling you to serve and impact others?' },
  { id: 'health',         emoji: '🌿', title: 'Health',         placeholder: 'What does healing and wholeness look like for you?' },
  { id: 'education',      emoji: '📚', title: 'Education',      placeholder: 'What are you believing God to teach or open for you?' },
  { id: 'travel',         emoji: '✈️',  title: 'Travel',         placeholder: 'Where is God sending you — physically or in spirit?' },
  { id: 'marriage',       emoji: '💍', title: 'Marriage',       placeholder: 'What are you trusting God for in your marriage or future union?' },
  { id: 'business',       emoji: '🌸', title: 'Business',       placeholder: 'What dreams is God stirring in your entrepreneurial heart?' },
  { id: 'home',           emoji: '🏡', title: 'Home',           placeholder: 'What kind of home and haven are you believing God to build?' },
  { id: 'personalGrowth', emoji: '🌱', title: 'Personal Growth', placeholder: 'Who is God calling you to become this year?' },
];

const SCRIPTURES = [
  {
    ref: 'Habakkuk 2:2',
    text: 'Write the vision and make it plain on tablets, that he may run who reads it.',
  },
  {
    ref: 'Jeremiah 17:7–8',
    text: 'Blessed is the man who trusts in the Lord, whose trust is the Lord. He is like a tree planted by water, that sends out its roots by the stream.',
  },
  {
    ref: 'Psalm 1:3',
    text: 'He is like a tree planted by streams of water that yields its fruit in its season, and its leaf does not wither. In all that he does, he prospers.',
  },
  {
    ref: 'Matthew 6:33',
    text: 'But seek first the kingdom of God and his righteousness, and all these things will be added to you.',
  },
  {
    ref: 'Proverbs 16:3',
    text: 'Commit your work to the Lord, and your plans will be established.',
  },
  {
    ref: 'Psalm 37:5',
    text: 'Commit your way to the Lord; trust in him, and he will act.',
  },
];

const STORAGE_KEYS = {
  word:       'tpw_word',
  scripture:  'tpw_scripture',
  categories: 'tpw_categories',
  prayer:     'tpw_prayer',
  declaration:'tpw_declaration',
  gallery:    'tpw_gallery',
};

const PROGRESS_MESSAGES = [
  '0% complete — Begin planting your vision 🌱',
  'Seeds planted — keep going! 🌱',
  'Your garden is taking root 🌿',
  'Beautiful growth is happening! 🌸',
  'Your vision is blooming 🌸✨',
  'Nearly flourishing — you\'re almost there! 🌳',
  'Your garden is in full bloom! 🌳✦',
];

/* ---- INIT ---- */

document.addEventListener('DOMContentLoaded', () => {
  buildCategories();
  buildScriptureGarden();
  loadSavedData();
  initAutoSave();
  initProgress();
  initGallery();
  initShare();
  initScrollReveal();
  initCelebration();
});

/* ---- BUILD CATEGORIES ---- */

function buildCategories() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;

  CATEGORIES.forEach(cat => {
    const card = document.createElement('article');
    card.className = 'category-card reveal';
    card.setAttribute('aria-label', `${cat.title} vision`);

    card.innerHTML = `
      <div class="category-header">
        <span class="category-emoji" aria-hidden="true">${cat.emoji}</span>
        <h3 class="category-title">${cat.title}</h3>
      </div>
      <textarea
        id="cat_${cat.id}"
        class="category-textarea"
        placeholder="${cat.placeholder}"
        rows="4"
        aria-label="${cat.title} — your vision"
      ></textarea>
    `;
    grid.appendChild(card);
  });
}

/* ---- BUILD SCRIPTURE GARDEN ---- */

function buildScriptureGarden() {
  const grid = document.getElementById('scriptureGrid');
  if (!grid) return;

  SCRIPTURES.forEach(s => {
    const card = document.createElement('div');
    card.className = 'scripture-card reveal';
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `Scripture: ${s.ref}`);

    card.innerHTML = `
      <p class="scripture-card-ref">${s.ref}</p>
      <p class="scripture-card-text">"${s.text}"</p>
    `;
    grid.appendChild(card);
  });
}

/* ---- LOAD / SAVE DATA ---- */

function loadSavedData() {
  // Word of year
  const wordEl = document.getElementById('wordOfYear');
  if (wordEl) wordEl.value = load(STORAGE_KEYS.word) || '';

  // Theme scripture
  const scriptEl = document.getElementById('themeScripture');
  if (scriptEl) scriptEl.value = load(STORAGE_KEYS.scripture) || '';

  // Categories
  const savedCats = loadJSON(STORAGE_KEYS.categories) || {};
  CATEGORIES.forEach(cat => {
    const el = document.getElementById(`cat_${cat.id}`);
    if (el && savedCats[cat.id]) el.value = savedCats[cat.id];
  });

  // Prayer journal
  const prayerEl = document.getElementById('prayerJournal');
  if (prayerEl) prayerEl.value = load(STORAGE_KEYS.prayer) || '';

  // Declaration
  const declEl = document.getElementById('declaration');
  if (declEl) {
    const saved = load(STORAGE_KEYS.declaration);
    if (saved) declEl.value = saved;
  }

  // Gallery
  loadGallery();
}

function initAutoSave() {
  // Word
  attachAutoSave('wordOfYear', STORAGE_KEYS.word);
  // Scripture
  attachAutoSave('themeScripture', STORAGE_KEYS.scripture);
  // Declaration
  attachAutoSave('declaration', STORAGE_KEYS.declaration);

  // Category textareas (debounced)
  CATEGORIES.forEach(cat => {
    const el = document.getElementById(`cat_${cat.id}`);
    if (!el) return;
    el.addEventListener('input', debounce(() => {
      const savedCats = loadJSON(STORAGE_KEYS.categories) || {};
      savedCats[cat.id] = el.value;
      saveJSON(STORAGE_KEYS.categories, savedCats);
      updateProgress();
    }, 500));
  });

  // Prayer — manual save button
  const saveBtn = document.getElementById('savePrayer');
  const confirmEl = document.getElementById('saveConfirm');
  const prayerEl = document.getElementById('prayerJournal');

  if (saveBtn && prayerEl) {
    saveBtn.addEventListener('click', () => {
      save(STORAGE_KEYS.prayer, prayerEl.value);
      if (confirmEl) {
        confirmEl.textContent = '✦ Saved with love';
        setTimeout(() => { confirmEl.textContent = ''; }, 2500);
      }
    });
  }

  // Auto-save prayer on input too
  if (prayerEl) {
    prayerEl.addEventListener('input', debounce(() => {
      save(STORAGE_KEYS.prayer, prayerEl.value);
      updateProgress();
    }, 800));
  }
}

function attachAutoSave(id, key) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', debounce(() => {
    save(key, el.value);
    updateProgress();
  }, 500));
}

/* ---- PROGRESS ---- */

let progressShown = false;

function initProgress() {
  updateProgress();
}

function updateProgress() {
  const fields = getFilledFieldCount();
  const total  = getTotalFieldCount();
  const pct    = total > 0 ? Math.round((fields / total) * 100) : 0;

  const bar   = document.getElementById('progressBar');
  const wrap  = document.getElementById('progressBarWrap');
  const label = document.getElementById('progressLabel');

  if (bar)   bar.style.width = pct + '%';
  if (wrap)  wrap.setAttribute('aria-valuenow', pct);
  if (label) label.textContent = getProgressMessage(pct);

  // Update growth stage
  updateGrowthStage(pct);

  // Celebration
  if (pct >= 100 && !progressShown) {
    progressShown = true;
    setTimeout(showCelebration, 600);
  }
}

function getFilledFieldCount() {
  let count = 0;

  const word  = document.getElementById('wordOfYear');
  const scrip = document.getElementById('themeScripture');
  const pray  = document.getElementById('prayerJournal');
  const decl  = document.getElementById('declaration');

  if (word  && word.value.trim())  count++;
  if (scrip && scrip.value.trim()) count++;
  if (pray  && pray.value.trim())  count++;
  if (decl  && decl.value.trim())  count++;

  CATEGORIES.forEach(cat => {
    const el = document.getElementById(`cat_${cat.id}`);
    if (el && el.value.trim()) count++;
  });

  return count;
}

function getTotalFieldCount() {
  return 4 + CATEGORIES.length; // 4 main + 12 categories = 16
}

function getProgressMessage(pct) {
  if (pct === 0)   return PROGRESS_MESSAGES[0];
  if (pct < 25)    return PROGRESS_MESSAGES[1];
  if (pct < 50)    return PROGRESS_MESSAGES[2];
  if (pct < 70)    return PROGRESS_MESSAGES[3];
  if (pct < 90)    return PROGRESS_MESSAGES[4];
  if (pct < 100)   return PROGRESS_MESSAGES[5];
  return PROGRESS_MESSAGES[6];
}

function updateGrowthStage(pct) {
  const stages = ['seed', 'growing', 'blooming', 'flourishing'];
  const stageEls = stages.map(s => document.getElementById(`stage-${s}`));

  stageEls.forEach(el => el && el.classList.remove('active'));

  if (pct >= 100)     stageEls[3] && stageEls[3].classList.add('active');
  else if (pct >= 60) stageEls[2] && stageEls[2].classList.add('active');
  else if (pct >= 25) stageEls[1] && stageEls[1].classList.add('active');
  else                stageEls[0] && stageEls[0].classList.add('active');
}

/* ---- GALLERY ---- */

let galleryImages = []; // array of base64 strings or object URLs

function initGallery() {
  const uploadInput = document.getElementById('imageUpload');
  const uploadZone  = document.getElementById('uploadZone');

  if (!uploadInput) return;

  uploadInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => readImageFile(file));
    uploadInput.value = ''; // reset so same file can be re-added
  });

  // Allow keyboard activation of upload zone
  if (uploadZone) {
    uploadZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        uploadInput.click();
      }
    });
  }
}

function readImageFile(file) {
  if (!file.type.match(/image\/(jpeg|png|webp)/)) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    galleryImages.push(dataUrl);
    saveGallery();
    renderGallery();
  };
  reader.readAsDataURL(file);
}

function loadGallery() {
  const saved = loadJSON(STORAGE_KEYS.gallery);
  if (Array.isArray(saved)) {
    galleryImages = saved;
    renderGallery();
  }
}

function saveGallery() {
  // Only store up to 20 images to keep localStorage usage reasonable
  if (galleryImages.length > 20) galleryImages = galleryImages.slice(-20);
  try {
    saveJSON(STORAGE_KEYS.gallery, galleryImages);
  } catch (e) {
    // LocalStorage quota exceeded — trim and try again
    galleryImages = galleryImages.slice(-5);
    try { saveJSON(STORAGE_KEYS.gallery, galleryImages); } catch (_) {}
  }
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  grid.innerHTML = '';

  galleryImages.forEach((src, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';

    const img = document.createElement('img');
    img.src = src;
    img.alt = `Vision board image ${index + 1}`;
    img.loading = 'lazy';

    const del = document.createElement('button');
    del.className = 'gallery-delete';
    del.setAttribute('aria-label', `Remove image ${index + 1}`);
    del.innerHTML = '✕';
    del.addEventListener('click', () => {
      galleryImages.splice(index, 1);
      saveGallery();
      renderGallery();
    });

    item.appendChild(img);
    item.appendChild(del);
    grid.appendChild(item);
  });
}

/* ---- SHARE ---- */

function initShare() {
  const btn = document.getElementById('shareBtn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const shareData = {
      title: 'The Planted Woman – My Vision Garden',
      text:  'I\'m planting seeds of vision and faith this year. Join me! 🌸',
      url:   window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        if (e.name !== 'AbortError') fallbackCopy(shareData.url);
      }
    } else {
      fallbackCopy(shareData.url);
    }
  });
}

function fallbackCopy(url) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => showToast('Link copied! 🌸'));
  } else {
    // Legacy copy
    const el = document.createElement('textarea');
    el.value = url;
    el.style.position = 'fixed';
    el.style.opacity  = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast('Link copied! 🌸');
  }
}

function showToast(msg) {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = msg;

  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '1.5rem',
    left:         '50%',
    transform:    'translateX(-50%)',
    background:   '#6B3FA0',
    color:        '#fff',
    padding:      '0.65rem 1.4rem',
    borderRadius: '50px',
    fontSize:     '0.85rem',
    fontFamily:   'Poppins, sans-serif',
    fontWeight:   '500',
    zIndex:       '9999',
    boxShadow:    '0 4px 20px rgba(107,63,160,0.35)',
    animation:    'fadeSlideUp 0.3s ease',
  });

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ---- CELEBRATION ---- */

function initCelebration() {
  const closeBtn = document.getElementById('closeCelebration');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const overlay = document.getElementById('celebrationOverlay');
      if (overlay) overlay.style.display = 'none';
    });
  }
}

function showCelebration() {
  const overlay = document.getElementById('celebrationOverlay');
  if (!overlay) return;

  overlay.style.display = 'flex';
  launchConfetti();
}

function launchConfetti() {
  const container = document.getElementById('confettiContainer');
  if (!container) return;

  const colors = ['#D4AF37', '#8F5CCB', '#6B3FA0', '#F4EEFF', '#FFFFFF', '#F0D060'];

  for (let i = 0; i < 55; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';

    const color = colors[Math.floor(Math.random() * colors.length)];
    const left  = Math.random() * 100;
    const delay = Math.random() * 1.5;
    const dur   = 2.5 + Math.random() * 2;
    const size  = 6 + Math.random() * 8;

    Object.assign(piece.style, {
      left:            left + '%',
      top:             '-20px',
      width:           size + 'px',
      height:          size + 'px',
      background:      color,
      animationDuration:  dur + 's',
      animationDelay:  delay + 's',
      borderRadius:    Math.random() > 0.5 ? '50%' : '2px',
    });

    container.appendChild(piece);
  }
}

/* ---- SCROLL REVEAL ---- */

function initScrollReveal() {
  // Add reveal class to sections and cards
  document.querySelectorAll('.garden-section').forEach(el => {
    el.classList.add('reveal');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ---- LOCAL STORAGE HELPERS ---- */

function save(key, value) {
  try { localStorage.setItem(key, value); } catch (_) {}
}

function load(key) {
  try { return localStorage.getItem(key); } catch (_) { return null; }
}

function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { throw e; }
}

function loadJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

/* ---- UTILS ---- */

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ---- PDF GENERATION ---- */

function initPdf() {
  const generateBtn = document.getElementById('generatePdfBtn');
  const downloadBtn = document.getElementById('downloadPdfBtn');
  const overlay     = document.getElementById('pdfOverlay');
  const closeBtn1   = document.getElementById('closePdfOverlay');
  const closeBtn2   = document.getElementById('closePdfOverlay2');

  if (!generateBtn) return;

  generateBtn.addEventListener('click', () => {
    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ Building your PDF…';
    // Small timeout so button state renders before heavy PDF work
    setTimeout(() => {
      try {
        buildPdf();
        overlay.style.display = 'flex';
      } catch (e) {
        showToast('Could not generate PDF. Please try again.');
        console.error(e);
      }
      generateBtn.disabled = false;
      generateBtn.innerHTML = '🌸 Generate PDF';
    }, 80);
  });

  if (downloadBtn) downloadBtn.addEventListener('click', () => buildAndDownloadPdf());

  [closeBtn1, closeBtn2].forEach(btn => {
    if (btn) btn.addEventListener('click', () => { overlay.style.display = 'none'; });
  });

  overlay && overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.style.display = 'none';
  });
}

// Collect all user data into a plain object
function collectUserData() {
  const cats = loadJSON(STORAGE_KEYS.categories) || {};

  return {
    word:       (document.getElementById('wordOfYear')?.value   || '').trim(),
    scripture:  (document.getElementById('themeScripture')?.value || '').trim(),
    prayer:     (document.getElementById('prayerJournal')?.value  || '').trim(),
    declaration:(document.getElementById('declaration')?.value    || '').trim(),
    categories: CATEGORIES.map(cat => ({
      emoji: cat.emoji,
      title: cat.title,
      value: (cats[cat.id] || document.getElementById(`cat_${cat.id}`)?.value || '').trim(),
    })),
    progress: getFilledFieldCount(),
    total:    getTotalFieldCount(),
    date:     new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }),
  };
}

// Build and open PDF (returns jsPDF doc)
function buildPdf() {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) { showToast('PDF library not loaded yet. Please wait a moment and try again.'); return; }

  const doc  = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const data = collectUserData();

  const W    = 210; // page width mm
  const H    = 297; // page height mm
  const ML   = 18;  // left margin
  const MR   = 18;  // right margin
  const CW   = W - ML - MR; // content width
  const PURPLE = [107, 63, 160];
  const GOLD   = [212, 175, 55];
  const CREAM  = [255, 253, 248];
  const WHITE  = [255, 255, 255];
  const DARK   = [45, 27, 78];
  const MID    = [90, 64, 112];

  let y = 0; // current Y cursor

  /* ---- helper: new page ---- */
  function newPage() {
    doc.addPage();
    y = 18;
    // Subtle header bar on new pages
    doc.setFillColor(...PURPLE);
    doc.rect(0, 0, W, 8, 'F');
    doc.setFillColor(...GOLD);
    doc.rect(0, 8, W, 1.2, 'F');
    y = 18;
  }

  /* ---- helper: check page space ---- */
  function checkY(needed = 20) {
    if (y + needed > H - 20) newPage();
  }

  /* ---- helper: wrapped text, returns new y ---- */
  function wrappedText(text, x, startY, maxWidth, lineHeight = 6) {
    const lines = doc.splitTextToSize(text || '—', maxWidth);
    doc.text(lines, x, startY);
    return startY + lines.length * lineHeight;
  }

  /* ---- helper: section heading ---- */
  function sectionHeading(title, icon = '') {
    checkY(22);
    y += 4;
    // Gold accent line
    doc.setFillColor(...GOLD);
    doc.rect(ML, y, 3, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...PURPLE);
    doc.text(`${icon}  ${title}`, ML + 7, y + 7.5);
    y += 16;
  }

  /* ---- helper: body label + value ---- */
  function labelValue(label, value, maxW = CW) {
    checkY(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...GOLD);
    doc.text(label.toUpperCase(), ML, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    y = wrappedText(value || '(not filled in)', ML, y, maxW, 5.5);
    y += 4;
  }

  /* ===== PAGE 1: COVER ===== */
  // Deep purple background
  doc.setFillColor(...PURPLE);
  doc.rect(0, 0, W, H, 'F');

  // Gold decorative bars
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, W, 3, 'F');
  doc.rect(0, H - 3, W, 3, 'F');

  // Floral decorative circles (subtle)
  doc.setFillColor(143, 92, 203);
  doc.circle(W - 30, 40, 50, 'F');
  doc.circle(20, H - 40, 40, 'F');

  // Logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...GOLD);
  doc.text('THE PLANTED WOMAN', W / 2, 55, { align: 'center' });

  // Gold divider
  doc.setFillColor(...GOLD);
  doc.rect(ML + 20, 62, CW - 40, 0.8, 'F');

  // Main title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(...WHITE);
  doc.text('My Vision', W / 2, 100, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(38);
  doc.setTextColor(240, 208, 96);
  doc.text('Garden', W / 2, 118, { align: 'center' });

  // Flowers row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(22);
  doc.setTextColor(...WHITE);
  doc.text('🌸  🌿  ✦  🌿  🌸', W / 2, 140, { align: 'center' });

  // Scripture
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(220, 200, 255);
  const habLines = doc.splitTextToSize('"Write the vision and make it plain on tablets, that he may run who reads it."', CW - 20);
  doc.text(habLines, W / 2, 162, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text('— Habakkuk 2:2', W / 2, 162 + habLines.length * 6 + 2, { align: 'center' });

  // Word of year highlight
  if (data.word) {
    doc.setFillColor(255, 255, 255, 0.08);
    doc.setDrawColor(...GOLD);
    doc.roundedRect(ML + 15, 192, CW - 30, 28, 4, 4, 'D');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...GOLD);
    doc.text('MY WORD FOR THE YEAR', W / 2, 202, { align: 'center' });
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(22);
    doc.setTextColor(...WHITE);
    doc.text(data.word, W / 2, 214, { align: 'center' });
  }

  // Progress badge
  const pct = Math.round((data.progress / data.total) * 100);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(200, 180, 255);
  doc.text(`Garden Progress: ${pct}% Complete`, W / 2, 240, { align: 'center' });

  // Date & footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 150, 255);
  doc.text(`Prepared on ${data.date}`, W / 2, H - 16, { align: 'center' });

  /* ===== PAGE 2: WORD + SCRIPTURE + DECLARATION ===== */
  newPage();

  // Cream background for content pages
  doc.setFillColor(...CREAM);
  doc.rect(0, 8, W, H, 'F');
  // Re-draw header bar on top
  doc.setFillColor(...PURPLE);
  doc.rect(0, 0, W, 8, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 8, W, 1.2, 'F');

  y = 22;

  // Page title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text('THE PLANTED WOMAN  ✦  MY VISION GARDEN', W / 2, y, { align: 'center' });
  y += 12;

  sectionHeading('Word for the Year', '🌱');
  if (data.word) {
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(28);
    doc.setTextColor(...PURPLE);
    checkY(20);
    doc.text(data.word, ML + 3, y);
    y += 14;
  } else {
    labelValue('', '(not filled in)');
  }

  sectionHeading('Theme Scripture', '✦');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(...MID);
  checkY(20);
  y = wrappedText(data.scripture || '(not filled in)', ML + 3, y, CW - 6, 6);
  y += 6;

  sectionHeading('My Declaration', '🌿');
  // Gold-bordered box
  checkY(50);
  const declLines = doc.splitTextToSize(data.declaration || '(not filled in)', CW - 12);
  const boxH = declLines.length * 6 + 14;
  doc.setFillColor(244, 238, 255);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.roundedRect(ML, y, CW, boxH, 4, 4, 'FD');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(...PURPLE);
  doc.text(declLines, ML + 6, y + 9);
  y += boxH + 8;

  /* ===== PAGE 3+: VISION CATEGORIES ===== */
  newPage();
  doc.setFillColor(...CREAM);
  doc.rect(0, 8, W, H, 'F');
  doc.setFillColor(...PURPLE);
  doc.rect(0, 0, W, 8, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 8, W, 1.2, 'F');

  y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text('THE PLANTED WOMAN  ✦  VISION CATEGORIES', W / 2, y, { align: 'center' });
  y += 12;

  sectionHeading('Vision Categories', '🌸');

  data.categories.forEach(cat => {
    if (!cat.value) return; // skip empty categories

    checkY(28);

    // Category pill header
    doc.setFillColor(...PURPLE);
    doc.roundedRect(ML, y, CW, 9, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...WHITE);
    doc.text(`${cat.emoji}  ${cat.title.toUpperCase()}`, ML + 5, y + 6.2);
    y += 12;

    // Value
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    checkY(10);
    y = wrappedText(cat.value, ML + 3, y, CW - 6, 5.5);
    y += 5;
  });

  /* ===== PRAYER JOURNAL PAGE ===== */
  if (data.prayer) {
    newPage();
    doc.setFillColor(...CREAM);
    doc.rect(0, 8, W, H, 'F');
    doc.setFillColor(...PURPLE);
    doc.rect(0, 0, W, 8, 'F');
    doc.setFillColor(...GOLD);
    doc.rect(0, 8, W, 1.2, 'F');

    y = 22;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.text('THE PLANTED WOMAN  ✦  PRAYER JOURNAL', W / 2, y, { align: 'center' });
    y += 12;

    sectionHeading('Prayer Journal', '🕊️');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(...MID);
    checkY(20);
    y = wrappedText(data.prayer, ML + 3, y, CW - 6, 5.5);
  }

  /* ===== CLOSING PAGE ===== */
  doc.addPage();
  doc.setFillColor(...PURPLE);
  doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, W, 3, 'F');
  doc.rect(0, H - 3, W, 3, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(22);
  doc.setTextColor(...WHITE);
  doc.text('🌸  🌺  🌼', W / 2, 90, { align: 'center' });

  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(20);
  doc.setTextColor(240, 208, 96);
  doc.text('She shall flourish.', W / 2, 112, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(220, 200, 255);
  const ps1 = doc.splitTextToSize('"She is like a tree planted by streams of water, that yields its fruit in its season, and its leaf does not wither."', CW - 20);
  doc.text(ps1, W / 2, 130, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text('— Psalm 1:3', W / 2, 130 + ps1.length * 6 + 3, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 150, 255);
  doc.text('The Planted Woman  ✦  My Vision Garden', W / 2, H - 20, { align: 'center' });
  doc.text(`Generated ${data.date}`, W / 2, H - 14, { align: 'center' });

  // Store doc on window so download button can access it
  window._tpwPdfDoc = doc;
  return doc;
}

function buildAndDownloadPdf() {
  if (window._tpwPdfDoc) {
    window._tpwPdfDoc.save('MyVisionGarden_ThePlantedWoman.pdf');
  } else {
    const doc = buildPdf();
    if (doc) doc.save('MyVisionGarden_ThePlantedWoman.pdf');
  }
}

// Init PDF after DOM ready (called in DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
  initPdf();
});
