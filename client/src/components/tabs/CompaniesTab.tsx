import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mockCompanies = [
  {
    id: "1",
    name: "Google",
    industry: "Technology",
    connectionsCount: 8,
    openPositions: 12,
    matchScore: 85,
    growth: null,
    newPositions: null,
    hasLocation: true,
  },
  {
    id: "2",
    name: "Microsoft",
    industry: "Technology",
    connectionsCount: 6,
    openPositions: 8,
    matchScore: 78,
    growth: null,
    newPositions: null,
    hasLocation: true,
  },
  {
    id: "3",
    name: "Apple",
    industry: "Technology",
    connectionsCount: 5,
    openPositions: 15,
    matchScore: 92,
    growth: null,
    newPositions: null,
    hasLocation: true,
  },
];

const mockTrendingCompanies = [
  {
    id: "4",
    name: "Stripe",
    industry: "Fintech",
    growth: "+45%",
    newPositions: 23,
    hasLocation: true,
  },
  {
    id: "5",
    name: "Notion",
    industry: "Productivity",
    growth: "+38%",
    newPositions: 18,
    hasLocation: true,
  },
  {
    id: "6",
    name: "Figma",
    industry: "Design",
    growth: "+33%",
    newPositions: 12,
    hasLocation: true,
  },
];

export function CompaniesTab() {
  const [activeSubTab, setActiveSubTab] = useState("connections");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Target Companies</h1>
        <p className="text-gray-600">Discover companies where your network connections have moved</p>
      </div>

      {/* Sub Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveSubTab("connections")}
              className={cn(
                "whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm",
                activeSubTab === "connections"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
              data-testid="tab-connections-moves"
            >
              <i className="fas fa-network-wired mr-2"></i>
              Connections' Moves
            </button>
            <button
              onClick={() => setActiveSubTab("trending")}
              className={cn(
                "whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm",
                activeSubTab === "trending"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
              data-testid="tab-trending-companies"
            >
              <i className="fas fa-trending-up mr-2"></i>
              Trending Companies
            </button>
          </nav>
        </div>
      </div>

      {/* Connections' Moves Content */}
      {activeSubTab === "connections" && (
        <div>
          {/* Network Visualization */}
          <Card className="mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Network Job Changes Visualization</h3>
              <p className="text-sm text-gray-600">Companies where your 1st-degree connections moved in the last year</p>
            </div>
            <CardContent className="p-6">
              <div className="bg-gray-50 rounded-lg p-8 text-center min-h-96 flex items-center justify-center">
                <div>
                  <i className="fas fa-project-diagram text-6xl text-gray-400 mb-4"></i>
                  <p className="text-gray-600 mb-4">Interactive network visualization will appear here</p>
                  <p className="text-sm text-gray-500">Node sizes represent number of connections, edge thickness shows job change frequency</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connection Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCompanies.map((company) => (
              <Card key={company.id}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                      <i className="fas fa-building text-primary-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{company.name}</h4>
                      <p className="text-sm text-gray-600">{company.industry}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Connections moved here:</span>
                      <span className="font-semibold text-gray-900">{company.connectionsCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Open positions:</span>
                      <span className="font-semibold text-success-600">{company.openPositions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Match score:</span>
                      <span className="font-semibold text-primary-600">{company.matchScore}%</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    size="sm"
                    data-testid={`button-view-jobs-${company.name.toLowerCase()}`}
                  >
                    View Jobs & Connections
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Trending Companies Content */}
      {activeSubTab === "trending" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTrendingCompanies.map((company) => (
            <Card key={company.id}>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-rocket text-green-600"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{company.name}</h4>
                    <p className="text-sm text-gray-600">{company.industry}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hiring growth:</span>
                    <span className="font-semibold text-success-600">{company.growth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New positions:</span>
                    <span className="font-semibold text-gray-900">{company.newPositions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Your location:</span>
                    <span className="font-semibold text-primary-600">{company.hasLocation ? "Yes" : "No"}</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 bg-success-600 hover:bg-success-700" 
                  size="sm"
                  data-testid={`button-explore-${company.name.toLowerCase()}`}
                >
                  Explore Opportunities
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
