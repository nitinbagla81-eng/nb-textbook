// js/app.js - Language Switching Logic

function setLanguage(lang) {
  localStorage.setItem('nb_lang', lang);

  // Update button active state
  const btnEn = document.getElementById('btn-en');
  const btnHi = document.getElementById('btn-hi');
  if (btnEn && btnHi) {
    if (lang === 'hi') {
      btnHi.classList.add('active');
      btnEn.classList.remove('active');
    } else {
      btnEn.classList.add('active');
      btnHi.classList.remove('active');
    }
  }

  // Update all translatable elements
  const elements = document.querySelectorAll('[data-lang-en]');
  elements.forEach(el => {
    const text = el.getAttribute(`data-lang-${lang}`);
    if (text) {
      el.textContent = text;
    }
  });
}

// On page load, apply saved language or default to English
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('nb_lang') || 'en';
  setLanguage(savedLang);
});