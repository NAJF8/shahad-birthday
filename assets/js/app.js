// Shahad Adel Birthday Microsite - Main Application Controller

function escapeHTML(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

let siteData = {};
let currentLightboxIndex = 0;

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

function getStoredData() {
  const defaults = window.INITIAL_SITE_DATA || {};
  const local = localStorage.getItem('shahad_site_data');
  if (local) {
    try {
      return deepMergeSiteData(defaults, JSON.parse(local));
    } catch (e) {
      console.error('Error parsing stored data', e);
    }
  }
  return defaults;
}

function initApp() {
  siteData = getStoredData();

  // Render content
  renderHero();
  renderCountdown();
  renderMessage();
  renderCake();
  renderGallery();
  renderPreviousBirthdays();
  renderTikTok();
  renderWishes();
  initIntroScreen();
  initAudioControls();
  initPetals();
  initLightbox();

  // Periodic countdown update
  setInterval(updateCountdown, 1000);
}

// ==========================================================================
// 1. Intro Screen
// ==========================================================================
function initIntroScreen() {
  const intro = document.getElementById('intro-screen');
  const enterBtn = document.getElementById('enter-site-btn');
  if (!intro || !enterBtn) return;

  // Check if visited in this session
  if (sessionStorage.getItem('shahad_intro_seen')) {
    intro.style.display = 'none';
    return;
  }

  enterBtn.addEventListener('click', () => {
    // Start music on first interaction if enabled
    if (siteData.sections?.music && window.birthdayAudio) {
      window.birthdayAudio.start();
    }

    // Trigger sweet burst of celebratory confetti
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff85a2', '#f472b6', '#fed7e2', '#ffffff', '#fbbf24']
      });
    }

    // Smooth fade out
    intro.classList.add('fade-out');
    sessionStorage.setItem('shahad_intro_seen', 'true');
    setTimeout(() => {
      intro.style.display = 'none';
    }, 1200);
  });
}

// ==========================================================================
// 2. Hero Section
// ==========================================================================
function renderHero() {
  const titleEl = document.getElementById('hero-title');
  const taglineEl = document.getElementById('hero-tagline');
  const imgEl = document.getElementById('hero-img');
  const badgeEl = document.getElementById('hero-badge-text');

  if (titleEl) titleEl.textContent = `عيد ميلاد سعيد ${siteData.name || 'شهد عادل'}`;
  if (taglineEl) taglineEl.textContent = siteData.heroTagline || '';
  if (badgeEl) badgeEl.textContent = `${siteData.birthday || '21 أكتوبر'} 🎀`;
  if (imgEl && siteData.heroImage) {
    imgEl.src = siteData.heroImage;
    imgEl.alt = siteData.name || 'شهد عادل';
  }
}

// ==========================================================================
// 3. Countdown Timer to 21 October
// ==========================================================================
function renderCountdown() {
  updateCountdown();
}

function updateCountdown() {
  const daysEl = document.getElementById('cnt-days');
  const hoursEl = document.getElementById('cnt-hours');
  const minsEl = document.getElementById('cnt-mins');
  const secsEl = document.getElementById('cnt-secs');
  if (!daysEl) return;

  const now = new Date();
  let targetYear = now.getFullYear();
  let target = new Date(targetYear, 9, 21, 0, 0, 0); // October is month index 9

  if (now > target) {
    // If passed this year, countdown to next year's 21 Oct
    target = new Date(targetYear + 1, 9, 21, 0, 0, 0);
  }

  const diff = target - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  daysEl.textContent = String(days).padStart(2, '0');
  hoursEl.textContent = String(hours).padStart(2, '0');
  minsEl.textContent = String(minutes).padStart(2, '0');
  secsEl.textContent = String(seconds).padStart(2, '0');
}

// ==========================================================================
// 4. Birthday Message
// ==========================================================================
function renderMessage() {
  const msgSection = document.getElementById('message-section');
  const textEl = document.getElementById('letter-content');
  if (!msgSection) return;

  if (siteData.sections?.message === false) {
    msgSection.style.display = 'none';
    return;
  }
  msgSection.style.display = 'block';
  if (textEl) {
    textEl.textContent = siteData.message || '';
  }
}

// ==========================================================================
// 5. Interactive Birthday Cake
// ==========================================================================
function renderCake() {
  const cakeSection = document.getElementById('cake-section');
  const blowBtn = document.getElementById('blow-candles-btn');
  const flames = document.querySelectorAll('.flame');
  const wishMsg = document.getElementById('cake-wish-msg');

  if (!cakeSection) return;
  if (siteData.sections?.cake === false) {
    cakeSection.style.display = 'none';
    return;
  }
  cakeSection.style.display = 'block';

  let blownOut = false;

  blowBtn?.addEventListener('click', () => {
    if (!blownOut) {
      flames.forEach(f => f.classList.add('blown-out'));
      blownOut = true;
      blowBtn.textContent = 'أشعلِ الشموع من جديد 🕯️';

      if (wishMsg) wishMsg.style.display = 'block';

      // Confetti burst
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ff85a2', '#f472b6', '#fbcfe8', '#ffffff', '#fbbf24']
        });
      }
      showToast('يا رب تتحقق كل أمنياتك الحلوة يا شهد! 🤍✨');
    } else {
      flames.forEach(f => f.classList.remove('blown-out'));
      blownOut = false;
      blowBtn.textContent = 'اطفئِ الشموع وتمني أمنية 🎂✨';
      if (wishMsg) wishMsg.style.display = 'none';
    }
  });
}

// ==========================================================================
// 6. Photo Gallery (Polaroid Masonry)
// ==========================================================================
function renderGallery() {
  const galSection = document.getElementById('gallery-section');
  const grid = document.getElementById('gallery-grid');
  if (!galSection || !grid) return;

  if (siteData.sections?.gallery === false || !siteData.gallery?.length) {
    galSection.style.display = 'none';
    return;
  }
  galSection.style.display = 'block';
  grid.innerHTML = '';

  const likedPhotos = JSON.parse(localStorage.getItem('shahad_liked_photos') || '{}');

  siteData.gallery.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'polaroid-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', item.caption || `صورة ذكرى ${index + 1}`);

    const isLiked = !!likedPhotos[item.id || index];
    const likesCount = (item.likes || 12) + (isLiked ? 1 : 0);

    card.innerHTML = `
      <div class="polaroid-img-wrapper" data-index="${index}">
        <img class="polaroid-img" src="${escapeHTML(item.src)}" alt="${escapeHTML(item.caption || 'صورة ذكرى')}" loading="lazy" />
      </div>
      <div class="polaroid-caption">${escapeHTML(item.caption || '')}</div>
      <div class="polaroid-footer">
        <span>${escapeHTML(item.date || 'ذكرى سعيدة')}</span>
        <button class="like-btn" data-id="${item.id || index}" title="إعجاب">
          <span>${isLiked ? '❤️' : '🤍'}</span>
          <span class="like-count">${likesCount}</span>
        </button>
      </div>
    `;

    // Click image to open lightbox
    card.querySelector('.polaroid-img-wrapper').addEventListener('click', () => {
      openLightbox(index);
    });

    // Like button handler
    const likeBtn = card.querySelector('.like-btn');
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const current = likedPhotos[item.id || index];
      if (current) {
        delete likedPhotos[item.id || index];
        likeBtn.querySelector('span:first-child').textContent = '🤍';
        likeBtn.querySelector('.like-count').textContent = item.likes || 12;
      } else {
        likedPhotos[item.id || index] = true;
        likeBtn.querySelector('span:first-child').textContent = '❤️';
        likeBtn.querySelector('.like-count').textContent = (item.likes || 12) + 1;
        showToast('شكراً لمحبتكِ وتقديركِ 🤍');
      }
      localStorage.setItem('shahad_liked_photos', JSON.stringify(likedPhotos));
    });

    grid.appendChild(card);
  });
}

// ==========================================================================
// 7. Lightbox Modal (Component 07 from AGENTS.md)
// ==========================================================================
function initLightbox() {
  const dialog = document.getElementById('lightbox-dialog');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (!dialog) return;

  closeBtn?.addEventListener('click', () => dialog.close());

  prevBtn?.addEventListener('click', () => {
    if (siteData.gallery?.length) {
      currentLightboxIndex = (currentLightboxIndex - 1 + siteData.gallery.length) % siteData.gallery.length;
      updateLightboxContent();
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (siteData.gallery?.length) {
      currentLightboxIndex = (currentLightboxIndex + 1) % siteData.gallery.length;
      updateLightboxContent();
    }
  });

  // Close on outside click
  dialog.addEventListener('click', (e) => {
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX && e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      dialog.close();
    }
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!dialog.open) return;
    if (e.key === 'ArrowRight') {
      prevBtn?.click(); // RTL
    } else if (e.key === 'ArrowLeft') {
      nextBtn?.click(); // RTL
    }
  });
}

function openLightbox(index) {
  const dialog = document.getElementById('lightbox-dialog');
  if (!dialog || !siteData.gallery?.[index]) return;

  currentLightboxIndex = index;
  updateLightboxContent();
  dialog.showModal();
}

function updateLightboxContent() {
  const item = siteData.gallery[currentLightboxIndex];
  if (!item) return;

  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-caption');
  if (img) {
    img.src = item.src;
    img.alt = item.caption || '';
  }
  if (cap) {
    cap.textContent = item.caption || '';
  }
}

// ==========================================================================
// 8. Social Section (TikTok + Instagram)
// ==========================================================================
function renderTikTok() {
  const ttSection = document.getElementById('tiktok-section');
  const socialSection = document.getElementById('social-section');
  if (!ttSection) return;

  const ttOn = siteData.sections?.tiktok !== false && siteData.tiktok?.enabled;
  const igOn = siteData.sections?.instagram !== false && siteData.instagram?.enabled;
  if (socialSection) socialSection.style.display = (ttOn || igOn) ? 'block' : 'none';

  ttSection.style.display = ttOn ? 'flex' : 'none';
  if (ttOn) {
    const avatar = document.getElementById('tt-avatar');
    const displayName = document.getElementById('tt-display-name');
    const handle = document.getElementById('tt-handle');
    const link = document.getElementById('tt-link');
    const note = document.getElementById('tt-note');

    if (avatar && siteData.tiktok.avatar) avatar.src = siteData.tiktok.avatar;
    if (displayName) displayName.textContent = escapeHTML(siteData.tiktok.displayName || 'شَهــد 🦢');
    if (handle) handle.textContent = `@${escapeHTML(siteData.tiktok.username || '8tlt8_')}`;
    if (link && siteData.tiktok.profileUrl) link.href = siteData.tiktok.profileUrl;
    if (note && siteData.tiktok.note) note.textContent = siteData.tiktok.note;
  }

  renderInstagram(igOn);
}

function renderInstagram(igOn) {
  const igSection = document.getElementById('instagram-section');
  if (!igSection) return;
  igSection.style.display = igOn ? 'flex' : 'none';
  if (!igOn || !siteData.instagram) return;

  const ig = siteData.instagram;
  const displayName = document.getElementById('ig-display-name');
  const handle = document.getElementById('ig-handle');
  const link = document.getElementById('ig-link');
  const note = document.getElementById('ig-note');

  if (displayName) displayName.textContent = escapeHTML(ig.displayName || 'Shahad');
  if (handle) handle.textContent = `@${escapeHTML(ig.username || '8tlt8_')}`;
  if (link && ig.profileUrl) link.href = ig.profileUrl;
  if (note) note.textContent = ig.note || (ig.isPrivate ? 'هذا حساب خاص (Private).' : '');
}

// ==========================================================================
// 8b. Previous Birthdays — only shown when real dated memories exist
// ==========================================================================
function renderPreviousBirthdays() {
  const section = document.getElementById('prev-birthdays-section');
  const grid = document.getElementById('prev-birthdays-grid');
  if (!section || !grid) return;

  const items = siteData.previousBirthdays || [];
  const on = siteData.sections?.previousBirthdays !== false && items.length > 0;
  section.hidden = !on;
  if (!on) return;

  grid.innerHTML = '';
  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'prev-birthday-card';
    card.innerHTML = `
      <div class="prev-birthday-img-wrap">
        <img src="${escapeHTML(item.src)}" alt="${escapeHTML(item.title || 'ذكرى عيد ميلاد سابق')}" loading="lazy">
      </div>
      <div class="prev-birthday-meta">
        ${item.year ? `<span class="prev-birthday-year">${escapeHTML(String(item.year))}</span>` : `<span class="prev-birthday-year">ذكرى من الماضي</span>`}
        <h3>${escapeHTML(item.title || '')}</h3>
        ${item.description ? `<p>${escapeHTML(item.description)}</p>` : ''}
      </div>
    `;
    grid.appendChild(card);
  });
}

// ==========================================================================
// 9. Wishes Wall & Form
// ==========================================================================
function renderWishes() {
  const wishSection = document.getElementById('wishes-section');
  const grid = document.getElementById('wishes-grid');
  const form = document.getElementById('new-wish-form');

  if (!wishSection || !grid) return;

  if (siteData.sections?.wishes === false) {
    wishSection.style.display = 'none';
    return;
  }
  wishSection.style.display = 'block';
  grid.innerHTML = '';

  const wishes = siteData.wishes || [];
  wishes.forEach(w => {
    const card = document.createElement('div');
    card.className = 'wish-card';
    card.innerHTML = `
      <div class="wish-text">"${escapeHTML(w.text)}"</div>
      <div class="wish-author-badge">
        <span>💌</span>
        <span>${escapeHTML(w.author || 'محبّوكِ')}</span>
      </div>
    `;
    grid.appendChild(card);
  });

  if (form && !form.dataset.bound) {
    form.dataset.bound = 'true';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const authorInput = document.getElementById('wish-author');
      const textInput = document.getElementById('wish-message');

      const author = authorInput?.value.trim() || 'صديق محب 🤍';
      const text = textInput?.value.trim();

      if (!text) return;

      const newWish = {
        id: 'w_' + Date.now(),
        author: author,
        text: text
      };

      siteData.wishes = siteData.wishes || [];
      siteData.wishes.unshift(newWish);
      localStorage.setItem('shahad_site_data', JSON.stringify(siteData));

      renderWishes();
      form.reset();
      showToast('تمت إضافة أمنيتكِ الجميلة إلى الجدار 🌸');

      if (typeof confetti === 'function') {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#ff85a2', '#f472b6', '#ffffff']
        });
      }
    });
  }
}

// ==========================================================================
// 10. Audio Player UI Control
// ==========================================================================
function initAudioControls() {
  const audioBtn = document.getElementById('music-toggle-btn');
  if (!audioBtn) return;

  if (siteData.sections?.music === false) {
    audioBtn.style.display = 'none';
    return;
  }

  audioBtn.addEventListener('click', () => {
    if (window.birthdayAudio) {
      window.birthdayAudio.toggle();
    }
  });

  if (window.birthdayAudio) {
    window.birthdayAudio.onStateChange((playing) => {
      if (playing) {
        audioBtn.classList.add('playing');
        audioBtn.setAttribute('title', 'إيقاف الموسيقى');
        showToast('تم تشغيل صندوق الموسيقى الحالم 🎶');
      } else {
        audioBtn.classList.remove('playing');
        audioBtn.setAttribute('title', 'تشغيل الموسيقى');
      }
    });
  }
}

// ==========================================================================
// 11. Subtle Ambient Floating Petals (Canvas)
// ==========================================================================
function initPetals() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petals = [];
  const petalCount = 24;

  for (let i = 0; i < petalCount; i++) {
    petals.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 6 + Math.random() * 8,
      speedX: -0.5 + Math.random() * 1,
      speedY: 0.8 + Math.random() * 1.2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: 0.01 + Math.random() * 0.02,
      opacity: 0.35 + Math.random() * 0.35,
    });
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = `rgba(255, 182, 193, ${p.opacity})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 1.5, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    for (let p of petals) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x > width + 20) p.x = -20;
      if (p.x < -20) p.x = width + 20;

      drawPetal(p);
    }
    requestAnimationFrame(loop);
  }

  loop();
}

// ==========================================================================
// 12. Toast System (Component 10 from AGENTS.md)
// ==========================================================================
function showToast(message, duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span>🌸</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
