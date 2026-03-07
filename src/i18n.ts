import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  es: {
    translation: {
      menu_home: "Inicio",
      menu_crear: "Crear campaña",
      menu_login: "Entrar",
      donate: "Donar",
      save: "Guardar",
      cancel: "Cancelar",
      preferences: "Preferencias",
      language: "Idioma",
      spanish: "Español",
      english: "Inglés"
    }
  },
  en: {
    translation: {
      menu_home: "Home",
      menu_crear: "Create campaign",
      menu_login: "Login",
      donate: "Donate",
      save: "Save",
      cancel: "Cancel",
      preferences: "Preferences",
      language: "Language",
      spanish: "Spanish",
      english: "English"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("lang") || "es",
    fallbackLng: "es",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;