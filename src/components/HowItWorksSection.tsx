import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Play, ArrowRight, CheckCircle } from "lucide-react";
import virtualTryonDemo from "@/assets/virtual-tryon-demo.jpg";
import aiPhotoshootDemo from "@/assets/ai-photoshoot-demo.jpg";

const HowItWorksSection = () => {
  const [activeDemo, setActiveDemo] = useState<'tryon' | 'photoshoot'>('tryon');

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="heading-section mb-6">
            See Our Technology 
            <span className="text-gradient block">In Action</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of fashion retail with our interactive demos. See how easy it is to integrate cutting-edge technology into your business.
          </p>
        </div>

        {/* Demo Selector */}
        <div className="flex justify-center mb-12">
          <div className="bg-card border border-border rounded-xl p-2 shadow-elegant">
            <button
              onClick={() => setActiveDemo('tryon')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeDemo === 'tryon'
                  ? 'bg-gradient-primary text-white shadow-glow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Virtual Try-On Demo
            </button>
            <button
              onClick={() => setActiveDemo('photoshoot')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeDemo === 'photoshoot'
                  ? 'bg-gradient-primary text-white shadow-glow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              AI Photoshoot Demo
            </button>
          </div>
        </div>

        {/* Demo Content */}
        <div className="max-w-6xl mx-auto">
          {activeDemo === 'tryon' && (
            <div className="grid lg:grid-cols-2 gap-12 items-center animate-fade-up">
              <div>
                <h3 className="text-3xl font-bold mb-6 text-foreground">
                  Virtual Try-On Experience
                </h3>
                <p className="text-lg text-muted-foreground mb-8">
                  Upload a full-body photo or use your camera to see how garments look on you virtually. 
                  Our AI ensures realistic fitting and size recommendations.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Upload Your Photo</h4>
                      <p className="text-muted-foreground">Use a clear, full-body photo with plain background for best results</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Select Garments</h4>
                      <p className="text-muted-foreground">Browse through your catalog and select items to try virtually</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">See Results Instantly</h4>
                      <p className="text-muted-foreground">Real-time rendering with accurate fit and style visualization</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="btn-hero">
                    <Upload className="mr-2 h-5 w-5" />
                    Try Demo Now
                  </Button>
                  <Button variant="outline" className="btn-outline">
                    <Camera className="mr-2 h-5 w-5" />
                    Use Camera
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-elegant">
                  <img 
                    src={virtualTryonDemo} 
                    alt="Virtual Try-On Demo Interface"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent"></div>
                </div>
              </div>
            </div>
          )}

          {activeDemo === 'photoshoot' && (
            <div className="grid lg:grid-cols-2 gap-12 items-center animate-fade-up">
              <div className="order-2 lg:order-1 relative">
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-elegant">
                  <img 
                    src={aiPhotoshootDemo} 
                    alt="AI Photoshoot Demo Interface"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/20 via-transparent to-transparent"></div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-bold mb-6 text-foreground">
                  AI Product Photoshoot
                </h3>
                <p className="text-lg text-muted-foreground mb-8">
                  Transform your product photography with AI-generated model shoots. 
                  Create professional fashion imagery without expensive photoshoots.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Select Your Garment</h4>
                      <p className="text-muted-foreground">Upload product images or choose from your catalog</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Choose Model & Style</h4>
                      <p className="text-muted-foreground">Pick from diverse models and professional backgrounds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Generate & Download</h4>
                      <p className="text-muted-foreground">Get high-quality images ready for your marketing campaigns</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="btn-hero">
                    <Play className="mr-2 h-5 w-5" />
                    Start Demo
                  </Button>
                  <Button variant="outline" className="btn-outline">
                    View Samples
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="text-center mt-16 p-6 bg-card border border-border rounded-xl max-w-4xl mx-auto">
          <p className="text-muted-foreground mb-4">
            <strong>Note:</strong> Use a clear, full-body photo with plain background for best results in virtual try-on.
          </p>
          <Button variant="outline" className="btn-outline">
            <ArrowRight className="mr-2 h-5 w-5" />
            Want a custom solution? Contact us for your own branded integration
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;