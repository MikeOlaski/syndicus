import { supabase } from "@/integrations/supabase/client";

export interface CoachImportData {
  fullName: string;
  email: string;
}

export async function importCoaches(coaches: CoachImportData[]) {
  const { data, error } = await supabase.functions.invoke('import-coaches', {
    body: { coaches }
  });

  if (error) {
    console.error('Import error:', error);
    throw error;
  }

  return data;
}

export function parseCoachCSV(csvContent: string): CoachImportData[] {
  const lines = csvContent.split('\n').slice(1); // Skip header
  const coaches: CoachImportData[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    
    const [fullName, email] = line.split(',').map(s => s.trim());
    
    if (fullName && email) {
      coaches.push({ fullName, email });
    }
  }

  return coaches;
}
