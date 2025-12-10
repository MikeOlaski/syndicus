import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Webhook, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WebhookEndpoint {
  id: string;
  name: string;
  description: string | null;
  url: string;
  created_at: string;
  updated_at: string;
}

const AdminWebhooks = () => {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ name: "", description: "", url: "" });
  const [addingWebhook, setAddingWebhook] = useState(false);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from("webhook_endpoints")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error: any) {
      toast.error("Failed to load webhooks: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWebhook = async (id: string, url: string) => {
    setSavingId(id);
    try {
      const { error } = await supabase
        .from("webhook_endpoints")
        .update({ url })
        .eq("id", id);

      if (error) throw error;
      toast.success("Webhook updated successfully");
    } catch (error: any) {
      toast.error("Failed to update webhook: " + error.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleUrlChange = (id: string, newUrl: string) => {
    setWebhooks(webhooks.map(w => w.id === id ? { ...w, url: newUrl } : w));
  };

  const handleAddWebhook = async () => {
    if (!newWebhook.name.trim()) {
      toast.error("Webhook name is required");
      return;
    }

    setAddingWebhook(true);
    try {
      const { data, error } = await supabase
        .from("webhook_endpoints")
        .insert({
          name: newWebhook.name.trim().toLowerCase().replace(/\s+/g, "_"),
          description: newWebhook.description.trim() || null,
          url: newWebhook.url.trim()
        })
        .select()
        .single();

      if (error) throw error;
      
      setWebhooks([...webhooks, data]);
      setNewWebhook({ name: "", description: "", url: "" });
      setShowAddForm(false);
      toast.success("Webhook added successfully");
    } catch (error: any) {
      toast.error("Failed to add webhook: " + error.message);
    } finally {
      setAddingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete webhook "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from("webhook_endpoints")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setWebhooks(webhooks.filter(w => w.id !== id));
      toast.success("Webhook deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete webhook: " + error.message);
    }
  };

  const getWebhookLabel = (name: string) => {
    const labels: Record<string, string> = {
      add_coach_agent: "Add Coach by Agent",
    };
    return labels[name] || name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Webhook className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Webhook Endpoints</h1>
          </div>
          <p className="text-muted-foreground">
            Manage webhook URLs used across the dashboard. Changes are saved per webhook.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{getWebhookLabel(webhook.name)}</h3>
                      {webhook.description && (
                        <p className="text-sm text-muted-foreground">{webhook.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Key: <code className="bg-muted px-1 rounded">{webhook.name}</code>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteWebhook(webhook.id, webhook.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label htmlFor={`url-${webhook.id}`} className="sr-only">Webhook URL</Label>
                      <Input
                        id={`url-${webhook.id}`}
                        type="url"
                        placeholder="https://your-webhook-url.com/endpoint"
                        value={webhook.url}
                        onChange={(e) => handleUrlChange(webhook.id, e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => handleUpdateWebhook(webhook.id, webhook.url)}
                      disabled={savingId === webhook.id}
                    >
                      {savingId === webhook.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {/* Add New Webhook */}
            {showAddForm ? (
              <Card className="p-6 border-dashed">
                <h3 className="font-semibold mb-4">Add New Webhook</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-name">Name (identifier)</Label>
                    <Input
                      id="new-name"
                      placeholder="e.g., send_notification"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Will be converted to snake_case (e.g., "Send Notification" → "send_notification")
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="new-description">Description</Label>
                    <Input
                      id="new-description"
                      placeholder="What is this webhook used for?"
                      value={newWebhook.description}
                      onChange={(e) => setNewWebhook({ ...newWebhook, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-url">Webhook URL</Label>
                    <Input
                      id="new-url"
                      type="url"
                      placeholder="https://your-webhook-url.com/endpoint"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddWebhook} disabled={addingWebhook}>
                      {addingWebhook ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Add Webhook
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Webhook
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminWebhooks;