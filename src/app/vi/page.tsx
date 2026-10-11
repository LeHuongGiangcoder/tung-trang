import HomePage from '@/components/HomePage';
import { LangProvider } from '@/hooks/useLang';

// Direct link that opens the site in Vietnamese; the EN/VI toggle still works
export default function VietnamesePage() {
  return (
    <LangProvider initialLang="vi">
      <HomePage />
    </LangProvider>
  );
}
