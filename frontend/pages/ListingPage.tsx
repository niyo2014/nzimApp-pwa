import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Share2, MessageCircle, MapPin, Phone, Star, Edit, Trash2, Calendar, Truck } from 'lucide-react';
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

  const { data: listing, isLoading, refetch } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (!id) throw new Error('No listing ID provided');
      return await backend.listing.getListing({ id: parseInt(id) });
    },
    enabled: !!id
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('No listing ID provided');
      await backend.listing.deleteListing({ id: parseInt(id) });
    },
    onSuccess: () => {
      toast({
        title: "Listing deleted",
        description: "The listing has been successfully deleted."
      });
      window.history.back();
    },
    onError: (error) => {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (referralCode) {
      backend.referral.trackClick({ referral_code: referralCode })
        .catch(console.error);
    }
  }, [referralCode]);

  const handleWhatsAppContact = () => {
    if (!listing) return;
    
    const phone = listing.vendor.contact_number;
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

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handleReservePickup = () => {
    // Navigate to reservation form
    toast({
      title: "Reservation",
      description: "Reservation feature coming soon!"
    });
  };

  const handleBuyNow = () => {
    // Navigate to order form
    toast({
      title: "Order",
      description: "Order feature coming soon!"
    });
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

  const isWanted = listing.listing_type === 'wanted';
  const isGalleryVendor = listing.vendor.vendor_type === 'gallery';

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
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          {!isWanted && (
            <Link to={`/share/${listing.id}`}>
              <Button size="sm">
                Earn by Sharing
              </Button>
            </Link>
          )}
          
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listing Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardContent className="p-0">
              {listing.images && listing.images.length > 0 ? (
                <div className="space-y-2">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  {listing.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 p-4">
                      {listing.images.slice(1, 5).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${listing.title} ${index + 2}`}
                          className="w-full h-16 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
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
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">{listing.title}</CardTitle>
                    {isWanted && (
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        Wanted
                      </Badge>
                    )}
                    {listing.status !== 'active' && (
                      <Badge variant="outline" className="capitalize">
                        {listing.status}
                      </Badge>
                    )}
                  </div>
                  {listing.category && (
                    <Badge variant="secondary">{listing.category.name}</Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {isWanted ? 'Looking for' : `${listing.price.toLocaleString()} ${listing.currency}`}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {listing.is_boosted && (
                      <Badge variant="default">
                        <Star className="h-3 w-3 mr-1" />
                        Boosted
                      </Badge>
                    )}
                    {listing.trust_score > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Trust: {listing.trust_score}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            {listing.description && (
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold">Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Vendor Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {isWanted ? 'Buyer Information' : 'Vendor Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">{listing.vendor.name}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge variant="outline" className="capitalize">
                    {listing.vendor.vendor_type} Vendor
                  </Badge>
                  <Badge variant="outline">
                    KYC: {listing.vendor.kyc_status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>
                  {isGalleryVendor && listing.gallery_data 
                    ? `${listing.gallery_data.gallery_name} • Shop ${listing.gallery_data.shop_number}`
                    : listing.outside_data?.service_area_coverage || 'Service Area'
                  }
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{listing.vendor.contact_number}</span>
                </div>
                {listing.vendor.email && (
                  <p className="text-xs text-gray-500 mt-1">
                    Email: {listing.vendor.email}
                  </p>
                )}
              </div>

              {listing.vendor.trust_score > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">
                    <strong>Trust Score:</strong> {listing.vendor.trust_score}/100
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    This vendor has a good reputation on the platform
                  </p>
                </div>
              )}

              {!listing.contact_hidden && listing.status === 'active' && (
                <div className="space-y-2">
                  {isGalleryVendor ? (
                    <Button 
                      onClick={handleReservePickup}
                      className="w-full"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Reserve & Pickup
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleBuyNow}
                      className="w-full"
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Buy Now (Delivery)
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleWhatsAppContact}
                    variant="outline"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact via WhatsApp
                  </Button>
                </div>
              )}

              {listing.contact_hidden && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    Contact information is hidden. Pay a small fee to reveal.
                  </p>
                  <Button size="sm" className="mt-2 w-full">
                    Reveal Contact (500 BIF)
                  </Button>
                </div>
              )}

              {listing.status !== 'active' && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                  <p className="text-sm text-gray-600">
                    This listing is currently {listing.status} and not available for purchase.
                  </p>
                </div>
              )}
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

          {/* Listing Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Listing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Posted:</span>
                <span>{new Date(listing.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Updated:</span>
                <span>{new Date(listing.updated_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span>{listing.duration_days} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant={listing.is_active ? "default" : "secondary"}>
                  {listing.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="capitalize">{listing.listing_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vendor Type:</span>
                <span className="capitalize">{listing.vendor.vendor_type}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
