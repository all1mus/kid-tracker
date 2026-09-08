// js/config.js
window.CONFIG = window.CONFIG || {
  TELEGRAM_BOT_NAME: "KidQuestBot"
};

const APP_CONFIG = {
  appName: 'KidQuest',
  trialDays: 7,
  // Используем ключи i18n для поддержки мультиязычности (UA / EN)
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