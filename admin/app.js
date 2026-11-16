// Admin Panel Controller for Shahad Adel Birthday Microsite

function escapeHTML(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

let adminData = {};

const ADMIN_USERNAME = 'mohammed';
const ADMIN_PASSWORD = '0224';
const AUTH_SESSION_KEY = 'shahad_admin_authed';

document.addEventListener('DOMContentLoaded', () => {
  setupLoginGate();
});

function setupLoginGate() {
  const gate = document.getElementById('login-gate');
  const protectedArea = document.getElementById('admin-protected');
  const form = document.getElementById('login-form');
  const errorMsg = document.getElementById('login-error');

  function showDashboard() {
    gate.style.display = 'none';
    protectedArea.hidden = false;
    initDashboard();
  }

  if (sessionStorage.getItem(AUTH_SESSION_KEY) === '1') {
    showDashboard();
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value;

    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_SESSION_KEY, '1');
      errorMsg.hidden = true;
      showDashboard();
    } else {
      errorMsg.hidden = false;
    }
  });
}

function initDashboard() {
  loadAdminData();
  setupTabs();
  setupForms();
  setupUploadZone();
  setupPrevBdayUpload();
  setupGlobalActions();

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    location.reload();
  });
}

function deepMergeSiteData(base, override) {
  if (typeof override !== 'object' || override === null || Array.isArray(override)) {
    return override === undefined ? base : override;
  }
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      typeof override[key] === 'object' && override[key] !== null && !Array.isArray(override[key]) &&
      typeof base?.[key] === 'object' && base[key] !== null && !Array.isArray(base[key])
    ) {
      result[key] = deepMergeSiteData(base[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

function loadAdminData() {
  const defaults = JSON.parse(JSON.stringify(window.INITIAL_SITE_DATA || {}));
  const local = localStorage.getItem('shahad_site_data');
  if (local) {
    try {
      adminData = deepMergeSiteData(defaults, JSON.parse(local));
    } catch (e) {
      console.error('Error parsing admin data', e);
      adminData = defaults;
    }
  } else {
    adminData = defaults;
  }

  populateBasicInfo();
  populateMessage();
  populateHeroSection();
  populateGallery();
  populateToggles();
  populateWishes();
  populateTikTok();
  populateInstagram();
  populatePrevBirthdays();
}

// 1. Tabs Switching
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.admin-tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.style.display = 'none');

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.target);
      if (target) target.style.display = 'block';
    });
  });
}

// 2. Populate Basic Info
function populateBasicInfo() {
  const nameInput = document.getElementById('adm-name');
  const bdayInput = document.getElementById('adm-birthday');
  const taglineInput = document.getElementById('adm-tagline');

  if (nameInput) nameInput.value = adminData.name || '';
  if (bdayInput) bdayInput.value = adminData.birthday || '';
  if (taglineInput) taglineInput.value = adminData.heroTagline || '';
}

// 3. Populate Message
function populateMessage() {
  const msgInput = document.getElementById('adm-message');
  if (msgInput) msgInput.value = adminData.message || '';
}

function resolveAssetPath(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  if (path.startsWith('assets/')) {
    return '../' + path;
  }
  return path;
}

// 4. Populate Hero Preview
function populateHeroSection() {
  const heroThumb = document.getElementById('adm-hero-thumb');
  const heroPath = document.getElementById('adm-hero-path');

  if (heroThumb) heroThumb.src = resolveAssetPath(adminData.heroImage || 'assets/images/shahad_hero_swan.jpg');
  if (heroPath) heroPath.textContent = adminData.heroImage || '';
}

// 5. Populate Section Toggles
function populateToggles() {
  const toggles = [
    { id: 'toggle-gallery', key: 'gallery' },
    { id: 'toggle-tiktok', key: 'tiktok' },
    { id: 'toggle-instagram', key: 'instagram' },
    { id: 'toggle-previousBirthdays', key: 'previousBirthdays' },
    { id: 'toggle-wishes', key: 'wishes' },
    { id: 'toggle-music', key: 'music' },
    { id: 'toggle-cake', key: 'cake' },
    { id: 'toggle-countdown', key: 'countdown' },
    { id: 'toggle-message', key: 'message' },
  ];

  adminData.sections = adminData.sections || {};
  toggles.forEach(t => {
    const el = document.getElementById(t.id);
    if (el) {
      el.checked = adminData.sections[t.key] !== false;
      el.addEventListener('change', () => {
        adminData.sections[t.key] = el.checked;
        saveDataSilent();
      });
    }
  });
}

// 6. Populate TikTok Info
function populateTikTok() {
  const userEl = document.getElementById('adm-tt-user');
  const dispEl = document.getElementById('adm-tt-display');
  const linkEl = document.getElementById('adm-tt-link');

  if (!adminData.tiktok) adminData.tiktok = {};
  if (userEl) userEl.value = adminData.tiktok.username || '8tlt8_';
  if (dispEl) dispEl.value = adminData.tiktok.displayName || 'شَهــد 🦢';
  if (linkEl) linkEl.value = adminData.tiktok.profileUrl || 'https://www.tiktok.com/@8tlt8_';
}

// 6b. Populate Instagram Info
function populateInstagram() {
  const userEl = document.getElementById('adm-ig-user');
  const dispEl = document.getElementById('adm-ig-display');
  const linkEl = document.getElementById('adm-ig-link');

  if (!adminData.instagram) adminData.instagram = {};
  if (userEl) userEl.value = adminData.instagram.username || '8tlt8_';
  if (dispEl) dispEl.value = adminData.instagram.displayName || 'Shahad';
  if (linkEl) linkEl.value = adminData.instagram.profileUrl || 'https://www.instagram.com/8tlt8_/';
}

// 6c. Previous Birthdays Manager
function populatePrevBirthdays() {
  const container = document.getElementById('adm-prevbday-list');
  if (!container) return;
  container.innerHTML = '';
  const list = adminData.previousBirthdays || [];

  if (!list.length) {
    container.innerHTML = '<p style="color: #9d174d; grid-column: 1/-1;">لا توجد ذكريات أعياد ميلاد سابقة مضافة بعد.</p>';
    return;
  }

  list.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'gallery-manage-card';
    card.innerHTML = `
      <div class="gallery-thumb-box">
        <img class="gallery-thumb-img" src="${escapeHTML(resolveAssetPath(item.src))}" alt="${escapeHTML(item.title || '')}" />
        ${item.year ? `<span class="hero-indicator-badge">${escapeHTML(String(item.year))}</span>` : ''}
      </div>
      <div class="gallery-card-caption">
        <strong>${escapeHTML(item.title || '')}</strong>
      </div>
      <div class="gallery-card-actions">
        <button class="btn btn-danger btn-sm del-prevbday-btn" data-idx="${index}">🗑️ حذف</button>
      </div>
    `;
    card.querySelector('.del-prevbday-btn').addEventListener('click', () => {
      adminData.previousBirthdays.splice(index, 1);
      saveDataSilent();
      populatePrevBirthdays();
      showToast('تم حذف الذكرى');
    });
    container.appendChild(card);
  });
}

// 7. Populate Gallery Manager
function populateGallery() {
  const container = document.getElementById('adm-gallery-list');
  if (!container) return;

  container.innerHTML = '';
  const list = adminData.gallery || [];

  if (!list.length) {
    container.innerHTML = '<p style="color: #9d174d; grid-column: 1/-1;">لا توجد صور حالياً في المعرض.</p>';
    return;
  }

  list.forEach((item, index) => {
    const isHero = adminData.heroImage === item.src;
    const card = document.createElement('div');
    card.className = 'gallery-manage-card';

    card.innerHTML = `
      <div class="gallery-thumb-box">
        <img class="gallery-thumb-img" src="${escapeHTML(resolveAssetPath(item.src))}" alt="${escapeHTML(item.caption || '')}" />
        ${isHero ? '<span class="hero-indicator-badge">🌟 الصورة الرئيسية</span>' : ''}
      </div>
      <div class="gallery-card-caption">
        <input type="text" class="form-input form-input-sm" value="${escapeHTML(item.caption || '')}" placeholder="وصف الصورة..." data-idx="${index}">
        <select class="form-input form-input-sm gallery-type-select" data-idx="${index}" style="margin-top:6px">
          <option value="moments" ${item.type === 'moments' || !item.type ? 'selected' : ''}>لحظات جميلة</option>
          <option value="wall" ${item.type === 'wall' ? 'selected' : ''}>جدار الصور</option>
          <option value="portrait" ${item.type === 'portrait' ? 'selected' : ''}>Portrait</option>
          <option value="other" ${item.type === 'other' ? 'selected' : ''}>أخرى</option>
        </select>
      </div>
      <div class="gallery-card-actions">
        ${!isHero ? `<button class="btn btn-secondary btn-sm set-hero-btn" data-idx="${index}">🌟 تعيين كرئيسية</button>` : ''}
        ${index > 0 ? `<button class="btn btn-secondary btn-sm move-up-btn" data-idx="${index}">⬆️</button>` : ''}
        ${index < list.length - 1 ? `<button class="btn btn-secondary btn-sm move-down-btn" data-idx="${index}">⬇️</button>` : ''}
        <button class="btn btn-danger btn-sm del-img-btn" data-idx="${index}">🗑️ حذف</button>
      </div>
    `;

    // Caption update
    card.querySelector('input').addEventListener('input', (e) => {
      adminData.gallery[index].caption = e.target.value;
      saveDataSilent();
    });

    // Type / section routing update
    card.querySelector('.gallery-type-select').addEventListener('change', (e) => {
      adminData.gallery[index].type = e.target.value;
      saveDataSilent();
      showToast('تم تحديث قسم عرض الصورة');
    });

    // Set as Hero
    card.querySelector('.set-hero-btn')?.addEventListener('click', () => {
      adminData.heroImage = item.src;
      saveDataSilent();
      populateHeroSection();
      populateGallery();
      showToast('تم تعيين الصورة كصورة رئيسية للموقع 🌟');
    });

    // Move Up
    card.querySelector('.move-up-btn')?.addEventListener('click', () => {
      const temp = adminData.gallery[index];
      adminData.gallery[index] = adminData.gallery[index - 1];
      adminData.gallery[index - 1] = temp;
      saveDataSilent();
      populateGallery();
    });

    // Move Down
    card.querySelector('.move-down-btn')?.addEventListener('click', () => {
      const temp = adminData.gallery[index];
      adminData.gallery[index] = adminData.gallery[index + 1];
      adminData.gallery[index + 1] = temp;
      saveDataSilent();
      populateGallery();
    });

    // Delete
    card.querySelector('.del-img-btn')?.addEventListener('click', () => {
      if (confirm('هل أنتِ متأكدة من حذف هذه الصورة من المعرض؟')) {
        adminData.gallery.splice(index, 1);
        saveDataSilent();
        populateGallery();
        showToast('تم حذف الصورة من المعرض');
      }
    });

    container.appendChild(card);
  });
}

// 8. Populate Wishes Manager
function populateWishes() {
  const container = document.getElementById('adm-wishes-list');
  if (!container) return;

  container.innerHTML = '';
  const wishes = adminData.wishes || [];

  wishes.forEach((w, index) => {
    const item = document.createElement('div');
    item.style.cssText = 'background: #fff; padding: 14px; border-radius: 12px; border: 1px solid #fbcfe8; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; gap: 12px;';
    item.innerHTML = `
      <div>
        <strong>${escapeHTML(w.author || 'صديق')}</strong>: <span>${escapeHTML(w.text || '')}</span>
      </div>
      <button class="btn btn-danger btn-sm" data-idx="${index}">🗑️ حذف</button>
    `;

    item.querySelector('button').addEventListener('click', () => {
      adminData.wishes.splice(index, 1);
      saveDataSilent();
      populateWishes();
      showToast('تم حذف التهنئة');
    });

    container.appendChild(item);
  });
}

// 9. Setup File Upload Zone
function setupUploadZone() {
  const dropzone = document.getElementById('upload-dropzone');
  const fileInput = document.getElementById('file-upload-input');
  const previewBox = document.getElementById('upload-preview-box');
  const previewImg = document.getElementById('upload-preview-img');
  const captionInput = document.getElementById('upload-caption-input');
  const typeSelect = document.getElementById('upload-type-select');
  const addGalleryBtn = document.getElementById('btn-add-uploaded-gallery');
  const setHeroBtn = document.getElementById('btn-set-uploaded-hero');

  let currentDataUrl = null;

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--admin-primary)';
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = 'var(--admin-border)';
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--admin-border)';
    if (e.dataTransfer.files?.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files?.length) {
      handleFile(fileInput.files[0]);
    }
  });

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      currentDataUrl = e.target.result;
      if (previewImg) previewImg.src = currentDataUrl;
      if (previewBox) previewBox.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  // Add to gallery
  addGalleryBtn?.addEventListener('click', () => {
    if (!currentDataUrl) return;
    const caption = captionInput?.value.trim() || 'لحظة جميلة 🌸';
    const type = typeSelect?.value || 'moments';
    adminData.gallery = adminData.gallery || [];
    adminData.gallery.unshift({
      id: 'custom_' + Date.now(),
      src: currentDataUrl,
      caption: caption,
      date: 'صورة مضافة حديثاً',
      type: type
    });
    saveDataSilent();
    populateGallery();
    resetUpload();
    showToast('تمت إضافة الصورة بنجاح إلى المعرض 📸');
  });

  // Set as Hero
  setHeroBtn?.addEventListener('click', () => {
    if (!currentDataUrl) return;
    adminData.heroImage = currentDataUrl;
    saveDataSilent();
    populateHeroSection();
    resetUpload();
    showToast('تم تعيين الصورة كصورة رئيسية للموقع 🌟');
  });

  function resetUpload() {
    currentDataUrl = null;
    if (fileInput) fileInput.value = '';
    if (captionInput) captionInput.value = '';
    if (typeSelect) typeSelect.value = 'moments';
    if (previewBox) previewBox.style.display = 'none';
  }
}

// 9b. Previous Birthdays Upload
function setupPrevBdayUpload() {
  const dropzone = document.getElementById('prevbday-upload-dropzone');
  const fileInput = document.getElementById('prevbday-file-input');
  const previewBox = document.getElementById('prevbday-preview-box');
  const previewImg = document.getElementById('prevbday-preview-img');
  const yearInput = document.getElementById('prevbday-year');
  const titleInput = document.getElementById('prevbday-title');
  const descInput = document.getElementById('prevbday-desc');
  const addBtn = document.getElementById('btn-add-prevbday');

  let currentDataUrl = null;
  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--admin-primary)'; });
  dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--admin-border)'; });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--admin-border)';
    if (e.dataTransfer.files?.length) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files?.length) handleFile(fileInput.files[0]);
  });

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      currentDataUrl = e.target.result;
      if (previewImg) previewImg.src = currentDataUrl;
      if (previewBox) previewBox.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  addBtn?.addEventListener('click', () => {
    if (!currentDataUrl) return;
    const title = titleInput?.value.trim() || 'ذكرى من الماضي';
    const year = yearInput?.value.trim() || '';
    const description = descInput?.value.trim() || '';

    adminData.previousBirthdays = adminData.previousBirthdays || [];
    adminData.previousBirthdays.push({
      id: 'pb_' + Date.now(),
      src: currentDataUrl,
      year,
      title,
      description
    });
    saveDataSilent();
    populatePrevBirthdays();

    currentDataUrl = null;
    fileInput.value = '';
    yearInput.value = '';
    titleInput.value = '';
    descInput.value = '';
    previewBox.style.display = 'none';
    showToast('تمت إضافة الذكرى بنجاح 🎂');
  });
}

// 10. Forms Submissions
function setupForms() {
  // Save basic info
  document.getElementById('basic-info-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    adminData.name = document.getElementById('adm-name').value.trim();
    adminData.birthday = document.getElementById('adm-birthday').value.trim();
    adminData.heroTagline = document.getElementById('adm-tagline').value.trim();
    saveDataWithFeedback();
  });

  // Save message
  document.getElementById('message-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    adminData.message = document.getElementById('adm-message').value.trim();
    saveDataWithFeedback();
  });

  // Save TikTok
  document.getElementById('tiktok-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    adminData.tiktok = adminData.tiktok || {};
    adminData.tiktok.username = document.getElementById('adm-tt-user').value.trim();
    adminData.tiktok.displayName = document.getElementById('adm-tt-display').value.trim();
    adminData.tiktok.profileUrl = document.getElementById('adm-tt-link').value.trim();
    saveDataWithFeedback();
  });

  // Save Instagram
  document.getElementById('instagram-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    adminData.instagram = adminData.instagram || {};
    adminData.instagram.username = document.getElementById('adm-ig-user').value.trim();
    adminData.instagram.displayName = document.getElementById('adm-ig-display').value.trim();
    adminData.instagram.profileUrl = document.getElementById('adm-ig-link').value.trim();
    saveDataWithFeedback();
  });
}

// 11. Global Actions (Save, Export, Reset)
function setupGlobalActions() {
  // Quick Save Header button
  document.getElementById('btn-save-all')?.addEventListener('click', () => {
    // Read all inputs first
    adminData.name = document.getElementById('adm-name')?.value.trim() || adminData.name;
    adminData.birthday = document.getElementById('adm-birthday')?.value.trim() || adminData.birthday;
    adminData.heroTagline = document.getElementById('adm-tagline')?.value.trim() || adminData.heroTagline;
    adminData.message = document.getElementById('adm-message')?.value.trim() || adminData.message;

    if (adminData.tiktok) {
      adminData.tiktok.username = document.getElementById('adm-tt-user')?.value.trim() || adminData.tiktok.username;
      adminData.tiktok.displayName = document.getElementById('adm-tt-display')?.value.trim() || adminData.tiktok.displayName;
      adminData.tiktok.profileUrl = document.getElementById('adm-tt-link')?.value.trim() || adminData.tiktok.profileUrl;
    }

    saveDataWithFeedback();
  });

  // Download site.json
  document.getElementById('btn-export-json')?.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(adminData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'site.json');
    dlAnchor.click();
    showToast('تم تحميل ملف site.json المحدّث 📥');
  });

  // Reset to default
  document.getElementById('btn-reset-default')?.addEventListener('click', () => {
    if (confirm('هل أنتِ متأكدة من رغبتكِ في استعادة الإعدادات والبيانات الأصلية؟ ستفقدين التعديلات غير المصدرة.')) {
      localStorage.removeItem('shahad_site_data');
      adminData = JSON.parse(JSON.stringify(window.INITIAL_SITE_DATA || {}));
      loadAdminData();
      showToast('تمت استعادة الإعدادات الأصلية بنجاح 🔄');
    }
  });
}

function saveDataSilent() {
  localStorage.setItem('shahad_site_data', JSON.stringify(adminData));
}

function saveDataWithFeedback() {
  saveDataSilent();
  showToast('تم حفظ وتطبيق التعديلات بنجاح! 💾✨');
}

function showToast(message, duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.cssText = 'position: fixed; bottom: 24px; left: 24px; background: #fff; padding: 12px 20px; border-radius: 14px; box-shadow: 0 10px 25px rgba(236,72,153,0.25); border: 1px solid #fbcfe8; color: #4a1525; font-weight: 600; z-index: 99999; animation: slideUp 0.3s;';
  toast.innerHTML = `<span>🌸</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
