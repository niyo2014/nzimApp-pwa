import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import HomePage from './pages/HomePage';
import ListingPage from './pages/ListingPage';
import CreateListingPage from './pages/CreateListingPage';
import GalleryPage from './pages/GalleryPage';
import SharePage from './pages/SharePage';
import ReferralDashboard from './pages/ReferralDashboard';
import WantedPage from './pages/WantedPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
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
              <Route path="/create" element={<CreateListingPage />} />
              <Route path="/gallery/:id" element={<GalleryPage />} />
              <Route path="/share/:listingId" element={<SharePage />} />
              <Route path="/referrals" element={<ReferralDashboard />} />
              <Route path="/wanted" element={<WantedPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/dashboard" element={<UserDashboard />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}
