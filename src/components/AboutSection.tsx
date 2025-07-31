import { Users, Code, Lightbulb, Award } from "lucide-react";

const AboutSection = () => {
  const values = [
    {
      icon: Users,
      title: "Fashion Expertise",
      description: "Built by fashion marketers who understand retail challenges"
    },
    {
      icon: Code,
      title: "Advanced Technology",
      description: "Cutting-edge AI and computer vision technology"
    },
    {
      icon: Lightbulb,
      title: "Innovation First",
      description: "Constantly evolving to meet industry needs"
    },
    {
      icon: Award,
      title: "Proven Results",
      description: "Trusted by 500+ fashion brands worldwide"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-up">
          <h2 className="heading-section mb-8">
            About <span className="text-gradient">Technizee</span>
          </h2>
          
          <div className="text-lg text-muted-foreground leading-relaxed space-y-6">
            <p>
              Built by fashion marketers and engineers — Technizee is here to redefine how customers shop fashion. 
              We combine deep understanding of retail with advanced tech that makes shopping easy, visual, and engaging.
            </p>
            
            <p>
              Our mission is simple: help fashion businesses deliver innovative customer experiences while saving money 
              and increasing profitability. We believe technology should enhance, not complicate, the fashion retail experience.
            </p>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-16">
          {values.map((value, index) => (
            <div
              key={index}
              className="text-center group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary p-4 mx-auto mb-4 shadow-elegant group-hover:shadow-glow transition-all duration-300">
                <value.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-gradient transition-all duration-300">
                {value.title}
              </h3>
              <p className="text-muted-foreground">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        {/* Team Stats */}
        <div className="bg-gradient-card border border-border rounded-2xl p-8 max-w-4xl mx-auto shadow-elegant">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gradient mb-2">15+</div>
              <div className="text-muted-foreground">Fashion Industry Veterans</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient mb-2">50+</div>
              <div className="text-muted-foreground">AI Engineers & Developers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient mb-2">3+</div>
              <div className="text-muted-foreground">Years of Innovation</div>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="text-center mt-16 max-w-3xl mx-auto">
          <blockquote className="text-xl italic text-muted-foreground">
            "We're not just building technology; we're crafting the future of fashion retail. 
            Every line of code, every AI model, every feature is designed with one goal: 
            making fashion more accessible, engaging, and profitable for everyone."
          </blockquote>
          <div className="mt-6">
            <div className="font-semibold text-foreground">— The Technizee Team</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;