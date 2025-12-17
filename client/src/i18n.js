import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi_translation from './languages/vi.json';
import en_translation from './languages/en.json';

// Định nghĩa từ điển ngôn ngữ
const resources = {
  en: {
    translation: en_translation
  },
  vi: {
    translation: vi_translation
  },
  lng: "vi", 
    fallbackLng: "en", // Nếu không tìm thấy tiếng Việt thì dùng tiếng Anh
    interpolation: { escapeValue: false }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "vi", // Ngôn ngữ mặc định
    interpolation: {
      escapeValue: false // React đã bảo vệ khỏi XSS
    }
  });

export default i18n;