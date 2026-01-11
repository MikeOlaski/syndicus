import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormattedMessage } from "@/components/ui/formatted-message";
import type { CouncilMessage as CouncilMessageType, ExpertDraft, ExpertCritique } from "@/hooks/useSyndic8Chat";

interface CouncilMessageProps {
  message: CouncilMessageType;
  showExpertReasoning: boolean;
}

const ExpertDraftCard = ({ draft }: { draft: ExpertDraft }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Card className="p-3 bg-muted/50 border-muted">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
            {draft.expertName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-sm">{draft.expertName}</p>
            <Badge variant="outline" className="text-xs">
              {draft.confidence}% confident
            </Badge>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t space-y-3">
          <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
            <FormattedMessage content={draft.answer} />
          </div>
          
          {draft.assumptions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Assumptions:</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {draft.assumptions.map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>
          )}
          
          {draft.uncertainties.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Uncertainties:</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {draft.uncertainties.map((u, i) => (
                  <li key={i}>• {u}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

const CritiqueCard = ({ critique, expertName }: { critique: ExpertCritique; expertName: string }) => {
  const avgScore = (
    (critique.scores.correctness + critique.scores.completeness + critique.scores.actionability) / 3
  ).toFixed(1);
  
  return (
    <div className="p-2 bg-muted/30 rounded text-xs">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium">{critique.reviewerName} → {expertName}</span>
        <Badge variant={Number(avgScore) >= 4 ? "default" : "secondary"} className="text-xs">
          {avgScore}/5
        </Badge>
      </div>
      {critique.strengths.length > 0 && (
        <p className="text-muted-foreground">✓ {critique.strengths[0]}</p>
      )}
      {critique.improvements.length > 0 && (
        <p className="text-muted-foreground">↑ {critique.improvements[0]}</p>
      )}
    </div>
  );
};

export const CouncilMessage = ({ message, showExpertReasoning }: CouncilMessageProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <Card className="max-w-[85%] p-4 bg-primary text-primary-foreground">
          <p className="whitespace-pre-wrap">{message.content}</p>
          <p className="text-xs opacity-70 mt-2">{message.timestamp}</p>
        </Card>
      </div>
    );
  }
  
  if (message.role === "system") {
    return (
      <div className="flex justify-center">
        <Card className="max-w-[90%] p-4 bg-muted/50 border-muted">
          <div className="prose prose-sm dark:prose-invert max-w-none text-center">
            <FormattedMessage content={message.content} />
          </div>
        </Card>
      </div>
    );
  }
  
  // Synthesis message
  const { synthesis, expertDrafts, critiques, metadata } = message;
  
  return (
    <div className="flex justify-start">
      <Card className={cn(
        "max-w-[90%] p-4",
        metadata?.hasSignificantDissent && "border-amber-500/50"
      )}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Council Synthesis</p>
            <div className="flex items-center gap-2">
              {synthesis && (
                <Badge variant="outline" className="text-xs">
                  {synthesis.confidence}% confidence
                </Badge>
              )}
              {metadata?.councilSize && (
                <span className="text-xs text-muted-foreground">
                  {metadata.councilSize} experts
                </span>
              )}
              {metadata?.hasSignificantDissent && (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-500">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Dissent
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Answer */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
          <FormattedMessage content={message.content} />
        </div>
        
        {/* Consensus & Dissent Summary */}
        {synthesis && (
          <div className="space-y-3 mb-4">
            {synthesis.consensusPoints.length > 0 && (
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                    Council Consensus:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {synthesis.consensusPoints.slice(0, 3).map((point, i) => (
                      <li key={i}>• {point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {synthesis.dissentSummary && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                    Points of Disagreement:
                  </p>
                  <p className="text-xs text-muted-foreground">{synthesis.dissentSummary}</p>
                </div>
              </div>
            )}
            
            {synthesis.nextSteps.length > 0 && (
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-primary mb-1">
                    Recommended Next Steps:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {synthesis.nextSteps.slice(0, 3).map((step, i) => (
                      <li key={i}>{i + 1}. {step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Expert Reasoning Toggle */}
        {(showExpertReasoning || expertDrafts?.length) && expertDrafts && expertDrafts.length > 0 && (
          <div className="pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full justify-between text-xs"
            >
              <span className="flex items-center gap-2">
                <Lightbulb className="w-3 h-3" />
                View Expert Reasoning ({expertDrafts.length} perspectives)
              </span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            
            {showDetails && (
              <div className="mt-3 space-y-3">
                {/* Expert Drafts */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Individual Expert Perspectives:</p>
                  <div className="space-y-2">
                    {expertDrafts.map((draft) => (
                      <ExpertDraftCard key={draft.expertId} draft={draft} />
                    ))}
                  </div>
                </div>
                
                {/* Critiques */}
                {critiques && critiques.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Cross-Review Scores:</p>
                    <div className="space-y-1">
                      {critiques.map((critique, i) => {
                        const targetExpert = expertDrafts.find(d => d.expertId === critique.targetExpertId);
                        return (
                          <CritiqueCard 
                            key={i} 
                            critique={critique} 
                            expertName={targetExpert?.expertName || "Expert"}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-3">{message.timestamp}</p>
      </Card>
    </div>
  );
};
