import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, TrendingUp, Heart, Settings, Plus, Eye } from 'lucide-react';
import backend from '~backend/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UserDashboard() {
  const [userPhone, setUserPhone] = useState('');
  const [searchPhone, setSearchPhone] = useState('');

  const { data: userReferrals } = useQuery({
    queryKey: ['user-referrals', searchPhone],
    queryFn: async () => {
      if (!searchPhone) return { referrals: [] };
      return await backend.referral.listReferrals({ sharer_phone: searchPhone });
    },
    enabled: !!searchPhone
  });

  const { data: userListings } = useQuery({
    queryKey: ['user-listings', searchPhone],
    queryFn: async () => {
      if (!searchPhone) return { listings: [], total: 0 };
      return await backend.listing.listListings({ limit: 50 });
    },
    enabled: !!searchPhone
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchPhone(userPhone);
  };

  const totalGiftsPoints = userReferrals?.referrals.reduce((sum, ref) => 
    ref.is_sale_confirmed ? sum + ref.gifts_points_earned : sum, 0
  ) || 0;

  const totalClicks = userReferrals?.referrals.reduce((sum, ref) => sum + ref.clicks, 0) || 0;
  const confirmedSales = userReferrals?.referrals.filter(ref => ref.is_sale_confirmed).length || 0;
  const pendingReferrals = userReferrals?.referrals.filter(ref => !ref.is_sale_confirmed).length || 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">User Dashboard</h1>
        <p className="text-gray-600">Manage your listings, referrals, and earnings</p>
      </div>

      {/* User Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Access Your Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="phone">Enter your phone number</Label>
              <Input
                id="phone"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="e.g., +25779123456"
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit">Access Dashboard</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Dashboard Content */}
      {searchPhone && (
        <>
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col items-center gap-2">
              <Plus className="h-6 w-6" />
              <span>Create Listing</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
              <Heart className="h-6 w-6" />
              <span>Post Wanted</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
              <Settings className="h-6 w-6" />
              <span>Settings</span>
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Gifts Points</p>
                    <p className="text-2xl font-bold text-green-600">{totalGiftsPoints}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Clicks</p>
                    <p className="text-2xl font-bold text-blue-600">{totalClicks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Confirmed Sales</p>
                    <p className="text-2xl font-bold text-green-600">{confirmedSales}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{pendingReferrals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Referrals */}
          <Card>
            <CardHeader>
              <CardTitle>Your Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              {userReferrals?.referrals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No referrals found.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Start sharing listings to earn gifts points!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userReferrals?.referrals.slice(0, 5).map((referral) => (
                    <div key={referral.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{referral.listing_title}</h4>
                          <p className="text-sm text-gray-600">
                            Code: {referral.referral_code}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>{referral.clicks} clicks</span>
                            <span>Created: {new Date(referral.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {referral.gifts_points_earned} points
                          </div>
                          <Badge 
                            variant={referral.is_sale_confirmed ? "default" : "secondary"}
                          >
                            {referral.is_sale_confirmed ? "Confirmed" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Type Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">User Roles in NzimApp</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700 space-y-2">
              <p><strong>Vendor:</strong> Post offerings and manage your shop listings</p>
              <p><strong>Buyer:</strong> Browse offerings and post wanted listings</p>
              <p><strong>Sharer:</strong> Share listings and earn gifts points from sales</p>
              <p><strong>Reseller:</strong> Purchase ad plans and resell to vendors</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
