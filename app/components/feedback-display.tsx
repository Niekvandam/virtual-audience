import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FeedbackDisplay({ feedback }: { feedback: string[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Analysis Feedback</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] overflow-y-auto">
        <ul className="list-disc pl-5 space-y-2">
          {feedback.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

