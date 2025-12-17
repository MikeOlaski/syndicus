import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, Copy, Check, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface APIKey {
  id: string;
  name: string;
  api_key: string;
  allowed_origins: string[] | null;
  permissions: string[] | null;
  is_active: boolean | null;
  last_used_at: string | null;
  created_at: string | null;
}

const AdminAPIKeys = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const { data, error } = await supabase
        .from("external_api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (key: string, id: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedId(id);
      toast.success("API key copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const getKeyDescription = (name: string): string => {
    const descriptions: Record<string, string> = {
      "rehabit.biz": "External widget integration for rehabit.biz website to display coach directory and enable chat functionality.",
      "default": "API key for external website integration. Allows listing coaches and chat functionality.",
    };
    return descriptions[name.toLowerCase()] || descriptions.default;
  };

  const maskAPIKey = (key: string): string => {
    if (key.length <= 12) return key;
    return `${key.slice(0, 8)}...${key.slice(-8)}`;
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">API Keys</h1>
              <p className="text-muted-foreground">
                Manage external API keys for third-party integrations
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : apiKeys.length === 0 ? (
          <Card className="p-8 text-center">
            <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
            <p className="text-muted-foreground">
              No external API keys have been created yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{apiKey.name}</h3>
                      {apiKey.is_active ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-600 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-600 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {getKeyDescription(apiKey.name)}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground w-20">API Key:</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {maskAPIKey(apiKey.api_key)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => copyToClipboard(apiKey.api_key, apiKey.id)}
                        >
                          {copiedId === apiKey.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {apiKey.allowed_origins && apiKey.allowed_origins.length > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-muted-foreground w-20">Origins:</span>
                          <div className="flex flex-wrap gap-1">
                            {apiKey.allowed_origins.map((origin, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                              >
                                {origin}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {apiKey.permissions && apiKey.permissions.length > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-muted-foreground w-20">Permissions:</span>
                          <div className="flex flex-wrap gap-1">
                            {apiKey.permissions.map((perm, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-muted px-2 py-0.5 rounded"
                              >
                                {perm}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {apiKey.last_used_at && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground w-20">Last used:</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(apiKey.last_used_at).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Usage Instructions */}
        <Card className="mt-8 p-6 bg-muted/30">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Integration Guide
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Use these API keys to integrate coach listings and chat on external websites:
          </p>
          <div className="bg-background rounded-lg p-4">
            <code className="text-xs block whitespace-pre-wrap font-mono">
{`// Fetch coaches list
fetch('https://hmdhiutehhxmryiowmgm.supabase.co/functions/v1/coaches-api', {
  headers: { 'x-api-key': 'YOUR_API_KEY' }
})

// Start a chat session
fetch('https://hmdhiutehhxmryiowmgm.supabase.co/functions/v1/external-chat', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY' 
  },
  body: JSON.stringify({
    coach_id: 'COACH_ID',
    message: 'Hello!'
  })
})`}
            </code>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAPIKeys;
