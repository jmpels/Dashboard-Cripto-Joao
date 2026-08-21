import CryptoDashboard from "./dashboard/CryptoDashboard";
import { LanguageProvider } from "./dashboard/i18n/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <CryptoDashboard />
    </LanguageProvider>
  );
}
