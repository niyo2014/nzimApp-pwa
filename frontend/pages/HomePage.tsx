import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, MapPin, Grid3X3, TrendingUp, Heart, Plus, Store, Truck } from 'lucide-react';
import backend from '~backend/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ListingCard from '../components/ListingCard';
import CategoryGrid from '../components/CategoryGrid';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [vendorType, setVendorType] = useState<'gallery' | 'outside' | null>(null);
  const [view, setView] = useState<'offerings' | 'wanted' | 'categories'>('offerings');

  const { data: listings, isLoading: loadingListings } = useQuery({
    queryKey: ['listings', searchQuery, selectedCategory, vendorType, view],
    queryFn: async () => {
      if (view === 'categories') return { listings: [], total: 0 };
      
      const listingType = view === 'wanted' ? 'wanted' : 'offering';
      const response = await backend.listing.listListings({
        search: searchQuery || undefined,
        category_id: selectedCategory || undefined,
        vendor_type: vendorType || undefined,
        listing_type: listingType,
        status: 'active',
        limit: 20
      });
      return response;
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
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          NzimApp
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Digital Gallery Marketplace for Burundi. Connect. Share. Earn. Your Market. Your Network. Your Income.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 justify-center">
        <Link to="/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Listing
          </Button>
        </Link>
        <Link to="/wanted">
          <Button variant="outline" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Post Wanted
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products, services, or vendors..."
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
      <div className="flex gap-2 justify-center flex-wrap">
        <Button
          variant={view === 'offerings' ? 'default' : 'outline'}
          onClick={() => setView('offerings')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Offerings
        </Button>
        <Button
          variant={view === 'wanted' ? 'default' : 'outline'}
          onClick={() => setView('wanted')}
          className="flex items-center gap-2"
        >
          <Heart className="h-4 w-4" />
          Wanted
        </Button>
        <Button
          variant={view === 'categories' ? 'default' : 'outline'}
          onClick={() => setView('categories')}
          className="flex items-center gap-2"
        >
          <Grid3X3 className="h-4 w-4" />
          Categories
        </Button>
      </div>

      {/* Vendor Type Filter */}
      {(view === 'offerings' || view === 'wanted') && (
        <div className="flex gap-2 justify-center">
          <Button
            variant={vendorType === null ? 'default' : 'outline'}
            onClick={() => setVendorType(null)}
            size="sm"
          >
            All Vendors
          </Button>
          <Button
            variant={vendorType === 'gallery' ? 'default' : 'outline'}
            onClick={() => setVendorType('gallery')}
            size="sm"
            className="flex items-center gap-2"
          >
            <Store className="h-3 w-3" />
            Gallery Vendors
          </Button>
          <Button
            variant={vendorType === 'outside' ? 'default' : 'outline'}
            onClick={() => setVendorType('outside')}
            size="sm"
            className="flex items-center gap-2"
          >
            <Truck className="h-3 w-3" />
            Delivery Vendors
          </Button>
        </div>
      )}

      {/* Category Filter */}
      {(view === 'offerings' || view === 'wanted') && categories && (
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
      {(view === 'offerings' || view === 'wanted') && (
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
                <div className="space-y-4">
                  {view === 'wanted' ? (
                    <>
                      <Heart className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="text-gray-500">No wanted listings found. Be the first to post what you're looking for!</p>
                      <Link to="/create">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Post Wanted Listing
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Plus className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="text-gray-500">No offerings found. Try adjusting your search or filters.</p>
                      <Link to="/create">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Listing
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {listings?.total} {view} found
                </h2>
                {vendorType && (
                  <Badge variant="secondary" className="capitalize">
                    {vendorType} Vendors Only
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings?.listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'categories' && categories && (
        <CategoryGrid 
          categories={categories.categories} 
          onCategorySelect={(categoryId) => {
            setSelectedCategory(categoryId);
            setView('offerings');
          }}
        />
      )}

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">How NzimApp Works</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-2">
          <p><strong>Gallery Vendors:</strong> Physical shops in galleries - reserve items for pickup</p>
          <p><strong>Outside Vendors:</strong> Independent sellers offering delivery services</p>
          <p><strong>Share & Earn:</strong> Share listings and earn gift points from successful sales</p>
          <p><strong>Wanted Listings:</strong> Post what you're looking for and let vendors find you</p>
        </CardContent>
      </Card>
    </div>
  );
}
