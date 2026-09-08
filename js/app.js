/**
 * KidQuest — Головний скрипт додатка (js/app.js)
 */

// Поточний стан додатка
const state = {
  currentLang: localStorage.getItem('kidquest_lang') || 'ua',
  deferredPrompt: null
};

/**
 * Ініціалізація при завантаженні DOM
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Встановлюємо актуальну мову інтерфейсу
  initLanguage();

  // 2. Перевіряємо пристрій для відображення кнопки Power Off
  checkDeviceForLogoutBtn();
  window.addEventListener('resize', checkDeviceForLogoutBtn);

  // 3. Відстежуємо стан PWA-встановлення
  initPwaInstaller();

  // 4. Глобальний слухач для закриття модалки через Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFaqModal();
  });
});

/**
 * -------------------------------------------------------------------
 * 1. МОВНА ЛОКАЛІЗАЦІЯ (i18n)
 * -------------------------------------------------------------------
 */
function initLanguage() {
  // Якщо locales.js ще не підвантажився, чекаємо 50мс і пробуємо знову
  if (typeof locales === 'undefined') {
    setTimeout(initLanguage, 50);
    return;
  }
  setLanguage(state.currentLang);
}

function setLanguage(lang) {
  if (typeof locales === 'undefined' || !locales[lang]) {
    console.error(`Мова "${lang}" не знайдена в locales.js`);
    return;
  }

  state.currentLang = lang;
  localStorage.setItem('kidquest_lang', lang);

  // Оновлюємо атрибут lang у тегу <html>
  document.documentElement.lang = lang === 'ua' ? 'uk' : 'en';

  // Оновлюємо <title> сторінки
  if (locales[lang].metaTitle) {
    document.title = locales[lang].metaTitle;
  }

  // Перекладаємо всі елементи з атрибутом data-i18n
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (locales[lang] && locales[lang][key]) {
      element.textContent = locales[lang][key];
    }
  });

  // Стилізація активної кнопки мови в шапці
  const btnUa = document.getElementById('lang-ua');
  const btnEn = document.getElementById('lang-en');

  if (btnUa && btnEn) {
    const activeClasses = ['ring-2', 'ring-amber-400', 'scale-110'];
    const inactiveClasses = ['opacity-50'];

    if (lang === 'ua') {
      btnUa.classList.add(...activeClasses);
      btnUa.classList.remove(...inactiveClasses);

      btnEn.classList.remove(...activeClasses);
      btnEn.classList.add(...inactiveClasses);
    } else {
      btnEn.classList.add(...activeClasses);
      btnEn.classList.remove(...inactiveClasses);

      btnUa.classList.remove(...activeClasses);
      btnUa.classList.add(...inactiveClasses);
    }
  }
}

/**
 * -------------------------------------------------------------------
 * 2. ЛОГІКА ПЕРЕВІРКИ ПРИСТРОЮ ДЛЯ КНОПКИ ВИХОДУ (POWER OFF)
 * -------------------------------------------------------------------
 */
function checkDeviceForLogoutBtn() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;

  const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTV = /TV|SmartTV|GoogleTV|AppleTV|HbbTV|NetCast|NETTV|Tizen|Web0S/i.test(navigator.userAgent);
  const isStandalonePWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const isSmallTouchScreen = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth <= 1024;

  if (isMobileOrTablet || isTV || isStandalonePWA || isSmallTouchScreen) {
    logoutBtn.classList.remove('hidden');
    logoutBtn.classList.add('flex');
  } else {
    logoutBtn.classList.add('hidden');
    logoutBtn.classList.remove('flex');
  }
}

/**
 * -------------------------------------------------------------------
 * 3. МОДАЛЬНЕ ВІКНО FAQ
 * -------------------------------------------------------------------
 */
function openFaqModal() {
  const modal = document.getElementById('faqModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeFaqModal() {
  const modal = document.getElementById('faqModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function closeFaqModalOnOutside(event) {
  if (event.target.id === 'faqModal') {
    closeFaqModal();
  }
}

/**
 * -------------------------------------------------------------------
 * 4. PWA КЕРУВАННЯ ВСТАНОВЛЕННЯМ
 * -------------------------------------------------------------------
 */
function initPwaInstaller() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredPrompt = e;

    const container = document.getElementById('pwa-install-container');
    if (container) {
      container.classList.remove('hidden');
    }
  });

  window.addEventListener('appinstalled', () => {
    state.deferredPrompt = null;
    const container = document.getElementById('pwa-install-container');
    if (container) {
      container.classList.add('hidden');
    }
    checkDeviceForLogoutBtn();
  });
}

function installPwa() {
  if (state.deferredPrompt) {
    state.deferredPrompt.prompt();
    state.deferredPrompt.userChoice.then(() => {
      state.deferredPrompt = null;
    });
  } else {
    const msg = state.currentLang === 'ua'
      ? 'Щоб встановити: натисніть "Поділитися" (Share) в меню браузера, а потім "На початковий екран"'
      : 'To install: tap "Share" in your browser menu, then "Add to Home Screen"';
    alert(msg);
  }
}

/**
 * 5. КНОПКИ АВТОРИЗАЦІЇ ТА ВИХІД
 */
function login(provider) {
  console.log(`Натиснуто вхід через ${provider}`);
  // Тут буде реальна авторизація надалі
}

function logout() {
  const confirmMsg = state.currentLang === 'ua'
    ? 'Ви дійсно бажаєте закрити додаток?'
    : 'Are you sure you want to close the app?';

  if (!confirm(confirmMsg)) return;

  // 1. Спроба закрити вікно PWA / вкладку
  window.close();

  // 2. Якщо браузер блокує window.close(), згортаємо через історію або порожню сторінку
  setTimeout(() => {
    if (!window.closed) {
      if (history.length > 1) {
        history.back();
      } else {
        window.location.href = 'about:blank';
      }
    }
  }, 100);
}

/**
 * -------------------------------------------------------------------
 * 6. ПОВНЕ ОЧИЩЕННЯ КЕШУ ТА ДАНИХ (для розробника)
 * -------------------------------------------------------------------
 */
async function clearAppCache() {
  const confirmClear = confirm('⚠️ Очистити всі збережені дані, кеш PWA та перезавантажити додаток?');
  if (!confirmClear) return;

  try {
    localStorage.clear();
    sessionStorage.clear();

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    if ('indexedDB' in window && indexedDB.databases) {
      const dbs = await indexedDB.databases();
      dbs.forEach(db => {
        if (db.name) indexedDB.deleteDatabase(db.name);
      });
    }

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
      }
    }

    alert('✅ Всі дані та кеш успішно видалено!');
    window.location.reload(true);
  } catch (error) {
    console.error('Помилка при очищенні кешу:', error);
    window.location.reload(true);
  }
}