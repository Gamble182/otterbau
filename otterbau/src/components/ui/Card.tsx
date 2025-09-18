"use client";
import { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  variant?: "default" | "gradient" | "glass";
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
      gradient: "bg-gradient-accent",
      glass: "backdrop-blur",
    };
    const hoverClass = hover ? "" : "hover:transform-none hover:shadow-sm";

    return `${baseClasses} ${variantClasses[variant]} ${hoverClass} ${className}`;
  };

  return (
    <div className={getCardClasses()}>
      {/* Header */}
      {(title || action) && (
        <div className="card-header">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
            {action && <div className="ml-4 flex-shrink-0">{action}</div>}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={title || action ? "card-body" : "card-body-compact"}>
        {children}
      </div>
    </div>
  );
}

// iOS-inspired Stats Card with Sony colors
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
          className="w-4 h-4"
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
          className="w-4 h-4"
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
    return (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 12H4"
        />
      </svg>
    );
  };

  return (
    <div className={`stats-card animate-scale-in ${className}`}>
      {/* Icon */}
      {icon && <div className="stats-icon">{icon}</div>}

      {/* Content */}
      <div>
        <div className="stats-label">{title}</div>
        <div className="stats-value">{value}</div>
        {change && (
          <div className={`stats-change ${getTrendClass()}`}>
            {getTrendIcon()}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Hero Stats Card for main dashboard
export function HeroStatsCard({
  title,
  value,
  subtitle,
  icon,
  gradient = "default",
  className = "",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  gradient?: "default" | "warm" | "success";
  className?: string;
}) {
  const gradientClasses = {
    default: "bg-gradient-accent",
    warm: "bg-gradient-warm",
    success: "bg-[linear-gradient(135deg,var(--coral-red),var(--deep-red))]",
  };

  return (
    <div
      className={`card ${gradientClasses[gradient]} text-white border-none ${className}`}
    >
      <div className="card-body-compact relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full border border-white"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full border border-white opacity-50"></div>
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm font-semibold opacity-90 mb-1">{title}</div>
            <div className="text-3xl font-bold mb-1">{value}</div>
            {subtitle && <div className="text-sm opacity-75">{subtitle}</div>}
          </div>

          {icon && (
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ml-4">
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Glass Card for special content
export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
      relative overflow-hidden rounded-2xl border border-white/10
      bg-white/10 backdrop-blur-xl
      shadow-lg hover:shadow-xl transition-all duration-300
      ${className}
    `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
      <div className="relative p-6">{children}</div>
    </div>
  );
}
