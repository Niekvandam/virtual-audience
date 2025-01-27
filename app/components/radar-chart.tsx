"use client"

import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type ChartData = {
  attribute: string
  value: number
}

export default function AnalysisChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ChartContainer
          config={{
            value: {
              label: "Score",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid />
              <PolarAngleAxis dataKey="attribute" />
              <PolarRadiusAxis domain={[0, 5]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Radar dataKey="value" fill="var(--color-value)" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
