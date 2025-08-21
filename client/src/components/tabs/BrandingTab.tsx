import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { LinkedinPost } from "@/lib/types";

const postTopics = [
  "Share a recent achievement",
  "Industry insights",
  "Learning milestone",
  "Career advice",
  "Technology trends",
];

const mockSuggestedConnections = [
  {
    id: "1",
    name: "Alex Chen",
    title: "Engineering Manager at Google",
    connectionType: "2nd degree • 15 mutual connections",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
  },
  {
    id: "2",
    name: "Maria Rodriguez",
    title: "Senior Product Manager at Stripe",
    connectionType: "3rd degree • 8 mutual connections",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
  },
  {
    id: "3",
    name: "David Kim",
    title: "Staff Engineer at Netflix",
    connectionType: "2nd degree • 12 mutual connections",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
  },
];

const mockAnalytics = {
  profileViews: 47,
  newConnections: 12,
  postEngagement: 8.2,
  searchAppearances: 156,
};

export function BrandingTab() {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [postDetails, setPostDetails] = useState("");
  const [generatedPost, setGeneratedPost] = useState<string>("");
  const { toast } = useToast();

  const generatePostMutation = useMutation({
    mutationFn: async ({ topic, details }: { topic: string; details: string }) => {
      const response = await apiRequest("POST", "/api/linkedin/generate", {
        topic,
        details,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedPost(data.content);
      toast({
        title: "Success",
        description: "LinkedIn post generated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate post: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleGeneratePost = () => {
    if (!selectedTopic) {
      toast({
        title: "Error",
        description: "Please select a post topic",
        variant: "destructive",
      });
      return;
    }
    generatePostMutation.mutate({ topic: selectedTopic, details: postDetails });
  };

  const handlePublishPost = () => {
    toast({
      title: "Success",
      description: "Post published to LinkedIn!",
    });
    // In a real implementation, this would publish to LinkedIn via their API
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Personal Branding Hub</h1>
        <p className="text-gray-600">Build your professional presence and grow your network</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Content Generator */}
        <div className="space-y-6">
          {/* LinkedIn Post Generator */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                <i className="fab fa-linkedin text-blue-600 mr-2"></i>
                LinkedIn Post Generator
              </h3>
            </div>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="post-topic">Post Topic</Label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger data-testid="select-post-topic">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {postTopics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="post-details">Additional Details</Label>
                <Textarea
                  id="post-details"
                  rows={3}
                  placeholder="Add any specific details you'd like to include..."
                  value={postDetails}
                  onChange={(e) => setPostDetails(e.target.value)}
                  data-testid="textarea-post-details"
                />
              </div>
              <Button
                onClick={handleGeneratePost}
                disabled={generatePostMutation.isPending}
                className="w-full"
                data-testid="button-generate-post"
              >
                {generatePostMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-2"></i>
                    Generate Post
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Post Preview */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Generated Post Preview</h3>
            </div>
            <CardContent className="p-6">
              {generatedPost ? (
                <>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <img 
                        className="w-10 h-10 rounded-full" 
                        src="https://images.unsplash.com/photo-1494790108755-2616b612b787?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150" 
                        alt="Profile picture"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Chenkai Xie</div>
                        <div className="text-sm text-gray-600">Senior Frontend Developer</div>
                      </div>
                    </div>
                    <div className="text-gray-900 mb-4 whitespace-pre-line" data-testid="generated-post-content">
                      {generatedPost}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span><i className="far fa-thumbs-up mr-1"></i>24 likes</span>
                      <span><i className="far fa-comment mr-1"></i>5 comments</span>
                      <span><i className="fas fa-share mr-1"></i>2 shares</span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={handlePublishPost}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      data-testid="button-publish-linkedin"
                    >
                      <i className="fab fa-linkedin mr-2"></i>
                      Publish to LinkedIn
                    </Button>
                    <Button
                      variant="outline"
                      className="px-4 py-2"
                      data-testid="button-edit-post"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      Edit
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-edit text-3xl mb-2"></i>
                  <p>Generate a post to see the preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Network Growth */}
        <div className="space-y-6">
          {/* Connection Suggestions */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Suggested Connections</h3>
              <p className="text-sm text-gray-600">People you should connect with based on your career goals</p>
            </div>
            <CardContent className="p-6 space-y-4">
              {mockSuggestedConnections.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                  data-testid={`connection-suggestion-${person.id}`}
                >
                  <div className="flex-shrink-0">
                    <img
                      className="w-12 h-12 rounded-full"
                      src={person.profileImage}
                      alt="Professional profile"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{person.name}</p>
                    <p className="text-sm text-gray-600">{person.title}</p>
                    <p className="text-xs text-gray-500">{person.connectionType}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      size="sm"
                      data-testid={`button-connect-${person.id}`}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Branding Analytics */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Profile Analytics</h3>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Profile views this week</span>
                <span className="text-lg font-semibold text-gray-900" data-testid="stat-profile-views">
                  {mockAnalytics.profileViews}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New connections</span>
                <span className="text-lg font-semibold text-success-600" data-testid="stat-new-connections">
                  +{mockAnalytics.newConnections}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Post engagement rate</span>
                <span className="text-lg font-semibold text-primary-600" data-testid="stat-engagement-rate">
                  {mockAnalytics.postEngagement}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Search appearances</span>
                <span className="text-lg font-semibold text-gray-900" data-testid="stat-search-appearances">
                  {mockAnalytics.searchAppearances}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
