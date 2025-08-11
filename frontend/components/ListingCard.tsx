import { Link } from 'react-router-dom';
import { MapPin, Star, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ListingWithDetails } from '~backend/listing/types';

interface ListingCardProps {
  listing: ListingWithDetails;
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <Link to={`/listing/${listing.id}`}>
        <CardContent className="p-0">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </CardContent>
      </Link>
      
      <CardHeader className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <Link to={`/listing/${listing.id}`}>
              <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors line-clamp-2">
                {listing.title}
              </h3>
            </Link>
            {listing.is_boosted && (
              <Badge variant="default" className="ml-2">
                <Star className="h-3 w-3 mr-1" />
                Boosted
              </Badge>
            )}
          </div>
          
          <div className="text-xl font-bold text-green-600">
            {listing.price.toLocaleString()} {listing.currency}
          </div>
          
          {listing.category && (
            <Badge variant="secondary">{listing.category.name}</Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{listing.shop.name} • {listing.gallery.zone}</span>
          </div>
          
          <div className="flex gap-2">
            <Link to={`/listing/${listing.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </Link>
            <Link to={`/share/${listing.id}`}>
              <Button size="sm" className="flex items-center gap-1">
                <Share2 className="h-3 w-3" />
                Share & Earn
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
