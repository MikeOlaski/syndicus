import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Upload, FileText, Trash2, Plus, Youtube, Mic, Instagram, BookOpen, Archive, HardDrive, Database, Bot, Globe, Twitter, FileCode, StickyNote, MessageSquare, Sparkles, LucideIcon, AudioLines, Save, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { VoiceNoteModal } from "@/components/VoiceNoteModal";

interface KnowledgeAsset {
  id: string;
  title: string;
  content: string | null;
  file_url: string | null;
  file_type: string | null;
  created_at: string;
}

interface AssetType {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const MyTwin = () => {
  const [assets, setAssets] = useState<KnowledgeAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  // Define all asset types - each type exists in its primary category
  const assetTypes: Record<string, AssetType> = {
    youtube: { id: "youtube", label: "YouTube", description: "Add single videos, playlists, or entire channels", icon: Youtube, color: "text-red-500" },
    website: { id: "website", label: "Website", description: "Capture content from single pages to full websites", icon: Globe, color: "text-blue-500" },
    twitter: { id: "twitter", label: "X / Twitter", description: "Load all your tweets", icon: Twitter, color: "text-slate-700 dark:text-slate-300" },
    podcast: { id: "podcast", label: "Podcast", description: "Add a single episode or an entire series", icon: Mic, color: "text-purple-500" },
    instagram: { id: "instagram", label: "Instagram Account", description: "Connect your Instagram profile", icon: Instagram, color: "text-pink-500" },
    pdf: { id: "pdf", label: "Upload PDF", description: "Upload PDF documents", icon: FileText, color: "text-blue-500" },
    archive: { id: "archive", label: "Upload Archive", description: "Upload ZIP or other archive files", icon: Archive, color: "text-orange-500" },
    book: { id: "book", label: "Upload Book", description: "Upload ebooks or book content", icon: BookOpen, color: "text-green-500" },
    snippet: { id: "snippet", label: "Code Snippet", description: "Add code snippets or text snippets", icon: FileCode, color: "text-cyan-500" },
    gdrive: { id: "gdrive", label: "Google Drive", description: "Connect your Google Drive", icon: HardDrive, color: "text-yellow-500" },
    notes: { id: "notes", label: "Notes App", description: "Import from Notion, Evernote, etc.", icon: StickyNote, color: "text-amber-500" },
    messaging: { id: "messaging", label: "Messaging App", description: "Import from Slack, Discord, etc.", icon: MessageSquare, color: "text-indigo-500" },
    rag: { id: "rag", label: "Connect RAG (Supabase)", description: "Connect to a Supabase RAG system", icon: Database, color: "text-emerald-500" },
    agent: { id: "agent", label: "Connect N8N Agent Workflow", description: "Connect to an n8n chat agent workflow", icon: Bot, color: "text-indigo-500" },
    voice_note: { id: "voice_note", label: "Voice Note", description: "Transcribed voice recording", icon: AudioLines, color: "text-violet-500" },
  };

  // Categories with their asset type IDs
  // Popular is a curated collection of most common types that also exist in other categories
  const categoryConfig: Record<string, { label: string; typeIds: string[] }> = {
    popular: { 
      label: "Popular", 
      typeIds: ["youtube", "website", "twitter", "podcast"] // These also exist in their own categories
    },
    websites: { 
      label: "Websites", 
      typeIds: ["website"] 
    },
    youtube: { 
      label: "YouTube", 
      typeIds: ["youtube"] 
    },
    socials: { 
      label: "Socials", 
      typeIds: ["instagram", "twitter"] // YouTube is NOT in socials, it has its own category
    },
    files: { 
      label: "Files", 
      typeIds: ["pdf", "archive", "book"] 
    },
    podcasts: { 
      label: "Podcasts", 
      typeIds: ["podcast"] 
    },
    snippets: { 
      label: "Snippets", 
      typeIds: ["snippet"] 
    },
    notesApps: { 
      label: "Notes Apps", 
      typeIds: ["gdrive", "notes"] 
    },
    messagingApps: { 
      label: "Messaging Apps", 
      typeIds: ["messaging"] 
    },
    advanced: { 
      label: "Advanced", 
      typeIds: ["rag", "agent"] 
    }
  };

  const getAssetTypesForCategory = (categoryKey: string): AssetType[] => {
    const config = categoryConfig[categoryKey];
    if (!config) return [];
    return config.typeIds.map(id => assetTypes[id]).filter(Boolean);
  };

  const allAssetTypes = Object.values(assetTypes);
  
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchAssets();
    fetchWebhookUrl();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("knowledge_base")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast({
        title: "Error",
        description: "Failed to load knowledge base assets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWebhookUrl = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("coach_profiles")
        .select("webhook_url")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setWebhookUrl(data?.webhook_url || "");
    } catch (error) {
      console.error("Error fetching webhook URL:", error);
    }
  };

  const handleSaveWebhook = async () => {
    setIsSavingWebhook(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("coach_profiles")
        .update({ webhook_url: webhookUrl })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "n8n Webhook URL saved",
      });
      setShowWebhookModal(false);
    } catch (error) {
      console.error("Error saving webhook:", error);
      toast({
        title: "Error",
        description: "Failed to save webhook URL",
        variant: "destructive",
      });
    } finally {
      setIsSavingWebhook(false);
    }
  };

  const handleSelectAssetType = (typeId: string) => {
    if (typeId === "agent") {
      setShowWebhookModal(true);
      return;
    }
    setSelectedAssetType(typeId);
    setShowAddModal(true);
  };

  const handleAddAsset = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("knowledge_base")
        .insert({
          coach_id: user.id,
          title,
          content,
          file_type: selectedAssetType || "text",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Asset added to knowledge base",
      });

      setTitle("");
      setContent("");
      setSelectedAssetType(null);
      setShowAddModal(false);
      fetchAssets();
    } catch (error) {
      console.error("Error adding asset:", error);
      toast({
        title: "Error",
        description: "Failed to add asset",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      const { error } = await supabase
        .from("knowledge_base")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Asset deleted",
      });
      fetchAssets();
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast({
        title: "Error",
        description: "Failed to delete asset",
        variant: "destructive",
      });
    }
  };

  // Component for rendering an asset type row with + button
  const AssetTypeRow = ({ type, showBorder = true }: { type: AssetType; showBorder?: boolean }) => (
    <Button
      variant="ghost"
      className={`w-full h-auto p-4 flex items-center justify-between hover:bg-accent rounded-none ${showBorder ? 'border-b border-border' : ''}`}
      onClick={() => handleSelectAssetType(type.id)}
    >
      <div className="flex items-center gap-3">
        <type.icon className={`w-5 h-5 ${type.color}`} />
        <div className="text-left">
          <div className="font-medium text-sm">{type.label}</div>
          <div className="text-xs text-muted-foreground">{type.description}</div>
        </div>
      </div>
      <Plus className="w-4 h-4 text-muted-foreground" />
    </Button>
  );

  // Component for rendering a category section
  const CategorySection = ({ categoryKey, showEmpty = true }: { categoryKey: string; showEmpty?: boolean }) => {
    const config = categoryConfig[categoryKey];
    if (!config) return null;
    
    const categoryTypes = getAssetTypesForCategory(categoryKey);
    const categoryAssets = assets.filter(asset => 
      config.typeIds.includes(asset.file_type || '')
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{config.label}</h2>
          {categoryAssets.length > 0 && (
            <Badge variant="secondary">{categoryAssets.length}</Badge>
          )}
        </div>
        
        {/* Asset type options - always visible */}
        <Card className="overflow-hidden">
          {categoryTypes.map((type, index) => (
            <AssetTypeRow 
              key={type.id} 
              type={type} 
              showBorder={index < categoryTypes.length - 1}
            />
          ))}
        </Card>

        {/* Existing assets */}
        {categoryAssets.length > 0 && (
          <div className="grid gap-3 mt-4">
            {categoryAssets.map((asset) => {
              const assetType = assetTypes[asset.file_type || ''];
              const IconComponent = assetType?.icon || FileText;
              
              return (
                <Card key={asset.id}>
                  <CardHeader className="py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <IconComponent className={`w-4 h-4 ${assetType?.color || 'text-foreground'}`} />
                          {asset.title}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Added {new Date(asset.created_at).toLocaleDateString()} • {assetType?.label || asset.file_type}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteAsset(asset.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  {asset.content && (
                    <CardContent className="pt-0 pb-3">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {asset.content}
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout requiredRole="coach">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Digital Twin</h1>
            <p className="text-muted-foreground">
              Build your AI knowledge base by adding content and documents
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowVoiceModal(true)}>
              <AudioLines className="w-4 h-4 mr-2" />
              Add Voice Note
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>

        {/* Voice Note Modal */}
        <VoiceNoteModal
          open={showVoiceModal}
          onOpenChange={setShowVoiceModal}
          onSuccess={fetchAssets}
        />

        {/* n8n Webhook URL Modal */}
        <Dialog open={showWebhookModal} onOpenChange={setShowWebhookModal}>
          <DialogContent className="sm:max-w-[600px] bg-background">
            <DialogHeader>
              <DialogTitle>n8n Webhook URL</DialogTitle>
              <DialogDescription>
                Connect this coach to an n8n chat agent workflow
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://n8n.example.com/webhook/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleSaveWebhook}
                  disabled={isSavingWebhook}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
              {webhookUrl && (
                <p className="text-xs text-muted-foreground">
                  Your chat interface will use this webhook to communicate with your n8n agent workflow.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Asset Modal */}
        <Dialog open={showAddModal} onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) {
            setSelectedAssetType(null);
            setTitle("");
            setContent("");
          }
        }}>
          <DialogContent className="sm:max-w-[600px] bg-background">
            <DialogHeader>
              <DialogTitle>Add Asset to Knowledge Base</DialogTitle>
              <DialogDescription>
                {selectedAssetType 
                  ? `Adding: ${assetTypes[selectedAssetType]?.label}`
                  : "Choose the type of asset you want to add to your digital twin"
                }
              </DialogDescription>
            </DialogHeader>

            {!selectedAssetType ? (
              <Tabs defaultValue="popular" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-4">
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="socials">Socials</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="apps">Apps</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="popular" className="space-y-2">
                  {getAssetTypesForCategory('popular').map((type) => (
                    <Button
                      key={type.id}
                      variant="outline"
                      className="w-full h-auto p-4 flex items-start justify-between hover:bg-accent"
                      onClick={() => setSelectedAssetType(type.id)}
                    >
                      <div className="flex items-start gap-3">
                        <type.icon className={`w-6 h-6 mt-1 ${type.color}`} />
                        <div className="text-left">
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 mt-1" />
                    </Button>
                  ))}
                </TabsContent>

                <TabsContent value="socials" className="space-y-2">
                  {getAssetTypesForCategory('socials').map((type) => (
                    <Button
                      key={type.id}
                      variant="outline"
                      className="w-full h-auto p-4 flex items-start justify-between hover:bg-accent"
                      onClick={() => setSelectedAssetType(type.id)}
                    >
                      <div className="flex items-start gap-3">
                        <type.icon className={`w-6 h-6 mt-1 ${type.color}`} />
                        <div className="text-left">
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 mt-1" />
                    </Button>
                  ))}
                </TabsContent>

                <TabsContent value="files" className="space-y-2">
                  {getAssetTypesForCategory('files').map((type) => (
                    <Button
                      key={type.id}
                      variant="outline"
                      className="w-full h-auto p-4 flex items-start justify-between hover:bg-accent"
                      onClick={() => setSelectedAssetType(type.id)}
                    >
                      <div className="flex items-start gap-3">
                        <type.icon className={`w-6 h-6 mt-1 ${type.color}`} />
                        <div className="text-left">
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 mt-1" />
                    </Button>
                  ))}
                </TabsContent>

                <TabsContent value="apps" className="space-y-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Podcasts</h3>
                      {getAssetTypesForCategory('podcasts').map((type) => (
                        <Button
                          key={type.id}
                          variant="outline"
                          className="w-full h-auto p-4 flex items-start justify-between hover:bg-accent"
                          onClick={() => setSelectedAssetType(type.id)}
                        >
                          <div className="flex items-start gap-3">
                            <type.icon className={`w-6 h-6 mt-1 ${type.color}`} />
                            <div className="text-left">
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                          <Plus className="w-4 h-4 mt-1" />
                        </Button>
                      ))}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Notes Apps</h3>
                      {getAssetTypesForCategory('notesApps').map((type) => (
                        <Button
                          key={type.id}
                          variant="outline"
                          className="w-full h-auto p-4 flex items-start justify-between hover:bg-accent"
                          onClick={() => setSelectedAssetType(type.id)}
                        >
                          <div className="flex items-start gap-3">
                            <type.icon className={`w-6 h-6 mt-1 ${type.color}`} />
                            <div className="text-left">
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                          <Plus className="w-4 h-4 mt-1" />
                        </Button>
                      ))}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Messaging Apps</h3>
                      {getAssetTypesForCategory('messagingApps').map((type) => (
                        <Button
                          key={type.id}
                          variant="outline"
                          className="w-full h-auto p-4 flex items-start justify-between hover:bg-accent"
                          onClick={() => setSelectedAssetType(type.id)}
                        >
                          <div className="flex items-start gap-3">
                            <type.icon className={`w-6 h-6 mt-1 ${type.color}`} />
                            <div className="text-left">
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                          <Plus className="w-4 h-4 mt-1" />
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-2">
                  {getAssetTypesForCategory('advanced').map((type) => (
                    <Button
                      key={type.id}
                      variant="outline"
                      className="w-full h-auto p-4 flex items-start justify-between hover:bg-accent"
                      onClick={() => setSelectedAssetType(type.id)}
                    >
                      <div className="flex items-start gap-3">
                        <type.icon className={`w-6 h-6 mt-1 ${type.color}`} />
                        <div className="text-left">
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 mt-1" />
                    </Button>
                  ))}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-4 py-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAssetType(null)}
                  className="mb-2"
                >
                  ← Back to asset types
                </Button>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., My coaching philosophy"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content / URL</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter the content or URL here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddAsset}>Save Asset</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedAssetType(null);
                      setTitle("");
                      setContent("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Main View with Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="websites">Websites</TabsTrigger>
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
            <TabsTrigger value="socials">Socials</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
            <TabsTrigger value="snippets">Snippets</TabsTrigger>
            <TabsTrigger value="notesApps">Notes Apps</TabsTrigger>
            <TabsTrigger value="messagingApps">Messaging</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading assets...</p>
              </Card>
            ) : (
              <>
                <CategorySection categoryKey="popular" />
                <CategorySection categoryKey="websites" />
                <CategorySection categoryKey="youtube" />
                <CategorySection categoryKey="socials" />
                <CategorySection categoryKey="files" />
                <CategorySection categoryKey="podcasts" />
                <CategorySection categoryKey="snippets" />
                <CategorySection categoryKey="notesApps" />
                <CategorySection categoryKey="messagingApps" />
                <CategorySection categoryKey="advanced" />
              </>
            )}
          </TabsContent>

          {Object.keys(categoryConfig).map((categoryKey) => (
            <TabsContent key={categoryKey} value={categoryKey} className="space-y-4">
              <CategorySection categoryKey={categoryKey} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MyTwin;
