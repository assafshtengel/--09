import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface AIInsightsProps {
  insights: string | null;
  isLoading: boolean;
}

export const AIInsights = ({ insights, isLoading }: AIInsightsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>תובנות AI</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    )
  }

  if (!insights) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>תובנות והמלצות לשיפור</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap">{insights}</div>
      </CardContent>
    </Card>
  )
}