import { Camera, TrendingDown, Monitor, Clock } from "lucide-react";

const ProblemsSection = () => {
  const problems = [
    {
      icon: Camera,
      title: "Costly model photoshoots",
      description: "Expensive photography sessions eating into profits"
    },
    {
      icon: TrendingDown,
      title: "High return rates from poor fit",
      description: "Customers can't try before buying online"
    },
    {
      icon: Monitor,
      title: "Boring ecommerce experiences",
      description: "Static product images don't engage customers"
    },
    {
      icon: Clock,
      title: "In-store trial inefficiency",
      description: "Long queues and limited fitting room availability"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="heading-section mb-6">
            Problems We Solve
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Fashion businesses face real challenges that impact profitability and customer satisfaction
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={index}
              className={`card-feature text-center animate-fade-up animate-delay-${(index + 1) * 100}`}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <problem.icon className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-lg font-semibold mb-3 text-foreground">
                {problem.title}
              </h3>
              
              <p className="text-muted-foreground text-sm">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemsSection;