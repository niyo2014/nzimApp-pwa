import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Grid3X3, TrendingUp } from 'lucide-react';
import backend from '~backend/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ListingCard from '../components/ListingCard';
import CategoryGrid from '../components/CategoryGrid';
import GalleryMap from '../components/GalleryMap';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [view, setView] = useState<'listings' | 'galleries' | 'categories'>('listings');

  const { data: listings, isLoading: loadingListings } = useQuery({
    queryKey: ['listings', searchQuery, selectedCategory],
    queryFn: async () => {
      const response = await backend.listing.listListings({
        search: searchQuery || undefined,
        category_id: selectedCategory || undefined,
        limit: 20
      });
      return response;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => backend.listing.listCategories()
  });

  const { data: galleries } = useQuery({
    queryKey: ['galleries'],
    queryFn: () => backend.listing.listGalleries()
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          GetPaid Connect
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your Market. Your Network. Your Income. Discover local sellers, earn by sharing, and connect with your community.
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products, services, or shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={view === 'listings' ? 'default' : 'outline'}
          onClick={() => setView('listings')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Listings
        </Button>
        <Button
          variant={view === 'categories' ? 'default' : 'outline'}
          onClick={() => setView('categories')}
          className="flex items-center gap-2"
        >
          <Grid3X3 className="h-4 w-4" />
          Categories
        </Button>
        <Button
          variant={view === 'galleries' ? 'default' : 'outline'}
          onClick={() => setView('galleries')}
          className="flex items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          Galleries
        </Button>
      </div>

      {/* Category Filter */}
      {view === 'listings' && categories && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            size="sm"
          >
            All
          </Button>
          {categories.categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              size="sm"
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>
      )}

      {/* Content */}
      {view === 'listings' && (
        <div>
          {loadingListings ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : listings?.listings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No listings found. Try adjusting your search or filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings?.listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'categories' && categories && (
        <CategoryGrid 
          categories={categories.categories} 
          onCategorySelect={(categoryId) => {
            setSelectedCategory(categoryId);
            setView('listings');
          }}
        />
      )}

      {view === 'galleries' && galleries && (
        <div className="space-y-6">
          <GalleryMap galleries={galleries.galleries} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleries.galleries.map((gallery) => (
              <Card key={gallery.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    {gallery.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary">{gallery.zone}</Badge>
                    {gallery.description && (
                      <p className="text-sm text-gray-600">{gallery.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
