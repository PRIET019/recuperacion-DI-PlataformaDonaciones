import { useTranslation } from "react-i18next";

const Preferencias = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  return (
    <div>
      <h1>{t("preferences")}</h1>

      <h2>{t("language")}</h2>

      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        <option value="es">{t("spanish")}</option>
        <option value="en">{t("english")}</option>
      </select>
    </div>
  );
};

export default Preferencias;