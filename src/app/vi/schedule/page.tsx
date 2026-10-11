import HomePage from '@/components/HomePage';
import { LangProvider } from '@/hooks/useLang';

// Vietnamese direct link that skips the sketch entrance and opens on the hero
export default function VietnameseSchedulePage() {
  return (
    <LangProvider initialLang="vi">
      <HomePage skipIntro />
    </LangProvider>
  );
}
