import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Search, 
  LayoutDashboard,
  UserCheck,
  Video,
  BookOpen,
  Gift,
  Share2,
  Mail,
  Sparkles,
  Play,
  Copy,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  prompt: string;
  icon: string | null;
}

interface CoachProfile {
  specialization: string | null;
  slug: string;
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  LayoutDashboard,
  UserCheck,
  FileText,
  Video,
  BookOpen,
  Gift,
  Share2,
  Mail,
  Sparkles,
};

const CoachTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredTemplates(
        templates.filter((t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredTemplates(templates);
    }
  }, [searchQuery, templates]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch coach profile for specialization
      const { data: profile } = await supabase
        .from("coach_profiles")
        .select("specialization, slug")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setCoachProfile(profile);
      }

      // Fetch active templates
      const { data, error } = await supabase
        .from("prompt_templates")
        .select("id, name, description, category, prompt, icon")
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
      setFilteredTemplates(data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (iconName: string | null) => {
    const IconComponent = iconMap[iconName || "Sparkles"] || Sparkles;
    return <IconComponent className="w-5 h-5" />;
  };

  const getProcessedPrompt = (prompt: string) => {
    return prompt.replace(
      /\{\{specialization\}\}/g, 
      coachProfile?.specialization || "my coaching specialty"
    );
  };

  const handleCopyPrompt = async (template: Template) => {
    const processedPrompt = getProcessedPrompt(template.prompt);
    await navigator.clipboard.writeText(processedPrompt);
    setCopiedId(template.id);
    toast({ title: "Copied!", description: "Prompt copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleActivateTemplate = (template: Template) => {
    const processedPrompt = getProcessedPrompt(template.prompt);
    // Store the prompt in sessionStorage to be picked up by the chat page
    sessionStorage.setItem("pending_template_prompt", processedPrompt);
    sessionStorage.setItem("pending_template_name", template.name);
    // Navigate to the chat page
    navigate("/coach-dashboard/chat");
  };

  const categories = [...new Set(templates.map((t) => t.category))];

  return (
    <DashboardLayout requiredRole="coach">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Prompt Templates</h1>
              <p className="text-muted-foreground">
                Use these templates with your Digital Twin to generate content
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Templates by Category */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card className="p-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No templates found matching your search" : "No templates available yet"}
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => {
              const categoryTemplates = filteredTemplates.filter((t) => t.category === category);
              if (categoryTemplates.length === 0) return null;

              return (
                <div key={category}>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Badge variant="outline" className="text-sm font-normal">
                      {category}
                    </Badge>
                    <span className="text-muted-foreground text-sm">
                      ({categoryTemplates.length} templates)
                    </span>
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categoryTemplates.map((template) => (
                      <Card key={template.id} className="p-5 hover:shadow-lg transition-all hover:border-primary/50">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2.5 bg-primary/10 text-primary rounded-lg shrink-0">
                            {getIcon(template.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base">{template.name}</h3>
                            {template.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {template.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            onClick={() => handleActivateTemplate(template)}
                            size="sm"
                            className="flex-1 gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Use Template
                          </Button>
                          <Button
                            onClick={() => handleCopyPrompt(template)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            {copiedId === template.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CoachTemplates;