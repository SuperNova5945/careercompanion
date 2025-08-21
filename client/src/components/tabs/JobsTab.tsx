import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { JobWithCompany, JobMatchAnalysis } from "@/lib/types";

export function JobsTab() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("best-match");

  const { data: jobs, isLoading } = useQuery<JobWithCompany[]>({
    queryKey: ["/api/jobs"],
  });

  const analyzeJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiRequest("POST", `/api/jobs/${jobId}/analyze`, {});
      return response.json();
    },
  });

  const handleJobSelect = (job: JobWithCompany) => {
    setSelectedJobId(job.id);
    analyzeJobMutation.mutate(job.id);
  };

  const selectedJob = jobs?.find(job => job.id === selectedJobId);
  const analysis = analyzeJobMutation.data as JobMatchAnalysis | undefined;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 h-32"></div>
              ))}
            </div>
            <div className="bg-white rounded-lg p-6 h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Match Evaluation</h1>
        <p className="text-gray-600">AI-powered job matching and qualification analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Listings */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Available Positions</h3>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48" data-testid="select-sort-jobs">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="best-match">Best Match</SelectItem>
                    <SelectItem value="most-recent">Most Recent</SelectItem>
                    <SelectItem value="highest-salary">Highest Salary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {jobs?.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <i className="fas fa-search text-3xl mb-2"></i>
                  <p>No jobs available at the moment</p>
                </div>
              ) : (
                jobs?.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => handleJobSelect(job)}
                    className={cn(
                      "p-6 hover:bg-gray-50 cursor-pointer transition-colors",
                      selectedJobId === job.id && "bg-primary-50 border-primary-200"
                    )}
                    data-testid={`job-item-${job.id}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h4>
                        <p className="text-gray-600 mb-2">{job.company.name} • {job.location}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {job.salaryMin && job.salaryMax && (
                            <span>
                              <i className="fas fa-dollar-sign mr-1"></i>
                              ${job.salaryMin / 1000}k - ${job.salaryMax / 1000}k
                            </span>
                          )}
                          <span>
                            <i className="fas fa-clock mr-1"></i>
                            {job.type}
                          </span>
                          <span>
                            <i className="fas fa-map-marker-alt mr-1"></i>
                            {job.workMode}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600 mb-1">
                          {Math.floor(Math.random() * 30) + 70}%
                        </div>
                        <div className="text-sm text-gray-500">Match Score</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {job.skills?.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="link" size="sm" className="text-primary-600">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Job Details Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedJob ? "Qualification Breakdown" : "Job Analysis"}
              </h3>
            </div>
            <CardContent className="p-6 space-y-6">
              {selectedJob && analysis ? (
                <>
                  {/* Skills Match */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Skills Match</h4>
                    <div className="space-y-3">
                      {analysis.skillsMatch?.slice(0, 3).map((skillMatch, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{skillMatch.skill}</span>
                            <span className={cn(
                              "font-medium",
                              skillMatch.match ? "text-success-600" : "text-warning-600"
                            )}>
                              {skillMatch.userLevel}
                            </span>
                          </div>
                          <Progress 
                            value={skillMatch.match ? 95 : 70} 
                            className="h-2"
                          />
                        </div>
                      )) || (
                        <div className="text-sm text-gray-500">
                          Analyzing skills match...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gap Analysis */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Skill Gaps</h4>
                    <div className="space-y-2">
                      {analysis.gaps?.length > 0 ? (
                        analysis.gaps.slice(0, 2).map((gap, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                            <span className="text-gray-700">{gap}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No significant gaps identified</div>
                      )}
                    </div>
                  </div>

                  {/* Next Actions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recommended Actions</h4>
                    <div className="space-y-3">
                      <Button className="w-full" data-testid="button-apply-now">
                        <i className="fas fa-paper-plane mr-2"></i>
                        Apply Now
                      </Button>
                      <Button variant="outline" className="w-full bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" data-testid="button-request-referral">
                        <i className="fas fa-user-friends mr-2"></i>
                        Request Referral
                      </Button>
                      <Button variant="outline" className="w-full" data-testid="button-save-job">
                        <i className="fas fa-bookmark mr-2"></i>
                        Save for Later
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-mouse-pointer text-3xl mb-2"></i>
                  <p>Select a job to view analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
