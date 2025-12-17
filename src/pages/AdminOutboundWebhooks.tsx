import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Webhook, 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  Play, 
  Eye, 
  EyeOff,
  Copy,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OutboundWebhook {
  id: string;
  name: string;
  description: string | null;
  url: string;
  secret_key: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  last_response_status: number | null;
  created_at: string;
}

interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  response_status: number | null;
  response_body: string | null;
  error_message: string | null;
  created_at: string;
}

const EVENT_OPTIONS = [
  { value: 'coach.published', label: 'Coach Published' },
  { value: 'coach.updated', label: 'Coach Updated' },
  { value: 'coach.unpublished', label: 'Coach Unpublished' },
];

const AdminOutboundWebhooks = () => {
  const [webhooks, setWebhooks] = useState<OutboundWebhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);

  // New webhook form state
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    description: '',
    url: '',
    events: ['coach.published', 'coach.updated', 'coach.unpublished'],
  });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from("outbound_webhooks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebhooks((data as OutboundWebhook[]) || []);
    } catch (error) {
      toast.error("Failed to load webhooks");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (webhookId: string) => {
    try {
      const { data, error } = await supabase
        .from("webhook_logs")
        .select("*")
        .eq("webhook_id", webhookId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs((data as WebhookLog[]) || []);
    } catch (error) {
      toast.error("Failed to load logs");
      console.error(error);
    }
  };

  const handleAddWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast.error("Name and URL are required");
      return;
    }

    try {
      const { error } = await supabase
        .from("outbound_webhooks")
        .insert({
          name: newWebhook.name,
          description: newWebhook.description || null,
          url: newWebhook.url,
          events: newWebhook.events,
        });

      if (error) throw error;
      
      toast.success("Webhook added successfully");
      setIsAddModalOpen(false);
      setNewWebhook({ name: '', description: '', url: '', events: ['coach.published', 'coach.updated', 'coach.unpublished'] });
      fetchWebhooks();
    } catch (error) {
      toast.error("Failed to add webhook");
      console.error(error);
    }
  };

  const handleUpdateWebhook = async (webhook: OutboundWebhook) => {
    setSavingId(webhook.id);
    try {
      const { error } = await supabase
        .from("outbound_webhooks")
        .update({
          name: webhook.name,
          description: webhook.description,
          url: webhook.url,
          events: webhook.events,
          is_active: webhook.is_active,
        })
        .eq("id", webhook.id);

      if (error) throw error;
      toast.success("Webhook updated successfully");
    } catch (error) {
      toast.error("Failed to update webhook");
      console.error(error);
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;

    try {
      const { error } = await supabase
        .from("outbound_webhooks")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Webhook deleted");
      fetchWebhooks();
    } catch (error) {
      toast.error("Failed to delete webhook");
      console.error(error);
    }
  };

  const handleTestWebhook = async (webhook: OutboundWebhook) => {
    setTestingId(webhook.id);
    try {
      const { data, error } = await supabase.functions.invoke("send-coach-webhook", {
        body: {
          event: "coach.updated",
          coachId: "test",
          coachData: {
            id: "test-id",
            slug: "test-coach",
            name: "Test Coach",
            specialization: "Testing",
            avatar_url: null,
            bio: "This is a test webhook payload",
            expertise: ["Testing", "Webhooks"],
            rating: 5.0,
            total_sessions: 100,
          },
        },
      });

      if (error) throw error;
      toast.success("Test webhook sent successfully");
      fetchWebhooks();
    } catch (error) {
      toast.error("Failed to send test webhook");
      console.error(error);
    } finally {
      setTestingId(null);
    }
  };

  const handleWebhookChange = (id: string, field: keyof OutboundWebhook, value: unknown) => {
    setWebhooks(webhooks.map(w => 
      w.id === id ? { ...w, [field]: value } : w
    ));
  };

  const toggleSecret = (id: string) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const openLogs = (webhookId: string) => {
    setSelectedWebhookId(webhookId);
    fetchLogs(webhookId);
    setIsLogsModalOpen(true);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Webhook className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Outbound Webhooks</h1>
            </div>
            <p className="text-muted-foreground">
              Send coach updates to external sites when coaches are published, updated, or unpublished.
            </p>
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Outbound Webhook</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                    placeholder="e.g., Rehabit.biz Sync"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    value={newWebhook.description}
                    onChange={(e) => setNewWebhook({ ...newWebhook, description: e.target.value })}
                    placeholder="Syncs coach data to external site"
                  />
                </div>
                <div>
                  <Label htmlFor="url">Webhook URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    placeholder="https://your-site.com/api/coach-webhook"
                  />
                </div>
                <div>
                  <Label>Events</Label>
                  <div className="space-y-2 mt-2">
                    {EVENT_OPTIONS.map((event) => (
                      <div key={event.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={event.value}
                          checked={newWebhook.events.includes(event.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event.value] });
                            } else {
                              setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== event.value) });
                            }
                          }}
                        />
                        <Label htmlFor={event.value} className="font-normal">{event.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddWebhook} className="w-full">
                  Add Webhook
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : webhooks.length === 0 ? (
          <Card className="p-12 text-center">
            <Webhook className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No webhooks configured</h3>
            <p className="text-muted-foreground mb-4">
              Add an outbound webhook to send coach updates to external sites.
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Webhook
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Input
                          value={webhook.name}
                          onChange={(e) => handleWebhookChange(webhook.id, 'name', e.target.value)}
                          className="font-semibold text-lg max-w-xs"
                        />
                        <Switch
                          checked={webhook.is_active}
                          onCheckedChange={(checked) => handleWebhookChange(webhook.id, 'is_active', checked)}
                        />
                        <Badge variant={webhook.is_active ? "default" : "secondary"}>
                          {webhook.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <Input
                        value={webhook.description || ''}
                        onChange={(e) => handleWebhookChange(webhook.id, 'description', e.target.value)}
                        placeholder="Description"
                        className="text-sm text-muted-foreground max-w-md mb-2"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {webhook.last_response_status && (
                        <Badge variant={webhook.last_response_status < 300 ? "default" : "destructive"}>
                          {webhook.last_response_status < 300 ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {webhook.last_response_status}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Webhook URL</Label>
                    <Input
                      type="url"
                      value={webhook.url}
                      onChange={(e) => handleWebhookChange(webhook.id, 'url', e.target.value)}
                      placeholder="https://your-webhook-url.com/endpoint"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Secret Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={showSecrets[webhook.id] ? "text" : "password"}
                          value={webhook.secret_key}
                          readOnly
                          className="pr-20"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleSecret(webhook.id)}
                          >
                            {showSecrets[webhook.id] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyToClipboard(webhook.secret_key)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Events</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {EVENT_OPTIONS.map((event) => (
                        <div key={event.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${webhook.id}-${event.value}`}
                            checked={webhook.events.includes(event.value)}
                            onCheckedChange={(checked) => {
                              const newEvents = checked
                                ? [...webhook.events, event.value]
                                : webhook.events.filter(e => e !== event.value);
                              handleWebhookChange(webhook.id, 'events', newEvents);
                            }}
                          />
                          <Label htmlFor={`${webhook.id}-${event.value}`} className="font-normal text-sm">
                            {event.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Last triggered: {formatDate(webhook.last_triggered_at)}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openLogs(webhook.id)}
                      >
                        View Logs
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestWebhook(webhook)}
                        disabled={testingId === webhook.id}
                      >
                        {testingId === webhook.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Test
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateWebhook(webhook)}
                        disabled={savingId === webhook.id}
                      >
                        {savingId === webhook.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Logs Modal */}
        <Dialog open={isLogsModalOpen} onOpenChange={setIsLogsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Webhook Logs</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No logs yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.event_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {log.response_status ? (
                            <Badge variant={log.response_status < 300 ? "default" : "destructive"}>
                              {log.response_status}
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Error</Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm">
                          {log.error_message || log.response_body || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminOutboundWebhooks;
