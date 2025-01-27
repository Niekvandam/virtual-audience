import { z } from "zod"

export const AnalysisResponseSchema = z.object({
  chartData: z.array(
    z.object({
      attribute: z.enum([
        "Clarity",
        "Relevance",
        "Visual Appeal",
        "Usability",
        "Credibility",
        "Innovation",
        "Target Fit",
        "CTA Effectiveness"
      ]),
      value: z.number()
    })
  ),
  feedback: z.array(z.string()),
  overallScore: z.number(),
  overallOpinion: z.string()
})

export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>