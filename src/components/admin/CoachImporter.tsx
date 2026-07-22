import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { importCoaches, CoachImportData } from "@/utils/importCoaches";
import { Upload, Loader2 } from "lucide-react";

const specializations = [
  "Life Coaching", "Relationship Coaching", "Business & Leadership",
  "Health & Wellness", "Mindfulness & Meditation", "Personal Development",
  "Career Coaching", "Financial Coaching", "Parenting & Family",
  "Spiritual Guidance", "Trauma Recovery", "Performance Coaching"
];

const personalities = [
  "Empathetic and supportive", "Direct and action-oriented",
  "Analytical and strategic", "Creative and intuitive",
  "Warm and encouraging", "Challenging and motivational"
];

const expertiseSets = [
  ["Mindfulness", "Meditation", "Stress Management"],
  ["Relationships", "Communication", "Conflict Resolution"],
  ["Leadership", "Strategy", "Team Building"],
  ["Fitness", "Nutrition", "Holistic Health"],
  ["Goal Setting", "Productivity", "Time Management"],
  ["Self-Discovery", "Purpose", "Transformation"],
  ["Career Development", "Job Search", "Networking"],
  ["Financial Planning", "Wealth Building", "Money Mindset"],
  ["Parenting", "Family Dynamics", "Work-Life Balance"],
  ["Spirituality", "Inner Peace", "Connection"],
  ["Trauma Healing", "PTSD Recovery", "Emotional Resilience"],
  ["Performance", "Achievement", "Excellence"]
];

const csvData = `Danita Young (Jay Crew Upwork),rehabit+danita+young@mikeolaski.com
Mike Olaski,rehabit+mike+olaski@mikeolaski.com
Radek Sefcik,rehabit+radek+sefcik@mikeolaski.com
Sonia Ricotti,rehabit+sonia+ricotti@mikeolaski.com
Barnet Bain,rehabit+barnet+bain@mikeolaski.com
Julian Cowan Hill,rehabit+julian+cowan@mikeolaski.com
Korina Lymnioudi,rehabit+korina+lymnioudi@mikeolaski.com
Dr. Russell Kennedy,rehabit+dr+russell@mikeolaski.com
Dr. Nima Rahmany,rehabit+dr+nima@mikeolaski.com
Nathan Oxenfeld,rehabit+nathan+oxenfeld@mikeolaski.com
Noah Allen,rehabit+noah+allen@mikeolaski.com
Josh Hudson,rehabit+josh+hudson@mikeolaski.com
Sarah Rosensweet,rehabit+sarah+rosensweet@mikeolaski.com
Chris Blundell,rehabit+chris+blundell@mikeolaski.com
Trevor Turnbull,rehabit+trevor+turnbull@mikeolaski.com
Brent May,rehabit+brent+may@mikeolaski.com
Stacy Thomas,rehabit+stacy+thomas@mikeolaski.com
Chris Hemingway,rehabit+chris+hemingway@mikeolaski.com
Kasper Larsen,rehabit+kasper+larsen@mikeolaski.com
Melissa Metrano,rehabit+melissa+metrano@mikeolaski.com
Jovanka Ciares,rehabit+jovanka+ciares@mikeolaski.com
Carolin von Breitenbuch,rehabit+carolin+von@mikeolaski.com
Dale Shover,rehabit+dale+shover@mikeolaski.com
Cath Gonzalez,rehabit+cath+gonzalez@mikeolaski.com
Brenda Turner,rehabit+brenda+turner@mikeolaski.com
Heidi Priebe,rehabit+heidi+priebe@mikeolaski.com
Grace Smith,rehabit+grace+smith@mikeolaski.com
Marisa Murgatroyd,rehabit+marisa+murgatroyd@mikeolaski.com
Geoffrey Setiawan,rehabit+geoffrey+setiawan@mikeolaski.com
Dan Buglio,rehabit+dan+buglio@mikeolaski.com
Quazi Johir,rehabit+quazi+johir@mikeolaski.com
Shaan Kassam,rehabit+shaan+kassam@mikeolaski.com
David Deida,rehabit+david+deida@mikeolaski.com
Robert Glover,rehabit+robert+glover@mikeolaski.com
Max Kramer,rehabit+max+kramer@mikeolaski.com
Brian Scott,rehabit+brian+scott@mikeolaski.com
Sunny Lenarduzzi,rehabit+sunny+lenarduzzi@mikeolaski.com
Mary Morrissey,rehabit+mary+morrissey@mikeolaski.com
Natalie Ledwell,rehabit+natalie+ledwell@mikeolaski.com
Nicole Lapera,rehabit+nicole+lapera@mikeolaski.com
Regan Hillyer,rehabit+regan+hillyer@mikeolaski.com
Dr. Shefali Tsabary,rehabit+dr+shefali@mikeolaski.com
Joshua Tongol,rehabit+joshua+tongol@mikeolaski.com
Thais Gibson,rehabit+thais+gibson@mikeolaski.com
Nick Saerev,rehabit+nick+saerev@mikeolaski.com
Joe Dispenza,rehabit+joe+dispenza@mikeolaski.com
Bob Proctor,rehabit+bob+proctor@mikeolaski.com
Dan Martell,rehabit+dan+martell@mikeolaski.com
Becky Kennedy,rehabit+becky+kennedy@mikeolaski.com
Mark Rober,rehabit+mark+rober@mikeolaski.com
Sandy Breathe,rehabit+breathe+with@mikeolaski.com
Brian Tracy,rehabit+brian+tracy@mikeolaski.com
Joe Beam,rehabit+joe+beam@mikeolaski.com
John Gottman,rehabit+john+gottman@mikeolaski.com
John Griffin,rehabit+john+griffin@mikeolaski.com
Jessica Connor,rehabit+jessica+connor@mikeolaski.com
Liam Evans,rehabit+liam+evans@mikeolaski.com
Rekha Tak Magon,rehabit+rekha+tak@mikeolaski.com
Ken Honda,rehabit+ken+honda@mikeolaski.com
Alan Watts,rehabit+alan+watts@mikeolaski.com
Lee Davy,rehabit+lee+davy@mikeolaski.com
Dennis Simsek,rehabit+dennis+simsek@mikeolaski.com
Oliver Cowlishaw,rehabit+oliver+cowlishaw@mikeolaski.com
Hasan Khan,rehabit+hasan+khan@mikeolaski.com
Jessica Knight,rehabit+jessica+knight@mikeolaski.com
Oscar Patel,rehabit+oscar+patel@mikeolaski.com
Lisa Romano,rehabit+lisa+romano@mikeolaski.com
Karyn Seitz,rehabit+karyn+seitz@mikeolaski.com
Christine Jewell,rehabit+christine+jewell@mikeolaski.com
Tim Fletcher,rehabit+tim+fletcher@mikeolaski.com
Adam Lane Smith,rehabit+adam+lane@mikeolaski.com
Rick Reynolds,rehabit+rick+reynolds@mikeolaski.com
Steve Horsmon,rehabit+steve+horsmon@mikeolaski.com
Kim Foster,rehabit+kim+foster@mikeolaski.com
Felix Harter,rehabit+felix+harter@mikeolaski.com
Rob Dial,rehabit+rob+dial@mikeolaski.com
Doug Bopst,rehabit+doug+bopst@mikeolaski.com
Bobby Rio,rehabit+bobby+rio@mikeolaski.com
Leon Hendrix,rehabit+leon+hendrix@mikeolaski.com
David McEwen,rehabit+david+mcewen@mikeolaski.com
Ashley Lima,rehabit+ashley+lima@mikeolaski.com
Laurin Ponce,rehabit+laurin+ponce@mikeolaski.com
Nichole Sachs,rehabit+nichole+sachs@mikeolaski.com
Melissa Adams,rehabit+melissa+adams@mikeolaski.com
Jessica Morgan,rehabit+jessica+morgan@mikeolaski.com
Josiah Brandt,rehabit+josiah+brandt@mikeolaski.com
Karl Moore,rehabit+karl+moore@mikeolaski.com
Dan Koe,rehabit+dan+koe@mikeolaski.com
Jefferson Fisher,rehabit+jefferson+fisher@mikeolaski.com
David Bayer,rehabit+david+bayer@mikeolaski.com
Andre Duqum,rehabit+andre+duqum@mikeolaski.com
Lubo Dzubak,rehabit+lubo+dzubak@mikeolaski.com
Michael Elliot,rehabit+michael+elliot@mikeolaski.com
Mark Romero,rehabit+mark+romero@mikeolaski.com
Irene Lyon,rehabit+irene+lyon@mikeolaski.com
Cassandra Bodzak,rehabit+cassandra+bodzak@mikeolaski.com
Sahara Rose,rehabit+sahara+rose@mikeolaski.com
Darcy Murphy,rehabit+darcy+murphy@mikeolaski.com
Peter Crone,rehabit+peter+crone@mikeolaski.com
Jillian Turecki,rehabit+jillian+turecki@mikeolaski.com`;

export const CoachImporter = ({ onImportComplete }: { onImportComplete: () => void }) => {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const parseCSV = (): CoachImportData[] => {
    const lines = csvData.split('\n');
    const coaches: CoachImportData[] = [];
    const seen = new Set<string>();

    for (const line of lines) {
      if (!line.trim()) continue;
      
      const [fullName, email] = line.split(',').map(s => s.trim());
      
      // Skip if missing email or invalid format
      if (!email || !email.includes('@')) continue;
      
      // Skip duplicates (case-insensitive email check)
      const emailKey = email.toLowerCase();
      if (seen.has(emailKey)) continue;
      seen.add(emailKey);
      
      // Clean up name
      let cleanName = fullName
        .replace(/\(.*?\)/g, '') // Remove parentheses content
        .replace(/\s+-\s+.*/g, '') // Remove dashes and everything after
        .replace(/https?:\/\/.*/g, '') // Remove URLs
        .trim();
      
      if (!cleanName) cleanName = email.split('@')[0].replace(/[+]/g, ' ');
      
      if (cleanName && email) {
        coaches.push({ fullName: cleanName, email });
      }
    }

    return coaches;
  };

  const handleImport = async () => {
    setIsImporting(true);
    
    try {
      const coaches = parseCSV();
      
      toast({
        title: "Starting Import",
        description: `Importing ${coaches.length} coaches...`,
      });

      const result = await importCoaches(coaches);
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${result.imported} coaches. ${result.failed} failed.`,
      });

      onImportComplete();
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import coaches",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold mb-2">Import Coaches from CSV</h3>
          <p className="text-sm text-muted-foreground">
            Import ~100 coaches with placeholder data (specializations, bios, ratings, etc.)
          </p>
        </div>
        <Button
          onClick={handleImport}
          disabled={isImporting}
          size="lg"
          className="gap-2"
        >
          {isImporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Import Coaches
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
