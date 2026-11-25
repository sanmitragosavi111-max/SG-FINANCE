import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SiteProvider } from './context/SiteContext';
import { PublicLayout } from './components/PublicLayout';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { EnquirePage } from './pages/EnquirePage';
import { CampaignLandingPage } from './pages/CampaignLandingPage';
import { LegalPage } from './pages/LegalPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <ErrorBoundary>
      <SiteProvider>
        <BrowserRouter>
          <Routes>
            {/* Separate Secure Admin Area */}
            <Route path="/admin" element={<AdminPage />} />

            {/* Public SG FINANCE Website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/enquire" element={<EnquirePage />} />
              <Route path="/campaign" element={<CampaignLandingPage />} />
              <Route path="/connect" element={<CampaignLandingPage />} />
              <Route path="/privacy-policy" element={<LegalPage type="privacy" />} />
              <Route path="/terms-and-conditions" element={<LegalPage type="terms" />} />
              <Route path="/disclaimer" element={<LegalPage type="disclaimer" />} />
              <Route path="/loan-terms" element={<LegalPage type="loan-terms" />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SiteProvider>
    </ErrorBoundary>
  );
}
