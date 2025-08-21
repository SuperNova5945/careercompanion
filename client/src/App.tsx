import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "@/pages/dashboard";
import { ResumeTab } from "@/components/tabs/ResumeTab";
import { CompaniesTab } from "@/components/tabs/CompaniesTab";
import { JobsTab } from "@/components/tabs/JobsTab";
import { TrackerTab } from "@/components/tabs/TrackerTab";
import { SkillsTab } from "@/components/tabs/SkillsTab";
import { BrandingTab } from "@/components/tabs/BrandingTab";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/resume" component={ResumeTab} />
        <Route path="/companies" component={CompaniesTab} />
        <Route path="/jobs" component={JobsTab} />
        <Route path="/tracker" component={TrackerTab} />
        <Route path="/skills" component={SkillsTab} />
        <Route path="/branding" component={BrandingTab} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
