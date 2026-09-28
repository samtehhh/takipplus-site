// HTML doğrulama (CI): npx html-validate "dist/**/*.html"
export default {
  extends: ['html-validate:recommended'],
  rules: {
    // Derleme çıktısının biçimi, anlamı yok
    'no-trailing-whitespace': 'off',
    // Bilerek: list-style: none verilen listelerde Safari/VoiceOver liste
    // anlamını düşürüyor; role="list" bunu geri getiriyor.
    'no-redundant-role': 'off',
    'prefer-native-element': 'off',
    // "Hedef & Net" gibi belirsiz olmayan & HTML5'te geçerli
    'no-raw-characters': ['error', { relaxed: true }],
  },
};
