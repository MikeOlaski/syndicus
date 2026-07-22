import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Play, RefreshCw, CheckCircle, XCircle, Clock, TrendingUp, Target, Zap } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface EvalCase {
  id: string;
  question: string;
  expected_council_template: string;
  expected_themes: Json;
  difficulty: string;
  category: string;
  is_active: boolean;
}

interface EvalResult {
  id: string;
  eval_case_id: string;
  group_id: string;
  scores: Json;
  latency_ms: number | null;
  passed: boolean | null;
  notes: string | null;
  created_at: string;
  syndic8_eval_cases?: EvalCase | null;
}

interface EvalSummary {
  totalEvaluations: number;
  passRate: number;
  averageScores: {
    coherence: number;
    expertUtilization: number;
    dissentAccuracy: number;
    actionability: number;
    themeCoverage: number;
    overall: number;
  } | null;
}

interface Syndic8Group {
  id: string;
  name: string;
}

const AdminSyndic8Eval = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<EvalCase[]>([]);
  const [results, setResults] = useState<EvalResult[]>([]);
  const [groups, setGroups] = useState<Syndic8Group[]>([]);
  const [summary, setSummary] = useState<EvalSummary | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedCase, setSelectedCase] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch eval cases
      const { data: casesData } = await supabase
        .from("syndic8_eval_cases")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });

      // Fetch recent results with case info
      const { data: resultsData } = await supabase
        .from("syndic8_eval_results")
        .select("*, syndic8_eval_cases(*)")
        .order("created_at", { ascending: false })
        .limit(50);

      // Fetch groups for selection
      const { data: groupsData } = await supabase
        .from("syndic8_groups")
        .select("id, name")
        .order("name");

      // Fetch summary from edge function
      const { data: summaryData } = await supabase.functions.invoke("syndic8-eval/summary", {
        method: "GET"
      });

      setCases(casesData || []);
      setResults(resultsData || []);
      setGroups(groupsData || []);
      setSummary(summaryData);
    } catch (error) {
      console.error("Error fetching eval data:", error);
      toast.error("Failed to load evaluation data");
    } finally {
      setLoading(false);
    }
  };

  const runSingleEval = async () => {
    if (!selectedGroup || !selectedCase) {
      toast.error("Please select a group and test case");
      return;
    }

    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("syndic8-eval", {
        body: { evalCaseId: selectedCase, groupId: selectedGroup }
      });

      if (error) throw error;

      if (data.passed) {
        toast.success(`Evaluation passed! Score: ${data.scores.overall}%`);
      } else {
        toast.warning(`Evaluation failed. Score: ${data.scores.overall}%`);
      }

      fetchData();
    } catch (error) {
      console.error("Eval error:", error);
      toast.error("Evaluation failed");
    } finally {
      setRunning(false);
    }
  };

  const runBatchEval = async (difficulty?: string) => {
    if (!selectedGroup) {
      toast.error("Please select a group first");
      return;
    }

    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("syndic8-eval/batch", {
        body: { groupId: selectedGroup, difficulty, limit: 5 }
      });

      if (error) throw error;

      toast.success(`Batch complete: ${data.passed}/${data.totalCases} passed (${data.passRate}%)`);
      fetchData();
    } catch (error) {
      console.error("Batch eval error:", error);
      toast.error("Batch evaluation failed");
    } finally {
      setRunning(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500/10 text-green-500";
      case "medium": return "bg-yellow-500/10 text-yellow-500";
      case "hard": return "bg-red-500/10 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Syndic8 Evaluation</h1>
            <p className="text-muted-foreground">Test and evaluate council response quality</p>
          </div>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Evaluations</p>
                  <p className="text-2xl font-bold">{summary?.totalEvaluations || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pass Rate</p>
                  <p className="text-2xl font-bold">{summary?.passRate || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Zap className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Overall Score</p>
                  <p className="text-2xl font-bold">{summary?.averageScores?.overall || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-500/10">
                  <Clock className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Coherence</p>
                  <p className="text-2xl font-bold">{summary?.averageScores?.coherence || 0}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="run" className="space-y-4">
          <TabsList>
            <TabsTrigger value="run">Run Evaluations</TabsTrigger>
            <TabsTrigger value="results">Results History</TabsTrigger>
            <TabsTrigger value="cases">Test Cases</TabsTrigger>
          </TabsList>

          <TabsContent value="run" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Run Evaluation</CardTitle>
                <CardDescription>Test council response quality against predefined cases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Syndic8 Group</label>
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a group..." />
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
                    <label className="text-sm font-medium">Select Test Case</label>
                    <Select value={selectedCase} onValueChange={setSelectedCase}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a test case..." />
                      </SelectTrigger>
                      <SelectContent>
                        {cases.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getDifficultyColor(c.difficulty)}>
                                {c.difficulty}
                              </Badge>
                              <span className="truncate max-w-[200px]">{c.question}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={runSingleEval} disabled={running || !selectedGroup || !selectedCase}>
                    {running ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                    Run Single Evaluation
                  </Button>
                  <Button variant="outline" onClick={() => runBatchEval("easy")} disabled={running || !selectedGroup}>
                    Run Easy Batch
                  </Button>
                  <Button variant="outline" onClick={() => runBatchEval("medium")} disabled={running || !selectedGroup}>
                    Run Medium Batch
                  </Button>
                  <Button variant="outline" onClick={() => runBatchEval("hard")} disabled={running || !selectedGroup}>
                    Run Hard Batch
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Recent Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Overall</TableHead>
                      <TableHead>Coherence</TableHead>
                      <TableHead>Actionability</TableHead>
                      <TableHead>Latency</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map(result => {
                      const scores = result.scores as { coherence?: number; overall?: number; actionability?: number } | null;
                      return (
                      <TableRow key={result.id}>
                        <TableCell>
                          {result.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {result.syndic8_eval_cases?.question || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={scores?.overall || 0} className="w-16 h-2" />
                            <span className="text-sm">{scores?.overall || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{scores?.coherence || 0}/5</TableCell>
                        <TableCell>{scores?.actionability || 0}/5</TableCell>
                        <TableCell>{Math.round((result.latency_ms || 0) / 1000)}s</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(result.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );})}
                    {results.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No evaluation results yet. Run some tests to see results here.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cases">
            <Card>
              <CardHeader>
                <CardTitle>Test Cases ({cases.length})</CardTitle>
                <CardDescription>Predefined questions for evaluating council quality</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Expected Themes</TableHead>
                      <TableHead>Template</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cases.map(c => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Badge variant="outline" className={getDifficultyColor(c.difficulty)}>
                            {c.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{c.category}</TableCell>
                        <TableCell className="max-w-[300px]">{c.question}</TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {Array.isArray(c.expected_themes) ? (c.expected_themes as string[]).join(", ") : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{c.expected_council_template}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminSyndic8Eval;
