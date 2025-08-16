import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Share2, Copy, MessageCircle, Gift } from 'lucide-react';
import backend from '~backend/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function SharePage() {
  const { listingId } = useParams<{ listingId: string }>();
  const [sharerName, setSharerName] = useState('');
  const [sharerPhone, setSharerPhone] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const { toast } = useToast();

  const { data: listing } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      if (!listingId) throw new Error('No listing ID provided');
      return await backend.listing.getListing({ id: parseInt(listingId) });
    },
    enabled: !!listingId
  });

  const createReferralMutation = useMutation({
    mutationFn: async () => {
      if (!listingId || !sharerName || !sharerPhone) {
        throw new Error('Please fill in all fields');
      }
      return await backend.referral.createReferral({
        listing_id: parseInt(listingId),
        sharer_name: sharerName,
        sharer_phone: sharerPhone
      });
    },
    onSuccess: (data) => {
      setReferralLink(data.whatsapp_link);
      toast({
        title: "Referral link created!",
        description: "You can now share this link and earn gifts points."
      });
    },
    onError: (error) => {
      console.error('Error creating referral:', error);
      toast({
        title: "Error",
        description: "Failed to create referral link. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    createReferralMutation.mutate();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard."
    });
  };

  const shareViaWhatsApp = () => {
    if (referralLink) {
      window.open(referralLink, '_blank');
    }
  };

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/listing/${listingId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listing
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-600" />
              Earn Gifts Points by Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">How it works:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Share this listing with your network</li>
                <li>• When someone buys through your link, you earn 100 gifts points</li>
                <li>• Track your earnings in the referral dashboard</li>
                <li>• Build your trust score with successful referrals</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Listing: {listing.title}</h4>
              <p className="text-sm text-gray-600 mb-2">Price: {listing.price.toLocaleString()} {listing.currency}</p>
              <p className="text-sm text-gray-600">Vendor: {listing.vendor?.name || 'Unknown Vendor'}</p>
            </div>
          </CardContent>
        </Card>

        {!referralLink ? (
          <Card>
            <CardHeader>
              <CardTitle>Create Your Referral Link</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateReferral} className="space-y-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={sharerName}
                    onChange={(e) => setSharerName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Your Phone Number</Label>
                  <Input
                    id="phone"
                    value={sharerPhone}
                    onChange={(e) => setSharerPhone(e.target.value)}
                    placeholder="e.g., +25779123456"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createReferralMutation.isPending}
                >
                  {createReferralMutation.isPending ? 'Creating...' : 'Create Referral Link'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Link is Ready!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>WhatsApp Share Link</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={referralLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(referralLink)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={shareViaWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Share via WhatsApp
                </Button>
                <Button variant="outline" onClick={() => copyToClipboard(referralLink)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>

              <div className="text-center">
                <Link to="/referrals">
                  <Button variant="link">
                    View Your Referral Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
