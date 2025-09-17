"use client";
import { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  variant?: "default" | "gradient" | "accent";
  hover?: boolean;
}

export function Card({
  title,
  subtitle,
  children,
  className = "",
  action,
  variant = "default",
  hover = true,
}: CardProps) {
  const getCardClasses = () => {
    const baseClasses = "card";
    const variantClasses = {
      default: "",
      gradient: "card-gradient",
      accent: "card-accent",
    };
    const hoverClass = hover ? "" : "";

    return `${baseClasses} ${variantClasses[variant]} ${hoverClass} ${className}`;
  };

  return (
    <div className={getCardClasses()}>
      {/* Header */}
      {(title || action) && (
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
            {action && <div className="ml-4 flex-shrink-0">{action}</div>}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={title || action ? "card-body" : "card-body-no-header"}>
        {children}
      </div>
    </div>
  );
}

// Minimalist Stats Card
export function StatsCard({
  title,
  value,
  change,
  icon,
  trend = "neutral",
  className = "",
}: {
  title: string;
  value: string | number;
  change?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}) {
  const getTrendClass = () => {
    const trendClasses = {
      up: "stats-change-up",
      down: "stats-change-down",
      neutral: "stats-change-neutral",
    };
    return trendClasses[trend];
  };

  const getTrendIcon = () => {
    if (trend === "up") {
      return (
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M7 17l6-6 6 6"
          />
        </svg>
      );
    } else if (trend === "down") {
      return (
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M17 7l-6 6-6-6"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className={`stats-card ${className}`}>
      <div className="flex items-start justify-between mb-3">
        {icon && <div className="stats-icon">{icon}</div>}
      </div>

      <div>
        <div className="stats-label">{title}</div>
        <div className="stats-value">{value}</div>
        {change && (
          <div
            className={`stats-change ${getTrendClass()} flex items-center gap-1`}
          >
            {getTrendIcon()}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}
