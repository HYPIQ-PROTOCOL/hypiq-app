"use client"

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"

interface VolumeRadialChartProps {
  volume: number
  profitVolume?: number
  lossVolume?: number
  theme?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

export function VolumeRadialChart({ 
  volume, 
  profitVolume = volume * 0.4, // Default 40% profit
  lossVolume = volume * 0.6,   // Default 60% loss
  theme = 'light',
  size = 'sm'
}: VolumeRadialChartProps) {
  const chartData = [{ 
    profit: profitVolume, 
    loss: lossVolume 
  }]

  const chartConfig = {
    profit: {
      label: "Profit Volume",
      color: "#10b981", // emerald-500
    },
    loss: {
      label: "Loss Volume", 
      color: "#ef4444", // red-500
    },
  } satisfies ChartConfig

  const sizeConfig = {
    sm: {
      container: "w-4 h-4",
      maxWidth: "16px",
      innerRadius: 4,
      outerRadius: 8,
      textSize: "text-xs"
    },
    md: {
      container: "w-5 h-5",
      maxWidth: "20px", 
      innerRadius: 5,
      outerRadius: 10,
      textSize: "text-sm"
    },
    lg: {
      container: "w-6 h-6",
      maxWidth: "24px",
      innerRadius: 6,
      outerRadius: 12,
      textSize: "text-sm"
    }
  }

  const config = sizeConfig[size]
  const isDark = theme === 'dark'

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) {
      return `${(vol / 1000000).toFixed(1)}M`
    } else if (vol >= 1000) {
      return `${(vol / 1000).toFixed(1)}K`
    }
    return vol.toString()
  }

  return (
    <div className="flex items-center gap-1">
      <ChartContainer
        config={chartConfig}
        className={`${config.container} aspect-square flex-shrink-0`}
        style={{ maxWidth: config.maxWidth, minHeight: config.maxWidth }}
      >
        <RadialBarChart
          data={chartData}
          endAngle={180}
          innerRadius={config.innerRadius}
          outerRadius={config.outerRadius}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false} />
          <RadialBar
            dataKey="loss"
            stackId="a"
            cornerRadius={1}
            fill="var(--color-loss)"
            className="stroke-transparent"
          />
          <RadialBar
            dataKey="profit"
            fill="var(--color-profit)"
            stackId="a"
            cornerRadius={1}
            className="stroke-transparent"
          />
        </RadialBarChart>
      </ChartContainer>
      <div className={`${config.textSize} font-medium ${
        isDark ? 'text-white/60' : 'text-gray-500'
      } whitespace-nowrap`}>
        Vol: ${formatVolume(volume)}
      </div>
    </div>
  )
}
