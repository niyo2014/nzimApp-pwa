import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, DollarSign, Eye, Settings, BarChart3, Shield } from 'lucide-react';
import backend from '~backend/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => backend.admin.getAnalytics()
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => backend.user.listUsers({ limit: 10 })
  });

  const { data: listings } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: () => backend.listing.listListings({ limit: 10 })
  });

  const { data: referrals } = useQuery({
    queryKey: ['admin-referrals'],
    queryFn: () => backend.referral.listReferrals({})
  });

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
                <p className="text-2xl font-bold text-blue-600">{analytics?.total_users || 0}</p>
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
                <p className="text-2xl font-bold text-green-600">{analytics?.total_listings || 0}</p>
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
                <p className="text-2xl font-bold text-purple-600">{analytics?.total_clicks || 0}</p>
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
                <p className="text-2xl font-bold text-orange-600">{analytics?.total_sales || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analytics?.recent_activity.new_users_today || 0}
              </div>
              <p className="text-sm text-blue-700">New Users</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analytics?.recent_activity.new_listings_today || 0}
              </div>
              <p className="text-sm text-green-700">New Listings</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {analytics?.recent_activity.sales_today || 0}
              </div>
              <p className="text-sm text-orange-700">Sales Today</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
            {Object.entries(analytics?.users_by_type || {}).map(([type, count]) => (
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

      {/* Categories Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Listings by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics?.listings_by_category || {}).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm font-medium">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (count / (analytics?.total_listings || 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
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
            {users?.users.slice(0, 5).map((user) => (
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

      {/* Recent Listings for Moderation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recent Listings (Moderation)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {listings?.listings.slice(0, 5).map((listing) => (
              <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">{listing.title}</h4>
                  <p className="text-sm text-gray-600">
                    {listing.shop.name} • {listing.price.toLocaleString()} {listing.currency}
                  </p>
                  <p className="text-xs text-gray-500">
                    Posted: {new Date(listing.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive">
                    Reject
                  </Button>
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
              <div className="text-2xl font-bold text-green-600">
                {analytics?.total_referrals || 0}
              </div>
              <p className="text-sm text-green-700">Total Referrals</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analytics?.conversion_rate.toFixed(1) || 0}%
              </div>
              <p className="text-sm text-blue-700">Conversion Rate</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {referrals?.referrals.filter(r => !r.is_sale_confirmed).length || 0}
              </div>
              <p className="text-sm text-purple-700">Pending Referrals</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
