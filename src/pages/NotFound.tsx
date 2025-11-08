import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center">
          <Link to="/">
            <Logo size="sm" />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-destructive" strokeWidth={2} />
            </div>
          </div>

          {/* 404 Text */}
          <h1 className="text-7xl font-bold text-foreground mb-4">
            404
          </h1>

          {/* Error message */}
          <h2 className="text-2xl font-semibold mb-2 text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-1">
            The page you're looking for doesn't exist
          </p>
          <p className="text-muted-foreground/60 text-sm font-mono mb-8">
            {location.pathname}
          </p>

          {/* Action */}
          <Link to="/">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Home className="w-5 h-5 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
