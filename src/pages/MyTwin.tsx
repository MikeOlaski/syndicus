import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Upload, FileText, Trash2, Plus, Youtube, Mic, Instagram, BookOpen, Archive, HardDrive, Database, Bot, Globe, Twitter, FileCode, StickyNote, MessageSquare, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface KnowledgeAsset {
  id: string;
  title: string;
  content: string | null;
  file_url: string | null;
  file_type: string | null;
  created_at: string;
}

const MyTwin = () => {
  const [assets, setAssets] = useState<KnowledgeAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const assetCategories = {
    popular: [
      { id: "youtube", label: "YouTube", description: "Add single videos, playlists, or entire channels", icon: Youtube, color: "text-red-500" },
      { id: "website", label: "Website", description: "Capture content from single pages to full websites", icon: Globe, color: "text-blue-500" },
      { id: "twitter", label: "X / Twitter", description: "Load all your tweets", icon: Twitter, color: "text-slate-900" },
      { id: "podcast", label: "Podcast", description: "Add a single episode or an entire series", icon: Mic, color: "text-purple-500" },
    ],
    websites: [
      { id: "website", label: "Website", description: "Capture content from single pages to full websites", icon: Globe, color: "text-blue-500" },
    ],
    youtube: [
      { id: "youtube", label: "YouTube", description: "Add single videos, playlists, or entire channels", icon: Youtube, color: "text-red-500" },
    ],
    socials: [
      { id: "instagram", label: "Instagram Account", description: "Connect your Instagram profile", icon: Instagram, color: "text-pink-500" },
      { id: "twitter", label: "X / Twitter", description: "Load all your tweets", icon: Twitter, color: "text-slate-900" },
    ],
    files: [
      { id: "pdf", label: "Upload PDF", description: "Upload PDF documents", icon: FileText, color: "text-blue-500" },
      { id: "archive", label: "Upload Archive", description: "Upload ZIP or other archive files", icon: Archive, color: "text-orange-500" },
      { id: "book", label: "Upload Book", description: "Upload ebooks or book content", icon: BookOpen, color: "text-green-500" },
    ],
    podcasts: [
      { id: "podcast", label: "Podcast", description: "Add a single episode or an entire series", icon: Mic, color: "text-purple-500" },
    ],
    snippets: [
      { id: "snippet", label: "Code Snippet", description: "Add code snippets or text snippets", icon: FileCode, color: "text-cyan-500" },
    ],
    notesApps: [
      { id: "gdrive", label: "Google Drive", description: "Connect your Google Drive", icon: HardDrive, color: "text-yellow-500" },
      { id: "notes", label: "Notes App", description: "Import from Notion, Evernote, etc.", icon: StickyNote, color: "text-amber-500" },
    ],
    messagingApps: [
      { id: "messaging", label: "Messaging App", description: "Import from Slack, Discord, etc.", icon: MessageSquare, color: "text-indigo-500" },
    ],
    advanced: [
      { id: "rag", label: "Connect RAG (Supabase)", description: "Connect to a Supabase RAG system", icon: Database, color: "text-emerald-500" },
      { id: "agent", label: "Connect Agent", description: "Connect an AI agent", icon: Bot, color: "text-indigo-500" },
    ]
  };

  const allAssetTypes = Object.values(assetCategories).flat();
  
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchAssets();
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

  const handleSelectAssetType = (typeId: string) => {
    setSelectedAssetType(typeId);
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
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-background">
              <DialogHeader>
                <DialogTitle>Add Asset to Knowledge Base</DialogTitle>
                <DialogDescription>
                  Choose the type of asset you want to add to your digital twin
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
                    {assetCategories.popular.map((type) => (
                      <Button
                        key={type.id}
                        variant="outline"
                        className="w-full h-auto p-4 flex items-start justify-between hover:bg-accent"
                        onClick={() => handleSelectAssetType(type.id)}
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
                    {assetCategories.socials.map((type) => (
                      <Button
                        key={type.id}
                        variant="outline"
                        className="w-full h-auto p-4 flex items-start justify-between hover:bg-accent"
                        onClick={() => handleSelectAssetType(type.id)}
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
                    {assetCategories.files.map((type) => (
                      <Button
                        key={type.id}
                        variant="outline"
                        className="w-full h-auto p-4 flex items-start justify-between hover:bg-accent"
                        onClick={() => handleSelectAssetType(type.id)}
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
                        {assetCategories.podcasts.map((type) => (
                          <Button
                            key={type.id}
                            variant="outline"
                            className="w-full h-auto p-4 flex items-start justify-between hover:bg-accent"
                            onClick={() => handleSelectAssetType(type.id)}
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
                        {assetCategories.notesApps.map((type) => (
                          <Button
                            key={type.id}
                            variant="outline"
                            className="w-full h-auto p-4 flex items-start justify-between hover:bg-accent"
                            onClick={() => handleSelectAssetType(type.id)}
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
                        {assetCategories.messagingApps.map((type) => (
                          <Button
                            key={type.id}
                            variant="outline"
                            className="w-full h-auto p-4 flex items-start justify-between hover:bg-accent"
                            onClick={() => handleSelectAssetType(type.id)}
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
                    {assetCategories.advanced.map((type) => (
                      <Button
                        key={type.id}
                        variant="outline"
                        className="w-full h-auto p-4 flex items-start justify-between hover:bg-accent"
                        onClick={() => handleSelectAssetType(type.id)}
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAssetType(null)}
                    >
                      ← Back
                    </Button>
                    <span>
                      Adding: {allAssetTypes.find(t => t.id === selectedAssetType)?.label}
                    </span>
                  </div>

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
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Assets</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="socials">Socials</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="apps">Apps</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading assets...</p>
              </Card>
            ) : assets.length === 0 ? (
              <Card className="p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No assets yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your digital twin by adding your first asset
                </p>
              </Card>
            ) : (
              Object.entries(assetCategories).map(([categoryKey, categoryAssets]) => {
                const categoryAssetsList = assets.filter(asset => 
                  categoryAssets.some(type => type.id === asset.file_type)
                );
                
                if (categoryAssetsList.length === 0) return null;

                return (
                  <div key={categoryKey} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold capitalize">{categoryKey.replace(/([A-Z])/g, ' $1').trim()}</h2>
                      <Badge variant="secondary">{categoryAssetsList.length}</Badge>
                    </div>
                    <div className="grid gap-4">
                      {categoryAssetsList.map((asset) => {
                        const assetType = allAssetTypes.find(t => t.id === asset.file_type);
                        const IconComponent = assetType?.icon || FileText;
                        
                        return (
                          <Card key={asset.id}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="flex items-center gap-2">
                                    <IconComponent className={`w-5 h-5 ${assetType?.color || 'text-foreground'}`} />
                                    {asset.title}
                                  </CardTitle>
                                  <CardDescription>
                                    Added {new Date(asset.created_at).toLocaleDateString()} • {assetType?.label || asset.file_type}
                                  </CardDescription>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteAsset(asset.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            {asset.content && (
                              <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                  {asset.content}
                                </p>
                              </CardContent>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          {Object.entries(assetCategories).map(([categoryKey, categoryAssets]) => (
            <TabsContent key={categoryKey} value={categoryKey} className="space-y-4">
              {assets.filter(asset => categoryAssets.some(type => type.id === asset.file_type)).length === 0 ? (
                <Card className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No {categoryKey} assets yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first {categoryKey} asset to get started
                  </p>
                  <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add {categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)} Asset
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {assets
                    .filter(asset => categoryAssets.some(type => type.id === asset.file_type))
                    .map((asset) => {
                      const assetType = allAssetTypes.find(t => t.id === asset.file_type);
                      const IconComponent = assetType?.icon || FileText;
                      
                      return (
                        <Card key={asset.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                  <IconComponent className={`w-5 h-5 ${assetType?.color || 'text-foreground'}`} />
                                  {asset.title}
                                </CardTitle>
                                <CardDescription>
                                  Added {new Date(asset.created_at).toLocaleDateString()} • {assetType?.label || asset.file_type}
                                </CardDescription>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteAsset(asset.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          {asset.content && (
                            <CardContent>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {asset.content}
                              </p>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MyTwin;
