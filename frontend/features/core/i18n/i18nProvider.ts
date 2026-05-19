import polyglotI18nProvider from "ra-i18n-polyglot";
import vietnameseMessages from "./viMessages";

export const adminI18nProvider = polyglotI18nProvider(() => vietnameseMessages, "vi", [
  { locale: "vi", name: "Tiếng Việt" },
]);
