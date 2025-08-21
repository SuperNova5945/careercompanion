import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "fas fa-chart-line", path: "/" },
  { id: "resume", label: "Resume", icon: "fas fa-file-alt", path: "/resume" },
  { id: "companies", label: "Companies", icon: "fas fa-building", path: "/companies" },
  { id: "jobs", label: "Jobs", icon: "fas fa-search", path: "/jobs" },
  { id: "tracker", label: "Tracker", icon: "fas fa-list-ul", path: "/tracker" },
  { id: "skills", label: "Skills", icon: "fas fa-graduation-cap", path: "/skills" },
  { id: "branding", label: "Branding", icon: "fas fa-share-alt", path: "/branding" },
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
              <i className="fas fa-briefcase text-white text-2xl mr-3"></i>
              <span className="text-xl font-bold text-white">Career Companion</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={cn(
                  "flex flex-col items-center py-2 px-3 text-xs font-medium transition-all rounded-lg group",
                  location === tab.path
                    ? "text-white bg-primary-700"
                    : "text-blue-100 hover:text-white hover:bg-primary-700"
                )}
                data-testid={`tab-${tab.id}`}
              >
                <i className={`${tab.icon} text-lg mb-1`}></i>
                <span>{tab.label}</span>
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
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b787?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150" 
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
                  "px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                  location === tab.path
                    ? "bg-primary-700 text-white"
                    : "text-blue-100 hover:text-white hover:bg-primary-700"
                )}
                data-testid={`tab-mobile-${tab.id}`}
              >
                <i className={`${tab.icon} mr-1`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
