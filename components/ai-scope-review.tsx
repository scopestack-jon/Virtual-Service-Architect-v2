import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Brain, AlertTriangle, Clock, Target, TrendingUp } from "lucide-react"
import type { ProjectAnalysis } from "../utils/aiAnalysis"

interface AIScopeReviewProps {
  analysis: ProjectAnalysis
}

export function AIScopeReview({ analysis }: AIScopeReviewProps) {
  const { scopeReview, riskAssessment, recommendations } = analysis

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "text-green-600 bg-green-50"
      case "Medium":
        return "text-yellow-600 bg-yellow-50"
      case "High":
        return "text-orange-600 bg-orange-50"
      case "Critical":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive"
      case "Medium":
        return "secondary"
      case "Low":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      {/* Scope Review Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI Scope Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Score</span>
                <span className={`text-lg font-bold ${getScoreColor(scopeReview.overallScore)}`}>
                  {scopeReview.overallScore}/100
                </span>
              </div>
              <Progress value={scopeReview.overallScore} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Completeness:</span>
                <Badge variant={scopeReview.completeness === "Complete" ? "default" : "secondary"}>
                  {scopeReview.completeness}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Clarity:</span>
                <Badge variant={scopeReview.clarity === "Clear" ? "default" : "secondary"}>{scopeReview.clarity}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Feasibility:</span>
                <Badge variant={scopeReview.feasibility === "High" ? "default" : "secondary"}>
                  {scopeReview.feasibility}
                </Badge>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">{scopeReview.reviewSummary}</p>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(riskAssessment.overallRisk)}`}
              >
                {riskAssessment.overallRisk}
              </div>
              <p className="text-xs text-gray-500 mt-1">Overall</p>
            </div>
            <div className="text-center">
              <div
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(riskAssessment.budgetRisk)}`}
              >
                {riskAssessment.budgetRisk}
              </div>
              <p className="text-xs text-gray-500 mt-1">Budget</p>
            </div>
            <div className="text-center">
              <div
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(riskAssessment.timelineRisk)}`}
              >
                {riskAssessment.timelineRisk}
              </div>
              <p className="text-xs text-gray-500 mt-1">Timeline</p>
            </div>
            <div className="text-center">
              <div
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(riskAssessment.technicalRisk)}`}
              >
                {riskAssessment.technicalRisk}
              </div>
              <p className="text-xs text-gray-500 mt-1">Technical</p>
            </div>
          </div>

          {riskAssessment.riskFactors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Key Risk Factors:</h4>
              {riskAssessment.riskFactors.slice(0, 3).map((risk, index) => (
                <Alert key={index} className="py-2">
                  <AlertDescription className="text-xs">
                    <strong>{risk.category}:</strong> {risk.description}
                    <br />
                    <span className="text-gray-500">Mitigation: {risk.mitigation}</span>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(rec.priority)} className="text-xs">
                      {rec.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {rec.type}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {rec.effort} effort
                  </Badge>
                </div>
                <h4 className="text-sm font-medium mb-1">{rec.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                <p className="text-xs text-green-600">
                  <strong>Impact:</strong> {rec.impact}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Missing Elements */}
      {scopeReview.missingElements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Missing Scope Elements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {scopeReview.missingElements.map((element, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {element}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
