import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function ResumeTab() {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [resumeFormat, setResumeFormat] = useState("1-page");
  const [generatedResume, setGeneratedResume] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const linkedinAuthMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/linkedin/auth-url");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.authUrl) {
        setIsAuthenticating(true);
        // Open LinkedIn OAuth in popup window
        const popup = window.open(data.authUrl, 'linkedin-auth', 'width=600,height=600');
        
        // Listen for OAuth completion
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setIsAuthenticating(false);
            // Check if we got an access token from the callback
            const token = localStorage.getItem('linkedin_access_token');
            if (token) {
              setAccessToken(token);
              toast({
                title: "Success",
                description: "LinkedIn authentication successful!",
              });
            }
          }
        }, 1000);
      }
    },
    onError: (error) => {
      setIsAuthenticating(false);
      toast({
        title: "Error",
        description: "Failed to start LinkedIn authentication: " + error.message,
        variant: "destructive",
      });
    },
  });

  const generateResumeMutation = useMutation({
    mutationFn: async ({ linkedinUrl, targetRole }: { linkedinUrl: string; targetRole?: string }) => {
      const response = await apiRequest("POST", "/api/resume/generate-with-profile", {
        linkedinUrl,
        targetRole,
        accessToken: accessToken || undefined,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedResume(data);
      toast({
        title: "Success",
        description: "Resume generated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate resume: " + error.message,
        variant: "destructive",
      });
    },
  });

  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);
      
      const response = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Resume uploaded successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload resume: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleLinkedInAuth = () => {
    linkedinAuthMutation.mutate();
  };

  const handleGenerateResume = () => {
    if (!linkedinUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a LinkedIn URL",
        variant: "destructive",
      });
      return;
    }
    generateResumeMutation.mutate({ linkedinUrl });
  };

  const handleFileUpload = async (file: File) => {
    await uploadResumeMutation.mutateAsync(file);
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!generatedResume?.resume?.id) {
      toast({
        title: "Error",
        description: "No resume to export",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/resume/${generatedResume.resume.id}/export/${format}`);
      
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `Resume exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export resume",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Resume Builder</h1>
        <p className="text-gray-600">Generate and refine your resume with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resume Generation Options */}
        <div className="space-y-6">
          {/* LinkedIn Import */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <i className="fab fa-linkedin text-blue-600 mr-2"></i>
                Generate from LinkedIn
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
                  <Input
                    id="linkedin-url"
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    data-testid="input-linkedin-url"
                  />
                </div>
                
                {/* LinkedIn Authentication */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <i className="fab fa-linkedin text-blue-600"></i>
                    <span className="text-sm text-blue-900">
                      {accessToken ? "✅ LinkedIn Connected" : "🔗 Connect for full profile data"}
                    </span>
                  </div>
                  {!accessToken && (
                    <Button
                      onClick={handleLinkedInAuth}
                      disabled={isAuthenticating || linkedinAuthMutation.isPending}
                      variant="outline"
                      size="sm"
                    >
                      {isAuthenticating ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <i className="fab fa-linkedin mr-2"></i>
                          Connect LinkedIn
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleGenerateResume}
                  disabled={generateResumeMutation.isPending}
                  className="w-full"
                  data-testid="button-generate-resume"
                >
                  {generateResumeMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2"></i>
                      Generate Resume {accessToken ? "(with LinkedIn data)" : "(basic)"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <i className="fas fa-upload text-gray-600 mr-2"></i>
                Upload & Improve
              </h3>
              <FileUpload
                onFileUpload={handleFileUpload}
                accept=".pdf,.doc,.docx"
                maxSize={10 * 1024 * 1024}
              />
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                AI Suggestions
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <i className="fas fa-check-circle text-blue-600 mt-1"></i>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Add quantified achievements</p>
                    <p className="text-sm text-blue-700">Include specific numbers and percentages to showcase impact</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <i className="fas fa-check-circle text-green-600 mt-1"></i>
                  <div>
                    <p className="text-sm font-medium text-green-900">Optimize for ATS</p>
                    <p className="text-sm text-green-700">Use standard section headers and relevant keywords</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <i className="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Update technical skills</p>
                    <p className="text-sm text-yellow-700">Add recent technologies and certifications</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resume Preview */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Resume Preview</h3>
            <Select value={resumeFormat} onValueChange={setResumeFormat}>
              <SelectTrigger className="w-48" data-testid="select-resume-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-page">1-Page Format</SelectItem>
                <SelectItem value="detailed">Detailed Format</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardContent className="p-6">
            {/* Resume Preview Content */}
            {generatedResume ? (
              <div className="bg-gray-50 rounded-lg p-6 min-h-96" data-testid="resume-preview">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {generatedResume.content?.personalInfo?.name || "Your Name"}
                  </h2>
                  <p className="text-gray-600">Professional Title</p>
                  <p className="text-sm text-gray-500">
                    {generatedResume.content?.personalInfo?.email || "email@example.com"} | 
                    {generatedResume.content?.personalInfo?.phone || "(555) 123-4567"}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 border-b border-gray-300 pb-1">SUMMARY</h3>
                    <p className="text-sm text-gray-700 mt-2">
                      {generatedResume.content?.summary || "Professional summary will appear here..."}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 border-b border-gray-300 pb-1">EXPERIENCE</h3>
                    {generatedResume.content?.experience?.map((exp: any, index: number) => (
                      <div key={index} className="mt-2">
                        <p className="font-medium">{exp.title} | {exp.company}</p>
                        <p className="text-sm text-gray-600">{exp.duration}</p>
                        <ul className="text-sm text-gray-700 mt-1 list-disc list-inside">
                          {exp.achievements?.map((achievement: string, i: number) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 border-b border-gray-300 pb-1">SKILLS</h3>
                    <p className="text-sm text-gray-700 mt-2">
                      {generatedResume.content?.skills?.join(', ') || "Skills will appear here..."}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 min-h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <i className="fas fa-file-alt text-4xl mb-4"></i>
                  <p>Generate or upload a resume to see preview</p>
                </div>
              </div>
            )}
            
            {/* Export Buttons */}
            <div className="mt-6 flex space-x-3">
              <Button
                onClick={() => handleExport("pdf")}
                disabled={!generatedResume}
                className="flex-1"
                data-testid="button-export-pdf"
              >
                <i className="fas fa-file-pdf mr-2"></i>
                Export PDF
              </Button>
              <Button
                onClick={() => handleExport("docx")}
                disabled={!generatedResume}
                variant="outline"
                className="flex-1"
                data-testid="button-export-docx"
              >
                <i className="fas fa-file-word mr-2"></i>
                Export DOCX
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
