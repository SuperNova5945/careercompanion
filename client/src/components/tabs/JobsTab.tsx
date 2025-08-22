import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIChatAssistant } from "@/components/chat/AIChatAssistant";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { JobWithCompany, JobMatchAnalysis } from "@/lib/types";

// Mock qualification analysis data
const mockAnalysis: Record<string, JobMatchAnalysis> = {
  "1": {
    matchScore: 87,
    skillsMatch: [
      { skill: "Kubernetes", userLevel: "advanced", required: true, match: true },
      { skill: "AWS", userLevel: "expert", required: true, match: true },
      { skill: "Go", userLevel: "intermediate", required: true, match: true },
      { skill: "Python", userLevel: "advanced", required: false, match: true },
      { skill: "Distributed Systems", userLevel: "advanced", required: true, match: true },
      { skill: "Microservices", userLevel: "intermediate", required: false, match: true }
    ],
    gaps: ["Terraform experience", "GCP certification"],
    recommendations: ["Consider getting GCP certification", "Build more Terraform projects", "Lead a microservices migration"]
  },
  "2": {
    matchScore: 92,
    skillsMatch: [
      { skill: "TensorFlow", userLevel: "expert", required: true, match: true },
      { skill: "PyTorch", userLevel: "advanced", required: true, match: true },
      { skill: "Kubernetes", userLevel: "advanced", required: true, match: true },
      { skill: "Python", userLevel: "expert", required: true, match: true },
      { skill: "Spark", userLevel: "intermediate", required: false, match: true },
      { skill: "MLOps", userLevel: "advanced", required: true, match: true }
    ],
    gaps: ["Research publications", "Large-scale model deployment"],
    recommendations: ["Publish ML research papers", "Lead model deployment at scale", "Contribute to open-source ML frameworks"]
  },
  "3": {
    matchScore: 78,
    skillsMatch: [
      { skill: "iOS", userLevel: "advanced", required: true, match: true },
      { skill: "Android", userLevel: "intermediate", required: true, match: true },
      { skill: "React Native", userLevel: "intermediate", required: false, match: true },
      { skill: "Swift", userLevel: "advanced", required: true, match: true },
      { skill: "Kotlin", userLevel: "beginner", required: true, match: false },
      { skill: "Mobile Architecture", userLevel: "intermediate", required: true, match: true }
    ],
    gaps: ["Kotlin proficiency", "Cross-platform architecture", "Performance optimization"],
    recommendations: ["Improve Kotlin skills", "Build cross-platform apps", "Study mobile performance optimization"]
  },
  "4": {
    matchScore: 95,
    skillsMatch: [
      { skill: "Deep Learning", userLevel: "expert", required: true, match: true },
      { skill: "PyTorch", userLevel: "expert", required: true, match: true },
      { skill: "Research", userLevel: "advanced", required: true, match: true },
      { skill: "NLP", userLevel: "expert", required: true, match: true },
      { skill: "Computer Vision", userLevel: "advanced", required: false, match: true },
      { skill: "MLOps", userLevel: "advanced", required: false, match: true }
    ],
    gaps: ["PhD degree", "First-author publications"],
    recommendations: ["Publish in top-tier conferences", "Lead breakthrough research projects", "Collaborate with academic institutions"]
  },
  "5": {
    matchScore: 84,
    skillsMatch: [
      { skill: "Azure", userLevel: "advanced", required: true, match: true },
      { skill: "Go", userLevel: "intermediate", required: true, match: true },
      { skill: "Rust", userLevel: "beginner", required: false, match: false },
      { skill: "Distributed Systems", userLevel: "advanced", required: true, match: true },
      { skill: "Networking", userLevel: "intermediate", required: true, match: true },
      { skill: "Cloud Architecture", userLevel: "advanced", required: true, match: true }
    ],
    gaps: ["Rust proficiency", "Azure certifications", "Network security"],
    recommendations: ["Learn Rust programming", "Get Azure architect certification", "Study network security protocols"]
  },
  "6": {
    matchScore: 73,
    skillsMatch: [
      { skill: "C++", userLevel: "intermediate", required: true, match: true },
      { skill: "Computer Vision", userLevel: "advanced", required: true, match: true },
      { skill: "Robotics", userLevel: "beginner", required: true, match: false },
      { skill: "ROS", userLevel: "beginner", required: true, match: false },
      { skill: "Machine Learning", userLevel: "advanced", required: true, match: true },
      { skill: "Real-time Systems", userLevel: "intermediate", required: true, match: true }
    ],
    gaps: ["Robotics experience", "ROS framework", "Automotive domain knowledge"],
    recommendations: ["Build robotics projects", "Learn ROS framework", "Study autonomous vehicle algorithms"]
  }
};

// Mock data for senior tech positions
const mockJobs: JobWithCompany[] = [
  {
    id: "1",
    title: "Staff Software Engineer - Infrastructure",
    description: "Lead infrastructure initiatives and mentor engineering teams in building scalable distributed systems.",
    requirements: "8+ years experience, Kubernetes, AWS/GCP, Go/Python, distributed systems expertise",
    salaryMin: 280000,
    salaryMax: 350000,
    location: "San Francisco, CA",
    type: "Full-time",
    workMode: "Hybrid",
    skills: ["Kubernetes", "AWS", "Go", "Python", "Distributed Systems", "Microservices"],
    isActive: true,
    createdAt: new Date("2024-01-15"),
    companyId: "google",
    company: {
      id: "google",
      name: "Google",
      industry: "Technology",
      location: "Mountain View, CA",
      size: "10,000+",
      website: "https://google.com",
      description: "Leading technology company focused on search, cloud, and AI"
    }
  },
  {
    id: "2",
    title: "Senior Staff Engineer - Machine Learning Platform",
    description: "Build and scale ML infrastructure serving billions of users. Lead cross-functional ML initiatives.",
    requirements: "10+ years experience, ML systems, TensorFlow/PyTorch, large-scale data processing",
    salaryMin: 320000,
    salaryMax: 420000,
    location: "Seattle, WA",
    type: "Full-time",
    workMode: "Remote",
    skills: ["TensorFlow", "PyTorch", "Kubernetes", "Python", "Spark", "MLOps"],
    isActive: true,
    createdAt: new Date("2024-01-12"),
    companyId: "meta",
    company: {
      id: "meta",
      name: "Meta",
      industry: "Social Media & Technology",
      location: "Menlo Park, CA",
      size: "10,000+",
      website: "https://meta.com",
      description: "Building the future of social connection and the metaverse"
    }
  },
  {
    id: "3",
    title: "Staff Software Engineer - Mobile Applications",
    description: "Lead iOS/Android development for consumer-facing applications with millions of users.",
    requirements: "8+ years mobile development, iOS/Android, React Native, performance optimization",
    salaryMin: 270000,
    salaryMax: 340000,
    location: "Cupertino, CA",
    type: "Full-time",
    workMode: "On-site",
    skills: ["iOS", "Android", "React Native", "Swift", "Kotlin", "Mobile Architecture"],
    isActive: true,
    createdAt: new Date("2024-01-10"),
    companyId: "apple",
    company: {
      id: "apple",
      name: "Apple",
      industry: "Consumer Electronics & Technology",
      location: "Cupertino, CA",
      size: "10,000+",
      website: "https://apple.com",
      description: "Innovative technology company creating life-changing products"
    }
  },
  {
    id: "4",
    title: "Senior Staff Engineer - AI/ML Research",
    description: "Drive cutting-edge AI research and deploy models at scale. Collaborate with research scientists.",
    requirements: "PhD or 10+ years experience, deep learning, research background, publications preferred",
    salaryMin: 350000,
    salaryMax: 450000,
    location: "Palo Alto, CA",
    type: "Full-time",
    workMode: "Hybrid",
    skills: ["Deep Learning", "PyTorch", "Research", "NLP", "Computer Vision", "MLOps"],
    isActive: true,
    createdAt: new Date("2024-01-08"),
    companyId: "openai",
    company: {
      id: "openai",
      name: "OpenAI",
      industry: "Artificial Intelligence",
      location: "San Francisco, CA",
      size: "1,000-5,000",
      website: "https://openai.com",
      description: "AI research company developing safe and beneficial artificial general intelligence"
    }
  },
  {
    id: "5",
    title: "Staff Software Engineer - Cloud Infrastructure",
    description: "Build and operate planet-scale cloud infrastructure. Lead technical strategy for compute services.",
    requirements: "8+ years experience, distributed systems, cloud platforms, Go/Rust, networking",
    salaryMin: 290000,
    salaryMax: 380000,
    location: "Redmond, WA",
    type: "Full-time",
    workMode: "Hybrid",
    skills: ["Azure", "Go", "Rust", "Distributed Systems", "Networking", "Cloud Architecture"],
    isActive: true,
    createdAt: new Date("2024-01-05"),
    companyId: "microsoft",
    company: {
      id: "microsoft",
      name: "Microsoft",
      industry: "Technology & Cloud Services",
      location: "Redmond, WA",
      size: "10,000+",
      website: "https://microsoft.com",
      description: "Leading technology company empowering organizations with cloud and productivity solutions"
    }
  },
  {
    id: "6",
    title: "Senior Staff Engineer - Autonomous Vehicles",
    description: "Lead software development for self-driving car technology. Work on perception, planning, and control systems.",
    requirements: "10+ years experience, robotics, computer vision, C++, real-time systems",
    salaryMin: 310000,
    salaryMax: 400000,
    location: "Austin, TX",
    type: "Full-time",
    workMode: "On-site",
    skills: ["C++", "Computer Vision", "Robotics", "ROS", "Machine Learning", "Real-time Systems"],
    isActive: true,
    createdAt: new Date("2024-01-03"),
    companyId: "tesla",
    company: {
      id: "tesla",
      name: "Tesla",
      industry: "Automotive & Energy",
      location: "Austin, TX",
      size: "10,000+",
      website: "https://tesla.com",
      description: "Accelerating the world's transition to sustainable energy and autonomous transportation"
    }
  }
];

export function JobsTab() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("best-match");
  const [showAIChat, setShowAIChat] = useState(false);
  const { toast } = useToast();

  const { data: apiJobs, isLoading } = useQuery<JobWithCompany[]>({
    queryKey: ["/api/jobs"],
  });

  // Use mock data if no API data is available
  const jobs = apiJobs && apiJobs.length > 0 ? apiJobs : mockJobs;

  const analyzeJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      // Try API first, fallback to mock data
      try {
        const response = await apiRequest("POST", `/api/jobs/${jobId}/analyze`, {});
        return response.json();
      } catch (error) {
        // Return mock analysis if API fails
        return mockAnalysis[jobId] || null;
      }
    },
  });

  const handleJobSelect = (job: JobWithCompany) => {
    setSelectedJobId(job.id);
    analyzeJobMutation.mutate(job.id);
  };

  const handlePolishResume = async () => {
    if (selectedJob) {
      try {
        // Get the user's current resume data from localStorage or API
        let resumeData = null;
        
        // Try to get resume from localStorage first (from ResumeTab)
        const storedResume = localStorage.getItem('generatedResume');
        if (storedResume) {
          const parsedResume = JSON.parse(storedResume);
          resumeData = parsedResume.content;
        }
        
        // If no resume found, create a basic structure for polishing suggestions
        if (!resumeData) {
          resumeData = {
            personalInfo: {
              name: "Your Name",
              email: "your.email@example.com",
              location: "Your Location"
            },
            summary: "Professional summary to be optimized",
            experience: [],
            skills: [],
            education: []
          };
        }

        // Prepare job data for the API
        const jobData = {
          title: selectedJob.title,
          company: {
            name: selectedJob.company.name,
            industry: selectedJob.company.industry
          },
          location: selectedJob.location,
          workMode: selectedJob.workMode,
          salaryMin: selectedJob.salaryMin,
          salaryMax: selectedJob.salaryMax,
          skills: selectedJob.skills || [],
          requirements: selectedJob.requirements || '',
          description: selectedJob.description || ''
        };

        // Call the Node.js resume polish API
        const response = await fetch('/api/resume/polish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resumeData,
            jobData
          })
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.polishingSuggestions) {
          // Store the polishing suggestions and job context for AI chat
          const aiContext = {
            type: 'resume_polish',
            jobData: selectedJob,
            polishingSuggestions: result.polishingSuggestions,
            resumeData: resumeData
          };
          
          localStorage.setItem('aiChatContext', JSON.stringify(aiContext));
          setShowAIChat(true);
        } else {
          throw new Error(result.error || 'Failed to get polishing suggestions');
        }

      } catch (error) {
        console.error('Resume polishing error:', error);
        toast({
          title: "Error",
          description: "Failed to get resume polishing suggestions. Please try again.",
          variant: "destructive"
        });
      }
    }
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
                          {mockAnalysis[job.id]?.matchScore || Math.floor(Math.random() * 30) + 70}%
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
              {selectedJob ? (
                <>
                  {/* Overall Match Score */}
                  <div className="text-center pb-4 border-b border-gray-200">
                    <div className="text-3xl font-bold text-primary-600 mb-1">
                      {analysis?.matchScore || mockAnalysis[selectedJob.id]?.matchScore || 75}%
                    </div>
                    <div className="text-sm text-gray-500">Overall Match Score</div>
                  </div>

                  {/* Skills Match */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Skills Match</h4>
                    <div className="space-y-3">
                      {(analysis?.skillsMatch || mockAnalysis[selectedJob.id]?.skillsMatch)?.map((skillMatch, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{skillMatch.skill}</span>
                            <div className="flex items-center space-x-2">
                              {skillMatch.required && (
                                <Badge variant="outline" className="text-xs px-1 py-0">Required</Badge>
                              )}
                              <span className={cn(
                                "font-medium capitalize",
                                skillMatch.match ? "text-green-600" : "text-orange-600"
                              )}>
                                {skillMatch.userLevel}
                              </span>
                            </div>
                          </div>
                          <Progress 
                            value={skillMatch.match ? 
                              (skillMatch.userLevel === 'expert' ? 95 : 
                               skillMatch.userLevel === 'advanced' ? 85 : 
                               skillMatch.userLevel === 'intermediate' ? 75 : 65) : 
                              (skillMatch.userLevel === 'intermediate' ? 60 : 
                               skillMatch.userLevel === 'beginner' ? 40 : 50)
                            } 
                            className="h-2"
                          />
                        </div>
                      )) || (
                        <div className="text-sm text-gray-500">
                          {analyzeJobMutation.isPending ? "Analyzing skills match..." : "No skills data available"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gap Analysis */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Areas for Improvement</h4>
                    <div className="space-y-2">
                      {(analysis?.gaps || mockAnalysis[selectedJob.id]?.gaps)?.length > 0 ? (
                        (analysis?.gaps || mockAnalysis[selectedJob.id]?.gaps)?.map((gap, index) => (
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

                  {/* Recommendations */}
                  {(analysis?.recommendations || mockAnalysis[selectedJob.id]?.recommendations) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {(analysis?.recommendations || mockAnalysis[selectedJob.id]?.recommendations)?.map((rec, index) => (
                          <div key={index} className="flex items-start text-sm">
                            <i className="fas fa-lightbulb text-blue-500 mr-2 mt-0.5"></i>
                            <span className="text-gray-700">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Actions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recommended Actions</h4>
                    <div className="space-y-3">
                      <Button 
                        onClick={handlePolishResume}
                        className="w-full bg-purple-600 hover:bg-purple-700" 
                        data-testid="button-polish-resume"
                      >
                        <i className="fas fa-magic mr-2"></i>
                        Polish My Resume for This Role
                      </Button>
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

      {/* AI Chat Assistant Modal */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-3/4 m-4">
            <AIChatAssistant onClose={() => setShowAIChat(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
