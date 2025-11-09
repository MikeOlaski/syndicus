import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Upload, FileText, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

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
          file_type: "text",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Asset added to knowledge base",
      });

      setTitle("");
      setContent("");
      setShowAddForm(false);
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
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Asset</CardTitle>
              <CardDescription>
                Add text content to train your digital twin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter the content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddAsset}>Save Asset</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading assets...</p>
            </Card>
          ) : assets.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No assets yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your digital twin by adding your first asset
              </p>
            </Card>
          ) : (
            assets.map((asset) => (
              <Card key={asset.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {asset.title}
                      </CardTitle>
                      <CardDescription>
                        Added {new Date(asset.created_at).toLocaleDateString()}
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
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyTwin;
