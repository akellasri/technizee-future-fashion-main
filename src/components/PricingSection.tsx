import { Button } from "@/components/ui/button";
import { Check, Download } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Starter",
      price: "₹29,000",
      period: "/month",
      description: "Perfect for new D2C brands testing AI content",
      features: [
        "1 AI Photoshoot (up to 5 garments)",
        "Dashboard Access",
        "Shopify/WooCommerce Integration",
        "Monthly Report",
        "Email Support"
      ],
      bestFor: "New D2C brands testing AI content",
      cta: "Start Now",
      popular: false
    },
    {
      name: "Pro",
      price: "₹49,000",
      period: "/month",
      description: "Most value for scaling fashion brands",
      features: [
        "3 AI Photoshoots (up to 15 garments)",
        "2,000 Virtual Try-On Requests",
        "Full Website Integration",
        "1 Growth Strategy Call",
        "WhatsApp Support"
      ],
      bestFor: "Scaling fashion brands",
      cta: "Get Started",
      popular: true
    },
    {
      name: "Business",
      price: "₹59,000",
      period: "/month",
      description: "Complete solution for growing brands",
      features: [
        "5 AI Photoshoots (up to 25 garments)",
        "5,000 Try-On Requests",
        "Personalized Style Recommender",
        "Instagram Lookbook Generator",
        "WhatsApp Lead Capture",
        "Dedicated Manager"
      ],
      bestFor: "Growth-stage D2C brands & boutiques",
      cta: "Choose Business",
      popular: false
    },
    {
      name: "Kiosk Retail",
      price: "₹69,000",
      period: "/month",
      description: "For physical fashion retailers",
      features: [
        "Try-On Kiosk Software License",
        "10,000 Try-On Requests",
        "In-store garment mapping",
        "2 AI Photoshoots (for kiosk garments)",
        "Kiosk Branding Setup",
        "Priority Support"
      ],
      bestFor: "Physical fashion retailers & showrooms",
      cta: "Contact Sales",
      popular: false
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "Quote",
      description: "Unlimited solution for large businesses",
      features: [
        "Unlimited Photoshoots & Try-On Requests",
        "White-label Try-On Engine",
        "Personalization AI",
        "CRM + ERP Integration",
        "Dedicated Tech Support"
      ],
      bestFor: "Fashion chains, marketplaces",
      cta: "Get Quote",
      popular: false
    }
  ];

  const addOns = [
    {
      name: "Extra Try-On Requests",
      price: "₹2,000 for 1,000 requests"
    },
    {
      name: "Extra AI Photoshoot",
      price: "₹3,000 (5 garments)"
    },
    {
      name: "Instagram Reels (AI Model Generated)",
      price: "₹9,000 for 4 reels/month"
    },
    {
      name: "WhatsApp Automation & Chatbot",
      price: "₹5,000/month"
    },
    {
      name: "In-store Kiosk Hardware",
      price: "₹1,00,000 (one-time)"
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="heading-section mb-6">
            Pricing Plans
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the perfect plan for your fashion business
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-full mx-auto mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`card-pricing animate-fade-up animate-delay-${(index + 1) * 100} ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Value
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium mb-4 text-primary">Best for: {plan.bestFor}</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                className={`w-full ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Add-On Options Section */}
        <div className="bg-muted/20 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">Add-On Options</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {addOns.map((addon, index) => (
              <div key={index} className="bg-background rounded-lg p-6 border border-border">
                <h4 className="font-semibold mb-2">{addon.name}</h4>
                <p className="text-primary font-bold">{addon.price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center space-y-4">
          <Button className="btn-primary mr-4">
            Book a Free Consultation
          </Button>
          <Button variant="outline" className="btn-outline">
            <Download className="mr-2 h-4 w-4" />
            Download Full Pricing PDF
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;