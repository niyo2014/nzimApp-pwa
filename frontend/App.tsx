import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import HomePage from './pages/HomePage';
import ListingPage from './pages/ListingPage';
import GalleryPage from './pages/GalleryPage';
import SharePage from './pages/SharePage';
import ReferralDashboard from './pages/ReferralDashboard';
import Navigation from './components/Navigation';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="pb-16">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/listing/:id" element={<ListingPage />} />
              <Route path="/gallery/:id" element={<GalleryPage />} />
              <Route path="/share/:listingId" element={<SharePage />} />
              <Route path="/referrals" element={<ReferralDashboard />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}
