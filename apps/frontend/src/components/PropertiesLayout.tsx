"use client";

import { useState, Suspense } from "react";
import PropertiesFilters from "./PropertiesFilters";
import ActiveFilterBadges from "./ActiveFilterBadges";
import "./PropertiesLayout.css";

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
      <div
        className={`properties-layout ${isCollapsed ? "properties-layout--collapsed" : "properties-layout--expanded"}`}
      >
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

        <div style={{ gridArea: "main", minWidth: 0 }}>
          <ActiveFilterBadges
            cities={filterOptions.cities}
            propertyTypes={filterOptions.propertyTypes}
          />

          <div className="mb-3" aria-live="polite">
            <p className="text-muted mb-0">
              {totalCount === 1
                ? "1 propiedad encontrada"
                : `${totalCount} propiedades encontradas`}
            </p>
          </div>

          {children}
        </div>
      </div>
    </Suspense>
  );
}
