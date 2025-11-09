import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import CoachCard from "./CoachCard";

const categories = [
  "All",
  "Leadership",
  "Wellness",
  "Career",
  "Business",
  "Relationships",
  "Performance",
];

const coaches = [
  {
    name: "Dr. Sarah Chen",
    specialization: "Executive Leadership",
    rating: 4.9,
    clients: 260,
    description: "Transform your leadership style with AI-powered insights and personalized coaching strategies.",
    personality: "Strategic, analytical, and empowering",
    tags: ["Leadership", "Strategy", "C-Suite"],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    variant: "primary" as const,
  },
  {
    name: "Marcus Rodriguez",
    specialization: "Life & Wellness",
    rating: 4.8,
    clients: 195,
    description: "Achieve work-life balance and personal growth through holistic coaching approaches.",
    personality: "Supportive, motivational, and intuitive",
    tags: ["Wellness", "Balance", "Growth"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    variant: "secondary" as const,
  },
  {
    name: "Jennifer Park",
    specialization: "Career Transition",
    rating: 4.9,
    clients: 340,
    description: "Navigate career changes with confidence using data-driven coaching and AI insights.",
    personality: "Practical, encouraging, and results-focused",
    tags: ["Career", "Transition", "Planning"],
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    variant: "secondary" as const,
  },
  {
    name: "David Thompson",
    specialization: "Business Growth",
    rating: 4.7,
    clients: 166,
    description: "Scale your business with strategic coaching powered by advanced AI analytics.",
    personality: "Ambitious, tactical, and innovation-driven",
    tags: ["Business", "Growth", "Strategy"],
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    variant: "primary" as const,
  },
  {
    name: "Dr. Emily Watson",
    specialization: "Relationship Coaching",
    rating: 4.9,
    clients: 220,
    description: "Build stronger relationships through empathetic AI coaching and communication strategies.",
    personality: "Empathetic, insightful, and relationship-focused",
    tags: ["Relationships", "Communication", "Empathy"],
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    variant: "secondary" as const,
  },
  {
    name: "Alex Kim",
    specialization: "Performance Coaching",
    rating: 4.8,
    clients: 183,
    description: "Optimize your performance with AI-driven coaching techniques and behavioral insights.",
    personality: "High-energy, goal-oriented, and precise",
    tags: ["Performance", "Goals", "Optimization"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    variant: "secondary" as const,
  },
];

const CoachDirectory = () => {
  return (
    <section className="py-16 px-4 bg-muted/30" id="coaches">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Discover Expert Coaches</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our directory of specialized coaches and their AI-powered personabots
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search coaches by name, specialization, or expertise..."
              className="pl-10 h-12"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {coaches.map((coach, index) => (
            <CoachCard key={index} {...coach} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoachDirectory;
