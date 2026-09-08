/**
 * KidQuest — Конфігураційні дані (js/config.js)
 */
window.CONFIG = window.CONFIG || {
  TELEGRAM_BOT_NAME: "KidQuestBot",
  appName: 'KidQuest',
  trialDays: 7,
  // Ключі i18n для підтримки декількох мов (UA / EN)
  features: [
    {
      icon: '🎯',
      titleKey: 'card1Title',
      descKey: 'card1Desc'
    },
    {
      icon: '⚡',
      titleKey: 'card2Title',
      descKey: 'card2Desc'
    },
    {
      icon: '🏆',
      titleKey: 'card3Title',
      descKey: 'card3Desc'
    }
  ]
};

// Для зворотної сумісності (якщо десь у коді використовується APP_CONFIG)
window.APP_CONFIG = window.CONFIG;