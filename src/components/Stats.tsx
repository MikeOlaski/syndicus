import { Users, MessageSquare, Zap } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Active Coaches",
  },
  {
    icon: MessageSquare,
    value: "10K+",
    label: "Client Sessions",
  },
  {
    icon: Zap,
    value: "94%",
    label: "Success Rate",
  },
];

const Stats = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
