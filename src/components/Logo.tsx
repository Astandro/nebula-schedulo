import { Calendar } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showByline?: boolean;
}

export const Logo = ({ size = "md", showByline = true }: LogoProps) => {
  const sizes = {
    sm: {
      icon: "w-7 h-7",
      text: "text-2xl",
      byline: "text-sm",
      container: "gap-3",
      padding: "p-2.5"
    },
    md: {
      icon: "w-9 h-9",
      text: "text-3xl",
      byline: "text-base",
      container: "gap-3",
      padding: "p-3"
    },
    lg: {
      icon: "w-11 h-11",
      text: "text-4xl",
      byline: "text-lg",
      container: "gap-4",
      padding: "p-3.5"
    }
  };

  const sizeClasses = sizes[size];

  return (
    <div className={`flex items-center ${sizeClasses.container}`}>
      {/* Icon */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary rounded-xl blur-sm opacity-25"></div>
        <div className={`relative bg-primary rounded-xl ${sizeClasses.padding} flex items-center justify-center`}>
          <Calendar className={`${sizeClasses.icon} text-white`} strokeWidth={2.5} />
        </div>
      </div>
      
      {/* Text */}
      <div className="flex flex-col">
        <h1 className={`font-bold text-primary leading-none ${sizeClasses.text}`}>
          Booked
        </h1>
        {showByline && (
          <p className={`text-primary/70 font-medium ${sizeClasses.byline}`}>
            by Bron
          </p>
        )}
      </div>
    </div>
  );
};

