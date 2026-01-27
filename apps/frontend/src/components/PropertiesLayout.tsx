"use client";

import { useState, Suspense } from "react";
import PropertiesFilters from "./PropertiesFilters";
import ActiveFilterBadges from "./ActiveFilterBadges";

interface FilterOption {
  name: string;
  slug: string;
}

interface PropertiesLayoutProps {
  filterOptions: {
    cities: FilterOption[];
    propertyTypes: FilterOption[];
    roomCounts: number[];
  };
  totalCount: number;
  children: React.ReactNode;
}

export default function PropertiesLayout({
  filterOptions,
  totalCount,
  children,
}: PropertiesLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Suspense fallback={<div className="bg-light rounded-3 p-4 mb-4" />}>
      {/* CSS Grid layout - single PropertiesFilters instance */}
      <div
        className="properties-layout"
        style={{
          display: "grid",
          gap: "1.5rem",
        }}
      >
        <style>{`
          .properties-layout {
            grid-template-columns: 1fr;
            grid-template-areas:
              "filters"
              "main";
          }
          @media (min-width: 992px) {
            .properties-layout {
              grid-template-columns: ${isCollapsed ? "140px" : "250px"} 1fr;
              grid-template-areas: "filters main";
              transition: grid-template-columns 0.2s ease-out;
            }
            .filters-sticky-wrapper {
              position: sticky;
              top: 1rem;
            }
          }
        `}</style>

        {/* Single PropertiesFilters instance */}
        <div style={{ gridArea: "filters" }}>
          <div className="filters-sticky-wrapper">
            <PropertiesFilters
              cities={filterOptions.cities}
              propertyTypes={filterOptions.propertyTypes}
              roomCounts={filterOptions.roomCounts}
              isCollapsed={isCollapsed}
              onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />
          </div>
        </div>

        {/* Main content */}
        <div style={{ gridArea: "main", minWidth: 0 }}>
          {/* Active filter badges */}
          <ActiveFilterBadges
            cities={filterOptions.cities}
            propertyTypes={filterOptions.propertyTypes}
          />

          {/* Results count */}
          <div className="mb-3" aria-live="polite">
            <p className="text-muted mb-0">
              {totalCount === 1
                ? "1 propiedad encontrada"
                : `${totalCount} propiedades encontradas`}
            </p>
          </div>

          {/* Properties grid and pagination */}
          {children}
        </div>
      </div>
    </Suspense>
  );
}
