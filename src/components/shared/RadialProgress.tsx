"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

import { useTheme } from "@/components/tailadmin/context/ThemeContext";

export default function RadialProgress({
  value,
  max = 84,
  label = "Progress",
  size = 120,
}: {
  value: number;
  max?: number;
  label?: string;
  size?: number;
}) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  const percent = isNaN(value) || !value ? 0 : Math.min(Math.round((value / max) * 100), 100);

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      fontFamily: "inherit",
      sparkline: {
        enabled: true,
      },
      background: "transparent",
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          margin: 15,
          size: "65%",
        },
        track: {
          background: theme === "dark" ? "#374151" : "#e5e7eb", // gray-700 or gray-200
          strokeWidth: "100%",
          margin: 0, 
        },
        dataLabels: {
          show: true,
          name: {
            offsetY: 20,
            show: true,
            color: theme === "dark" ? "#9ca3af" : "#888",
            fontSize: "12px",
          },
          value: {
            offsetY: -10,
            color: theme === "dark" ? "#f3f4f6" : "#111",
            fontSize: "24px",
            show: true,
            formatter: function (val) {
              return (val != null ? String(val) : "0") + "%";
            }
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#3b82f6"], // brand-500
    },
    stroke: {
      lineCap: "round",
    },
    labels: [label],
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-gray-400 text-sm">...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <ReactApexChart options={options} series={[percent]} type="radialBar" width={size} height={size} />
    </div>
  );
}

