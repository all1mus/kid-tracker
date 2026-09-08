/**
 * KidQuest — Головний скрипт додатка
 */

const state = {
  currentLang: localStorage.getItem('kidquest_lang') || 'ua',
  deferredPrompt: null
};

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  checkDeviceForLogoutBtn();
  window.addEventListener('resize', checkDeviceForLogoutBtn);
  initPwaInstaller();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFaqModal();
      closeChildCodeModal();
    }
  });
});

function initLanguage() {
  if (typeof window.locales === 'undefined') {
    setTimeout(initLanguage, 50);
    return;
  }
  setLanguage(state.currentLang);
}

function setLanguage(lang) {
  const locales = window.locales;
  if (!locales || !locales[lang]) return;

  state.currentLang = lang;
  localStorage.setItem('kidquest_lang', lang);

  document.documentElement.lang = lang === 'ua' ? 'uk' : 'en';

  if (locales[lang].metaTitle) {
    document.title = locales[lang].metaTitle;
  }

  // Оновлення всіх елементів з атрибутом data-i18n
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (locales[lang] && locales[lang][key]) {
      element.textContent = locales[lang][key];
    }
  });

  // Оновлення placeholder для інпутів (наприклад, введення коду)
  const childInput = document.getElementById('childCodeInput');
  if (childInput && locales[lang].placeholderCode) {
    childInput.placeholder = locales[lang].placeholderCode;
  }

  // Стилізація активної кнопки мови
  const btnUa = document.getElementById('lang-ua');
  const btnEn = document.getElementById('lang-en');

  if (btnUa && btnEn) {
    const activeClasses = ['ring-2', 'ring-amber-400', 'scale-105', 'opacity-100'];
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

function openFaqModal() {
  const modal = document.getElementById('faqModal');
  if (modal) {
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
  }
}

function closeFaqModal() {
  const modal = document.getElementById('faqModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  }
}

function closeFaqModalOnOutside(event) {
  if (event.target.id === 'faqModal') {
    closeFaqModal();
  }
}

function openChildCodeModal() {
  const modal = document.getElementById('childCodeModal');
  const input = document.getElementById('childCodeInput');
  if (modal) {
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

function closeChildCodeModal() {
  const modal = document.getElementById('childCodeModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  }
}

function submitChildCode() {
  const input = document.getElementById('childCodeInput');
  const code = input ? input.value.trim() : '';
  const locales = window.locales;

  if (code.length === 6) {
    alert(`Вхід за кодом: ${code}`);
    closeChildCodeModal();
  } else {
    const msg = (locales && locales[state.currentLang] && locales[state.currentLang].codePrompt)
      ? locales[state.currentLang].codePrompt
      : 'Будь ласка, введіть 6-значний код';
    alert(msg);
  }
}

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
      ? 'Щоб встановити: натисніть "Поділитися" в меню браузера, а потім "На початковий екран"'
      : 'To install: tap "Share" in your browser menu, then "Add to Home Screen"';
    alert(msg);
  }
}

function login(provider) {
  console.log(`Натиснуто вхід через ${provider}`);
}

function logout() {
  const confirmMsg = state.currentLang === 'ua'
    ? 'Ви дійсно бажаєте закрити додаток?'
    : 'Are you sure you want to close the app?';

  if (!confirm(confirmMsg)) return;

  window.close();

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

async function clearAppCache() {
  const confirmMsg = state.currentLang === 'ua'
    ? 'Очистити кеш та оновити додаток?'
    : 'Clear cache and update app?';

  if (!confirm(confirmMsg)) return;

  // 1. Очищаємо LocalStorage та SessionStorage
  localStorage.clear();
  sessionStorage.clear();

  // 2. Видаляємо всі кеші Service Worker (Caches API)
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
  }

  // 3. Відключаємо (Unregister) всі діючі Service Workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      await registration.unregister();
    }
  }

  // 4. Перезавантажуємо сторінку
  window.location.reload(true);
}

window.setLanguage = setLanguage;
window.openFaqModal = openFaqModal;
window.closeFaqModal = closeFaqModal;
window.closeFaqModalOnOutside = closeFaqModalOnOutside;
window.openChildCodeModal = openChildCodeModal;
window.closeChildCodeModal = closeChildCodeModal;
window.submitChildCode = submitChildCode;
window.installPwa = installPwa;
window.login = login;
window.logout = logout;
window.clearAppCache = clearAppCache;