import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, DollarSign, Eye, Settings, BarChart3 } from 'lucide-react';
import backend from '~backend/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => backend.user.listUsers({ limit: 100 })
  });

  const { data: listings } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: () => backend.listing.listListings({ limit: 100 })
  });

  const { data: referrals } = useQuery({
    queryKey: ['admin-referrals'],
    queryFn: () => backend.referral.listReferrals({})
  });

  const usersByType = users?.users.reduce((acc, user) => {
    acc[user.user_type] = (acc[user.user_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const totalGiftsPoints = users?.users.reduce((sum, user) => sum + user.gifts_points, 0) || 0;
  const totalClicks = referrals?.referrals.reduce((sum, ref) => sum + ref.clicks, 0) || 0;
  const confirmedSales = referrals?.referrals.filter(ref => ref.is_sale_confirmed).length || 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management</p>
        </div>
        <Button className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          System Settings
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{users?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Listings</p>
                <p className="text-2xl font-bold text-green-600">{listings?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-purple-600">{totalClicks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Confirmed Sales</p>
                <p className="text-2xl font-bold text-orange-600">{confirmedSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Users by Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(usersByType).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <Badge variant="secondary" className="capitalize">
                  {type}s
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.users.slice(0, 10).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.phone}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="capitalize">
                    {user.user_type}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    Trust: {user.trust_score} | Points: {user.gifts_points}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalGiftsPoints}</div>
              <p className="text-sm text-green-700">Total Gifts Points</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {((confirmedSales / (totalClicks || 1)) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-blue-700">Conversion Rate</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {referrals?.referrals.length || 0}
              </div>
              <p className="text-sm text-purple-700">Active Referrals</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
