import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Eye, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import backend from '~backend/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ReferralDashboard() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchPhone, setSearchPhone] = useState('');

  const { data: referrals, isLoading } = useQuery({
    queryKey: ['referrals', searchPhone],
    queryFn: async () => {
      if (!searchPhone) return { referrals: [] };
      return await backend.referral.listReferrals({ sharer_phone: searchPhone });
    },
    enabled: !!searchPhone
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchPhone(phoneNumber);
  };

  const totalEarnings = referrals?.referrals.reduce((sum, ref) => 
    ref.is_sale_confirmed ? sum + ref.commission_amount : sum, 0
  ) || 0;

  const totalClicks = referrals?.referrals.reduce((sum, ref) => sum + ref.clicks, 0) || 0;
  const confirmedSales = referrals?.referrals.filter(ref => ref.is_sale_confirmed).length || 0;
  const pendingReferrals = referrals?.referrals.filter(ref => !ref.is_sale_confirmed).length || 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Referral Dashboard</h1>
        <p className="text-gray-600">Track your earnings and referral performance</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>View Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="phone">Enter your phone number</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., +25779123456"
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit">Search</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {searchPhone && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-600">
                      {totalEarnings.toLocaleString()} BIF
                    </p>
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
                  <CheckCircle className="h-5 w-5 text-green-600" />
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
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{pendingReferrals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referrals List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : referrals?.referrals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No referrals found for this phone number.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Start sharing listings to earn commissions!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {referrals?.referrals.map((referral) => (
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
                            {referral.commission_amount.toLocaleString()} BIF
                          </div>
                          <Badge 
                            variant={referral.is_sale_confirmed ? "default" : "secondary"}
                          >
                            {referral.is_sale_confirmed ? "Confirmed" : "Pending"}
                          </Badge>
                          {referral.confirmed_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              Confirmed: {new Date(referral.confirmed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
