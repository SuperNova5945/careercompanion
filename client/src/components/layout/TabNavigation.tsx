import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt", path: "/" },
  { id: "resume", label: "Resume", icon: "fas fa-file-alt", path: "/resume" },
  { id: "companies", label: "Companies", icon: "fas fa-building", path: "/companies" },
  { id: "jobs", label: "Jobs", icon: "fas fa-briefcase", path: "/jobs" },
  { id: "tracker", label: "Tracker", icon: "fas fa-tasks", path: "/tracker" },
  { id: "skills", label: "Skills", icon: "fas fa-graduation-cap", path: "/skills" },
  { id: "branding", label: "Branding", icon: "fas fa-bullhorn", path: "/branding" },
];

export function TabNavigation() {
  const [location, setLocation] = useLocation();

  const handleTabClick = (path: string) => {
    setLocation(path);
  };

  return (
    <header className="bg-primary-600 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src="/assets/career-companion-logo.svg" 
                alt="Career Companion Logo" 
                className="w-8 h-8 mr-3"
              />
              <img 
                src="/assets/career-companion-text-logo.svg" 
                alt="Career Companion" 
                className="h-full w-auto max-w-48 py-1"
              />
            </div>
          </div>


          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={cn(
                  "flex flex-col items-center py-2 px-3 text-sm font-bold transition-all rounded-lg group transform hover:scale-105",
                  location === tab.path
                    ? "text-white bg-primary-700 shadow-lg"
                    : "text-blue-100 hover:text-white hover:bg-primary-700"
                )}
                data-testid={`tab-${tab.id}`}
              >
                <i className={`${tab.icon} text-lg mb-1 drop-shadow-sm`}></i>
                <span className="font-semibold tracking-wide">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-white hidden sm:block">Chenkai Xie</span>
                <img 
                  className="h-8 w-8 rounded-full border-2 border-blue-300" 
                  src="/assets/profile-photo.svg" 
                  alt="User avatar"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-primary-700">
        <div className="px-2 py-3 space-y-1 overflow-x-auto bg-primary-600">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all transform hover:scale-105",
                  location === tab.path
                    ? "bg-primary-700 text-white shadow-lg scale-105"
                    : "text-blue-100 hover:text-white hover:bg-primary-700"
                )}
                data-testid={`tab-mobile-${tab.id}`}
              >
                <i className={`${tab.icon} mr-2 text-base drop-shadow-sm`}></i>
                <span className="font-semibold tracking-wide">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
