import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Search, Plus, Eye } from 'lucide-react';
import backend from '~backend/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ListingCard from '../components/ListingCard';

export default function WantedPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: wantedListings, isLoading } = useQuery({
    queryKey: ['wanted-listings', searchQuery, selectedCategory],
    queryFn: async () => {
      return await backend.listing.listListings({
        search: searchQuery || undefined,
        category_id: selectedCategory || undefined,
        listing_type: 'wanted',
        limit: 20
      });
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => backend.listing.listCategories()
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Heart className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">Wanted Listings</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse what people are looking for, or post your own wanted listing to find exactly what you need.
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search wanted items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Category Filter */}
      {categories && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            size="sm"
          >
            All Categories
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

      {/* Action Buttons */}
      <div className="flex gap-2 justify-center">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Post Wanted Listing
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          My Wanted Listings
        </Button>
      </div>

      {/* Wanted Listings */}
      <div>
        {isLoading ? (
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
        ) : wantedListings?.listings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <Heart className="h-12 w-12 mx-auto text-red-400" />
                <h3 className="text-lg font-semibold">No wanted listings found</h3>
                <p className="text-gray-500">
                  Be the first to post what you're looking for, or try adjusting your search filters.
                </p>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Post Your First Wanted Listing
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {wantedListings?.total} wanted listings found
              </h2>
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                <Heart className="h-3 w-3 mr-1" />
                Wanted Items
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wantedListings?.listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">How Wanted Listings Work</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-2">
          <p>• Post what you're looking for with detailed descriptions</p>
          <p>• Vendors can see your wanted listings and contact you</p>
          <p>• Get notified when matching items are posted</p>
          <p>• Pay a small fee to reveal vendor contact information</p>
        </CardContent>
      </Card>
    </div>
  );
}
