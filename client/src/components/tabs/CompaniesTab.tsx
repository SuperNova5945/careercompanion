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
              <div className="bg-gray-50 rounded-lg p-6 min-h-96 relative overflow-hidden">
                {/* Network Graph with Nodes */}
                <svg width="100%" height="384" viewBox="0 0 800 384" className="absolute inset-0">
                  {/* Background grid */}
                  <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="1" opacity="0.2"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Arrow markers */}
                  <defs>
                    <marker id="arrowhead" markerWidth="8" markerHeight="8" 
                     refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
                      <polygon points="1,1 1,7 7,4" fill="#374151" stroke="#374151" strokeWidth="1"/>
                    </marker>
                  </defs>
                  
                  {/* Job Change Arrows - Non-overlapping paths */}
                  
                  {/* Meta -> Google (4 moves) */}
                  <path d="M 150 80 Q 300 50 450 120" stroke="#dc2626" strokeWidth="4" fill="none" markerEnd="url(#arrowhead)" opacity="0.8"/>
                  <text x="300" y="45" textAnchor="middle" fontSize="11" fill="#dc2626" fontWeight="bold">4</text>
                  
                  {/* Microsoft -> Google (3 moves) */}
                  <path d="M 150 150 Q 300 100 450 120" stroke="#2563eb" strokeWidth="3" fill="none" markerEnd="url(#arrowhead)" opacity="0.8"/>
                  <text x="280" y="95" textAnchor="middle" fontSize="11" fill="#2563eb" fontWeight="bold">3</text>
                  
                  {/* Apple -> Microsoft (2 moves) */}
                  <path d="M 120 220 Q 100 185 150 150" stroke="#059669" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" opacity="0.8"/>
                  <text x="115" y="180" textAnchor="middle" fontSize="11" fill="#059669" fontWeight="bold">2</text>
                  
                  {/* Uber -> Apple (1 move) */}
                  <path d="M 350 280 Q 250 250 120 220" stroke="#f59e0b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" opacity="0.8"/>
                  <text x="235" y="245" textAnchor="middle" fontSize="11" fill="#f59e0b" fontWeight="bold">1</text>
                  
                  {/* Amazon -> Netflix (2 moves) */}
                  <path d="M 650 280 Q 600 250 550 220" stroke="#8b5cf6" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" opacity="0.8"/>
                  <text x="600" y="245" textAnchor="middle" fontSize="11" fill="#8b5cf6" fontWeight="bold">2</text>
                  
                  {/* Tesla -> Uber (3 moves) */}
                  <path d="M 280 320 Q 315 300 350 280" stroke="#10b981" strokeWidth="3" fill="none" markerEnd="url(#arrowhead)" opacity="0.8"/>
                  <text x="315" y="295" textAnchor="middle" fontSize="11" fill="#10b981" fontWeight="bold">3</text>
                  
                  {/* Salesforce -> Tesla (1 move) */}
                  <path d="M 450 350 Q 365 335 280 320" stroke="#f97316" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" opacity="0.8"/>
                  <text x="365" y="330" textAnchor="middle" fontSize="11" fill="#f97316" fontWeight="bold">1</text>
                  
                  {/* LinkedIn -> Salesforce (2 moves) */}
                  <path d="M 650 350 Q 550 350 450 350" stroke="#0ea5e9" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" opacity="0.8"/>
                  <text x="550" y="345" textAnchor="middle" fontSize="11" fill="#0ea5e9" fontWeight="bold">2</text>
                  
                  {/* Airbnb -> LinkedIn (1 move) */}
                  <path d="M 550 80 Q 600 215 650 350" stroke="#ec4899" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" opacity="0.8"/>
                  <text x="615" y="215" textAnchor="middle" fontSize="11" fill="#ec4899" fontWeight="bold">1</text>
                  
                  {/* Company Nodes */}
                  
                  {/* Google (largest - most incoming) */}
                  <circle cx="450" cy="120" r="35" fill="#4285f4" stroke="#ffffff" strokeWidth="3" opacity="0.95"/>
                  <text x="450" y="127" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">Google</text>
                  
                  {/* Microsoft */}
                  <circle cx="150" cy="150" r="28" fill="#00a1f1" stroke="#ffffff" strokeWidth="3" opacity="0.95"/>
                  <text x="150" y="156" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">Microsoft</text>
                  
                  {/* Apple */}
                  <circle cx="120" cy="220" r="25" fill="#007aff" stroke="#ffffff" strokeWidth="3" opacity="0.95"/>
                  <text x="120" y="226" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">Apple</text>
                  
                  {/* Meta */}
                  <circle cx="150" cy="80" r="30" fill="#1877f2" stroke="#ffffff" strokeWidth="3" opacity="0.95"/>
                  <text x="150" y="86" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">Meta</text>
                  
                  {/* Netflix */}
                  <circle cx="550" cy="220" r="22" fill="#e50914" stroke="#ffffff" strokeWidth="3" opacity="0.95"/>
                  <text x="550" y="226" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">Netflix</text>
                  
                  {/* Amazon */}
                  <circle cx="650" cy="280" r="26" fill="#ff9900" stroke="#ffffff" strokeWidth="3" opacity="0.95"/>
                  <text x="650" y="286" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">Amazon</text>
                  
                  {/* Uber */}
                  <circle cx="350" cy="280" r="24" fill="#000000" stroke="#ffffff" strokeWidth="3" opacity="0.95"/>
                  <text x="350" y="286" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">Uber</text>
                  
                  {/* Tesla */}
                  <circle cx="280" cy="320" r="26" fill="#cc0000" stroke="#ffffff" strokeWidth="3" opacity="0.95"/>
                  <text x="280" y="326" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">Tesla</text>
                  
                  {/* Salesforce */}
                  <circle cx="450" cy="350" r="24" fill="#00a1e0" stroke="#ffffff" strokeWidth="3" opacity="0.95"/>
                  <text x="450" y="356" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">Salesforce</text>
                  
                  {/* LinkedIn */}
                  <circle cx="650" cy="350" r="24" fill="#0077b5" stroke="#ffffff" strokeWidth="3" opacity="0.95"/>
                  <text x="650" y="356" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">LinkedIn</text>
                  
                  {/* Airbnb */}
                  <circle cx="550" cy="80" r="24" fill="#ff5a5f" stroke="#ffffff" strokeWidth="3" opacity="0.95"/>
                  <text x="550" y="86" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">Airbnb</text>
                </svg>
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
