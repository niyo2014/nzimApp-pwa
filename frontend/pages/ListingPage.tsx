import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Share2, MessageCircle, MapPin, Phone, Star } from 'lucide-react';
import backend from '~backend/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useEffect } from 'react';

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  const { toast } = useToast();

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (!id) throw new Error('No listing ID provided');
      return await backend.listing.getListing({ id: parseInt(id) });
    },
    enabled: !!id
  });

  useEffect(() => {
    if (referralCode) {
      backend.referral.trackClick({ referral_code: referralCode })
        .catch(console.error);
    }
  }, [referralCode]);

  const handleWhatsAppContact = () => {
    if (!listing) return;
    
    const phone = listing.shop.whatsapp || listing.shop.phone;
    const message = `Hi! I'm interested in: ${listing.title}`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: `Check out this great offer: ${listing?.title}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "The listing link has been copied to your clipboard."
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Listing not found.</p>
            <Link to="/">
              <Button className="mt-4">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Link to={`/share/${listing.id}`}>
          <Button size="sm">
            Earn by Sharing
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listing Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardContent className="p-0">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Title and Price */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{listing.title}</CardTitle>
                  {listing.category && (
                    <Badge variant="secondary">{listing.category.name}</Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {listing.price.toLocaleString()} {listing.currency}
                  </div>
                  {listing.is_boosted && (
                    <Badge variant="default" className="mt-1">
                      <Star className="h-3 w-3 mr-1" />
                      Boosted
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            {listing.description && (
              <CardContent>
                <p className="text-gray-700">{listing.description}</p>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Shop Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shop Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">{listing.shop.name}</h4>
                <p className="text-sm text-gray-600">Shop #{listing.shop.shop_number}</p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{listing.gallery.name}, {listing.gallery.zone}</span>
              </div>

              <div>
                <p className="text-sm font-medium">Owner: {listing.shop.owner_name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{listing.shop.phone}</span>
                </div>
              </div>

              {listing.shop.description && (
                <p className="text-sm text-gray-600">{listing.shop.description}</p>
              )}

              <Button 
                onClick={handleWhatsAppContact}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact via WhatsApp
              </Button>
            </CardContent>
          </Card>

          {referralCode && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <Star className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    You came here through a referral! The sharer will earn a commission if you make a purchase.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
