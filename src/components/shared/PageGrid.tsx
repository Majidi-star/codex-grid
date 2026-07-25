import React from "react";

interface PageGridProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  bottom?: React.ReactNode;
}

export default function PageGrid({ sidebar, main, bottom }: PageGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,320px)_1fr] gap-8 mt-8">
      {/* Sidebar Column */}
      <div className="space-y-6 flex flex-col min-w-0">
        {sidebar}
      </div>
      
      {/* Main Column */}
      <div className="space-y-6 flex flex-col min-w-0">
        {main}
      </div>
      
      {/* Bottom Full-Width Section */}
      {bottom && (
        <div className="md:col-span-full space-y-6 min-w-0">
          {bottom}
        </div>
      )}
    </div>
  );
}
