import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  estimatedHours: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

const mockLearningPaths: LearningPath[] = [
  {
    id: "1",
    title: "Advanced React Development",
    description: "Master advanced React patterns and performance optimization",
    progress: 75,
    totalModules: 12,
    completedModules: 9,
    estimatedHours: 3,
  },
  {
    id: "2",
    title: "System Design Fundamentals",
    description: "Learn to design scalable distributed systems",
    progress: 45,
    totalModules: 11,
    completedModules: 5,
    estimatedHours: 8,
  },
];

const mockBadges: Badge[] = [
  { id: "1", name: "React Expert", description: "Mastered React framework", icon: "fab fa-react", category: "Frontend" },
  { id: "2", name: "JS Advanced", description: "Advanced JavaScript skills", icon: "fab fa-js-square", category: "Language" },
  { id: "3", name: "Node.js Pro", description: "Backend development with Node.js", icon: "fab fa-node-js", category: "Backend" },
  { id: "4", name: "SQL Master", description: "Database query optimization", icon: "fas fa-database", category: "Database" },
  { id: "5", name: "AWS Basics", description: "Cloud infrastructure basics", icon: "fab fa-aws", category: "Cloud" },
  { id: "6", name: "Analytics", description: "Data analysis and insights", icon: "fas fa-chart-line", category: "Data" },
];

const mockRecommendedCourses = [
  {
    id: "1",
    title: "GraphQL Fundamentals",
    description: "Based on your job interests",
    icon: "fas fa-code",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "2",
    title: "AWS Certification Prep",
    description: "Trending in your field",
    icon: "fas fa-cloud",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: "3",
    title: "React Native Essentials",
    description: "Expand your React skills",
    icon: "fas fa-mobile-alt",
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

export function SkillsTab() {
  const { data: learningPaths = mockLearningPaths } = useQuery<LearningPath[]>({
    queryKey: ["/api/learning-paths"],
    initialData: mockLearningPaths,
  });

  const { data: badges = mockBadges } = useQuery<Badge[]>({
    queryKey: ["/api/badges"],
    initialData: mockBadges,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Skills Development Hub</h1>
        <p className="text-gray-600">Track your learning progress and earn professional badges</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Learning Streak */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">🔥</div>
            <div className="text-2xl font-bold text-orange-600 mb-1" data-testid="stat-learning-streak">7</div>
            <div className="text-sm text-gray-600">Day Learning Streak</div>
          </CardContent>
        </Card>
        
        {/* Badges Earned */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">🏆</div>
            <div className="text-2xl font-bold text-yellow-600 mb-1" data-testid="stat-badges-earned">
              {badges.length}
            </div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </CardContent>
        </Card>
        
        {/* Hours This Week */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">⏱️</div>
            <div className="text-2xl font-bold text-primary-600 mb-1" data-testid="stat-weekly-hours">12</div>
            <div className="text-sm text-gray-600">Hours This Week</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Learning Paths */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Active Learning Paths</h3>
          </div>
          <CardContent className="p-6 space-y-6">
            {learningPaths.map((path) => (
              <div key={path.id} className="border border-gray-200 rounded-lg p-4" data-testid={`learning-path-${path.id}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{path.title}</h4>
                  <span className="text-sm font-medium text-primary-600">{path.progress}% Complete</span>
                </div>
                <Progress value={path.progress} className="mb-3" />
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{path.completedModules} of {path.totalModules} modules completed</span>
                  <span>Est. {path.estimatedHours} hours remaining</span>
                </div>
                <Button className="mt-3 w-full" size="sm" data-testid={`button-continue-${path.id}`}>
                  Continue Learning
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommended Skills */}
        <div className="space-y-6">
          {/* Earned Badges */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Badges</h3>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4">
                {badges.slice(0, 6).map((badge) => (
                  <div key={badge.id} className="text-center" data-testid={`badge-${badge.id}`}>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <i className={`${badge.icon} text-2xl text-blue-600`}></i>
                    </div>
                    <div className="text-xs font-medium text-gray-900">{badge.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Courses */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recommended for You</h3>
            </div>
            <CardContent className="p-6 space-y-4">
              {mockRecommendedCourses.map((course) => (
                <div 
                  key={course.id} 
                  className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  data-testid={`recommended-course-${course.id}`}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 ${course.bgColor} rounded-lg flex items-center justify-center`}>
                      <i className={`${course.icon} ${course.iconColor}`}></i>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{course.title}</p>
                    <p className="text-sm text-gray-500">{course.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button size="sm" variant="outline" className="text-xs">
                      Start
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
