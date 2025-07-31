import { TrendingDown, Zap, RotateCcw, Store } from "lucide-react";

const WhyChooseSection = () => {
  const benefits = [
    {
      icon: TrendingDown,
      title: "70% Cost Saving",
      subtitle: "on Content Creation",
      description: "Eliminate expensive photoshoots, model fees, and studio rentals. Create unlimited professional content with AI.",
      stats: "Average savings: ₹2.5L per month",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Zap,
      title: "Real-Time",
      subtitle: "Customer Experience",
      description: "Instant virtual try-ons and AI recommendations that engage customers and boost conversion rates.",
      stats: "35% increase in engagement",
      color: "from-primary to-primary-hover"
    },
    {
      icon: RotateCcw,
      title: "Reduced",
      subtitle: "Return Rates",
      description: "Customers make confident purchases with accurate virtual try-ons, reducing returns by up to 40%.",
      stats: "40% fewer returns reported",
      color: "from-accent to-accent-light"
    },
    {
      icon: Store,
      title: "Easy Integration",
      subtitle: "for Retail & Online",
      description: "Seamless integration with your existing website, POS systems, and in-store kiosks. No technical expertise required.",
      stats: "Setup in under 48 hours",
      color: "from-metallic-silver to-metallic-gold"
    }
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="heading-section mb-6">
            Why Choose 
            <span className="text-gradient">Technizee?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join hundreds of fashion brands who've transformed their business with our cutting-edge AI solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Card */}
              <div className="card-elegant group-hover:shadow-glow relative h-full">
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} p-4 shadow-elegant relative z-10`}>
                    <benefit.icon className="w-full h-full text-white" />
                  </div>
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500`}></div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-gradient transition-all duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-lg font-medium text-muted-foreground">
                      {benefit.subtitle}
                    </p>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Stats */}
                  <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${benefit.color} bg-opacity-10 border border-gray-200`}>
                    <span className="text-sm font-semibold text-foreground">
                      {benefit.stats}
                    </span>
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${benefit.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient mb-2">500+</div>
            <div className="text-muted-foreground">Fashion Brands</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient mb-2">10M+</div>
            <div className="text-muted-foreground">Virtual Try-Ons</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient mb-2">70%</div>
            <div className="text-muted-foreground">Cost Reduction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient mb-2">24/7</div>
            <div className="text-muted-foreground">AI Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;