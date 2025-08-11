import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Phone, Store } from 'lucide-react';
import backend from '~backend/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ListingCard from '../components/ListingCard';

export default function GalleryPage() {
  const { id } = useParams<{ id: string }>();

  const { data: shops } = useQuery({
    queryKey: ['shops', id],
    queryFn: async () => {
      if (!id) throw new Error('No gallery ID provided');
      return await backend.listing.listShops({ gallery_id: parseInt(id) });
    },
    enabled: !!id
  });

  const { data: listings } = useQuery({
    queryKey: ['listings', 'gallery', id],
    queryFn: async () => {
      if (!id) throw new Error('No gallery ID provided');
      return await backend.listing.listListings({ gallery_id: parseInt(id) });
    },
    enabled: !!id
  });

  const { data: galleries } = useQuery({
    queryKey: ['galleries'],
    queryFn: () => backend.listing.listGalleries()
  });

  const gallery = galleries?.galleries.find(g => g.id === parseInt(id || '0'));

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      {/* Gallery Info */}
      {gallery && (
        <Card>
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
                <p className="text-gray-600">{gallery.description}</p>
              )}
              {gallery.latitude && gallery.longitude && (
                <p className="text-sm text-gray-500">
                  Location: {gallery.latitude.toFixed(4)}, {gallery.longitude.toFixed(4)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shops */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Shops ({shops?.shops.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shops?.shops.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No shops found in this gallery.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shops?.shops.map((shop) => (
                <Card key={shop.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{shop.name}</CardTitle>
                    <Badge variant="outline">Shop #{shop.shop_number}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Owner:</strong> {shop.owner_name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{shop.phone}</span>
                      </div>
                      {shop.description && (
                        <p className="text-sm text-gray-600">{shop.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Listings */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Listings ({listings?.listings.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {listings?.listings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No listings found in this gallery.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings?.listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
