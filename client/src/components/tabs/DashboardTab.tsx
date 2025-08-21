import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/lib/types";

export function DashboardTab() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back, Sarah!</h1>
          <p className="text-gray-600">Here's your career progress snapshot</p>
        </div>

        {/* Progress Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Applications Card */}
        <Card className="linkedin-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <i className="fas fa-paper-plane text-primary-600 text-lg"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Applications</p>
                  <p className="text-xl font-semibold text-gray-900" data-testid="stat-applications">
                    {stats?.applications || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <i className="fas fa-arrow-up mr-1"></i>
              <span>+3 this week</span>
            </div>
          </CardContent>
        </Card>

        {/* Interviews Card */}
        <Card className="linkedin-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="p-2 bg-green-50 rounded-lg">
                  <i className="fas fa-calendar-check text-green-600 text-lg"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Interviews</p>
                  <p className="text-xl font-semibold text-gray-900" data-testid="stat-interviews">
                    {stats?.interviews || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <i className="fas fa-arrow-up mr-1"></i>
              <span>+2 scheduled</span>
            </div>
          </CardContent>
        </Card>

        {/* Referrals Card */}
        <Card className="linkedin-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <i className="fas fa-user-friends text-orange-600 text-lg"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Referrals</p>
                  <p className="text-xl font-semibold text-gray-900" data-testid="stat-referrals">
                    {stats?.referrals || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <i className="fas fa-clock mr-1"></i>
              <span>3 pending</span>
            </div>
          </CardContent>
        </Card>

        {/* Skills Progress Card */}
        <Card className="linkedin-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <i className="fas fa-trophy text-yellow-600 text-lg"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Skills Badges</p>
                  <p className="text-xl font-semibold text-gray-900" data-testid="stat-badges">
                    {stats?.badges || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <i className="fas fa-award mr-1"></i>
              <span>1 new badge</span>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Applications */}
          <Card className="linkedin-card">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
            </div>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-inbox text-2xl mb-2 text-gray-400"></i>
                  <p className="text-sm">No recent applications to display</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="linkedin-card">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
            </div>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-tasks text-2xl mb-2 text-gray-400"></i>
                  <p className="text-sm">No upcoming tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
