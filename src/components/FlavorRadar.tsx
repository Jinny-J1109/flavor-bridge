"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { FlavorProfile } from "@/types";

const axes = [
  { key: "sour", label: "Sour" },
  { key: "savory", label: "Savory" },
  { key: "spicy", label: "Spicy" },
  { key: "sweet", label: "Sweet" },
  { key: "bitter", label: "Bitter" },
] as const;

export default function FlavorRadar({ profile }: { profile: FlavorProfile }) {
  const data = axes.map((axis) => ({
    flavor: axis.label,
    value: profile[axis.key],
  }));

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 mb-2">
        Flavor Profile
      </h2>
      <div className="w-full" style={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="flavor"
              tick={{ fill: "#6b7280", fontSize: 13 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={false}
              axisLine={false}
            />
            <Radar
              dataKey="value"
              stroke="#f97316"
              fill="#f97316"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
