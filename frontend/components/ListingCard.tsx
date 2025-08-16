import { Link } from 'react-router-dom';
import { MapPin, Star, Share2, Heart, Eye, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ListingWithDetails } from '~backend/listing/types';

interface ListingCardProps {
  listing: ListingWithDetails;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const isWanted = listing.listing_type === 'wanted';
  const isGalleryVendor = listing.vendor.vendor_type === 'gallery';
  
  const getStatusIcon = () => {
    switch (listing.status) {
      case 'reserved':
        return <Clock className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = () => {
    switch (listing.status) {
      case 'reserved':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };
  
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
              {isWanted ? (
                <Heart className="h-12 w-12 text-gray-400" />
              ) : (
                <span className="text-gray-400">No image</span>
              )}
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
            <div className="flex gap-1 ml-2 flex-wrap">
              {listing.is_boosted && (
                <Badge variant="default">
                  <Star className="h-3 w-3 mr-1" />
                  Boosted
                </Badge>
              )}
              {isWanted && (
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  <Heart className="h-3 w-3 mr-1" />
                  Wanted
                </Badge>
              )}
              {listing.status !== 'active' && (
                <Badge variant="secondary" className={getStatusColor()}>
                  {getStatusIcon()}
                  <span className="ml-1 capitalize">{listing.status}</span>
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-xl font-bold text-green-600">
            {isWanted ? 'Looking for' : `${listing.price.toLocaleString()} ${listing.currency}`}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {listing.category && (
              <Badge variant="secondary">{listing.category.name}</Badge>
            )}
            {listing.trust_score > 0 && (
              <Badge variant="outline" className="text-xs">
                Trust: {listing.trust_score}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {isGalleryVendor ? 'Gallery' : 'Delivery'}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>
              {isGalleryVendor && listing.gallery_data 
                ? `${listing.gallery_data.gallery_name} • Shop ${listing.gallery_data.shop_number}`
                : listing.outside_data?.service_area_coverage || 'Service Area'
              }
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            <span className="font-medium">Vendor:</span> {listing.vendor?.name || 'Unknown Vendor'}
            {listing.vendor?.trust_score > 0 && (
              <span className="ml-2 text-xs">
                (Trust Score: {listing.vendor.trust_score})
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Link to={`/listing/${listing.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </Link>
            {!isWanted && listing.status === 'active' && (
              <Link to={`/share/${listing.id}`}>
                <Button size="sm" className="flex items-center gap-1">
                  <Share2 className="h-3 w-3" />
                  Share & Earn
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
