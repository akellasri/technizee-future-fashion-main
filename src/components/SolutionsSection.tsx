import { Camera, Shirt, Monitor, Brain } from "lucide-react";

const SolutionsSection = () => {
  const solutions = [
    {
      icon: Camera,
      title: "AI Product Photoshoots",
      description: "Turn flat designs into model shots instantly",
      features: ["No expensive photoshoots", "Multiple model variations", "Professional quality", "Fast turnaround"]
    },
    {
      icon: Shirt,
      title: "Virtual Try-On Website Integration",
      description: "Let customers try clothes online before buying",
      features: ["Reduce return rates", "Boost confidence", "Real-time rendering", "Mobile optimized"]
    },
    {
      icon: Monitor,
      title: "Virtual Try-On Kiosk for Stores",
      description: "Interactive in-store experiences that wow customers",
      features: ["Touchscreen interface", "Queue reduction", "Modern shopping", "POS integration"]
    },
    {
      icon: Brain,
      title: "Smart Product Recommendations",
      description: "AI-powered suggestions that increase sales",
      features: ["Personalized matching", "Size recommendations", "Style suggestions", "Conversion tracking"]
    }
  ];

  return (
    <section id="solutions" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="heading-section mb-6">
            Our Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive AI-powered tools designed specifically for fashion businesses
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className={`card-feature animate-fade-up animate-delay-${(index + 1) * 100}`}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <solution.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {solution.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {solution.description}
                  </p>
                </div>
              </div>
              
              <ul className="space-y-2">
                {solution.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3 flex-shrink-0"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;