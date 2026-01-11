import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { Send, RefreshCw, ChevronDown, User, Users, Clock, Target } from "lucide-react";

interface Syndic8Group {
  id: string;
  name: string;
  description: string | null;
}

interface ExpertDraft {
  expertId: string;
  expertName: string;
  answer: string;
  confidence: number;
  assumptions: string[];
  uncertainties: string[];
}

interface Critique {
  reviewerName: string;
  targetExpertId: string;
  scores: {
    correctness: number;
    completeness: number;
    actionability: number;
  };
  strengths: string[];
  improvements: string[];
}

interface CouncilResponse {
  success: boolean;
  template: string;
  synthesis: {
    finalAnswer: string;
    confidence: number;
    consensusPoints: string[];
    dissentSummary: string | null;
    nextSteps: string[];
    primaryContributors: string[];
  };
  expertDrafts: ExpertDraft[];
  critiques: Critique[];
  metadata: {
    councilSize: number;
    avgConfidence: number;
    hasSignificantDissent: boolean;
  };
  trace?: {
    requestId: string;
    totalMs: number;
    stages: {
      drafts: { durationMs: number };
      critiques: { durationMs: number };
      synthesis: { durationMs: number };
    };
  };
}

interface Syndic8TesterProps {
  groups: Syndic8Group[];
  onRefresh: () => void;
}

const Syndic8Tester = ({ groups, onRefresh }: Syndic8TesterProps) => {
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [template, setTemplate] = useState<"balanced" | "complimentary" | "adversarial">("balanced");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CouncilResponse | null>(null);
  const [expandedExperts, setExpandedExperts] = useState<Set<string>>(new Set());

  const runTest = async () => {
    if (!selectedGroup || !question.trim()) {
      toast.error("Please select a group and enter a question");
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke("syndic8-council", {
        body: {
          groupId: selectedGroup,
          message: question,
          template,
          conversationHistory: []
        }
      });

      const totalTime = Date.now() - startTime;

      if (error) throw error;

      // Add timing to response
      setResponse({
        ...data,
        trace: {
          ...data.trace,
          totalMs: totalTime
        }
      });

      toast.success(`Council response received in ${(totalTime / 1000).toFixed(1)}s`);
    } catch (error) {
      console.error("Test error:", error);
      toast.error("Test failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const toggleExpert = (expertId: string) => {
    setExpandedExperts(prev => {
      const next = new Set(prev);
      if (next.has(expertId)) {
        next.delete(expertId);
      } else {
        next.add(expertId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Test Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manual Council Tester
          </CardTitle>
          <CardDescription>Test council responses with custom questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Syndic8 Group</label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a group..." />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Council Template</label>
              <Select value={template} onValueChange={(v) => setTemplate(v as typeof template)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced - Equal perspectives</SelectItem>
                  <SelectItem value="complimentary">Complimentary - Build on each other</SelectItem>
                  <SelectItem value="adversarial">Adversarial - Challenge assumptions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Test Question</label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter a question to test the council..."
              rows={3}
            />
          </div>

          <Button onClick={runTest} disabled={loading || !selectedGroup || !question.trim()}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Council...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Run Council Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Response */}
      {response && (
        <div className="space-y-4">
          {/* Metadata */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {response.trace?.totalMs ? `${(response.trace.totalMs / 1000).toFixed(1)}s` : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{response.metadata.councilSize} experts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{Math.round(response.metadata.avgConfidence)}% avg confidence</span>
                </div>
                <Badge variant={response.metadata.hasSignificantDissent ? "destructive" : "secondary"}>
                  {response.metadata.hasSignificantDissent ? "Has Dissent" : "Consensus"}
                </Badge>
                <Badge variant="outline">{response.template}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Synthesis */}
          <Card>
            <CardHeader>
              <CardTitle>Council Synthesis</CardTitle>
              <CardDescription>
                Confidence: {response.synthesis.confidence}% | 
                Contributors: {response.synthesis.primaryContributors.join(", ")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{response.synthesis.finalAnswer}</p>
              </div>

              {response.synthesis.consensusPoints.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Consensus Points</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {response.synthesis.consensusPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {response.synthesis.dissentSummary && (
                <div className="space-y-2 p-3 bg-yellow-500/10 rounded-lg">
                  <h4 className="font-medium text-sm text-yellow-600 dark:text-yellow-400">
                    Dissent Summary
                  </h4>
                  <p className="text-sm">{response.synthesis.dissentSummary}</p>
                </div>
              )}

              {response.synthesis.nextSteps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Next Steps</h4>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground">
                    {response.synthesis.nextSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expert Drafts */}
          <Card>
            <CardHeader>
              <CardTitle>Expert Drafts ({response.expertDrafts.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {response.expertDrafts.map((draft) => (
                <Collapsible
                  key={draft.expertId}
                  open={expandedExperts.has(draft.expertId)}
                  onOpenChange={() => toggleExpert(draft.expertId)}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{draft.expertName}</span>
                        <Badge variant="secondary">{draft.confidence}% confident</Badge>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedExperts.has(draft.expertId) ? "rotate-180" : ""}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4 space-y-3">
                    <p className="text-sm whitespace-pre-wrap">{draft.answer}</p>
                    
                    {draft.assumptions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Assumptions:</p>
                        <ul className="list-disc list-inside text-xs text-muted-foreground">
                          {draft.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                      </div>
                    )}

                    {draft.uncertainties.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Uncertainties:</p>
                        <ul className="list-disc list-inside text-xs text-muted-foreground">
                          {draft.uncertainties.map((u, i) => <li key={i}>{u}</li>)}
                        </ul>
                      </div>
                    )}

                    {/* Show critiques for this expert */}
                    {response.critiques.filter(c => c.targetExpertId === draft.expertId).map((critique, i) => (
                      <div key={i} className="mt-2 p-2 bg-muted rounded-md">
                        <p className="text-xs font-medium">Reviewed by {critique.reviewerName}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Correctness: {critique.scores.correctness}/5
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Completeness: {critique.scores.completeness}/5
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Actionability: {critique.scores.actionability}/5
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Syndic8Tester;
