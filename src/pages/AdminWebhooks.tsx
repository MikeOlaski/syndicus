import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Webhook, Save, Trash2, Loader2 } from "lucide-react";
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
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminWebhooks;