import { Button } from "@/components/ui/button";
import { Upload, Play } from "lucide-react";
import { Link } from "react-router-dom";
import virtualTryonMockup from "@/assets/virtual-tryon-mockup.jpg";
import aiPhotoshootMockup from "@/assets/ai-photoshoot-mockup.jpg";

const DemoSection = () => {
  return (
    <section id="demo" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="heading-section mb-6">
            Demo Preview
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See our technology in action with these interactive previews
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Virtual Try-On Demo */}
          <div className="card-feature animate-fade-up">
            <div className="mb-6">
              <img 
                src={virtualTryonMockup} 
                alt="Virtual Try-On Demo Interface"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Virtual Try-On
            </h3>
            
            <p className="text-muted-foreground mb-6">
              Upload full body photo on plain background. See how customers can try your clothes online.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/virtual-tryon" className="flex-1">
                <Button className="btn-primary w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Try Now
                </Button>
              </Link>
              <Link to="/virtual-tryon" className="flex-1">
                <Button variant="outline" className="btn-outline w-full">
                  Use Camera
                </Button>
              </Link>
            </div>
          </div>

          {/* AI Photoshoot Demo */}
          <div className="card-feature animate-fade-up animate-delay-200">
            <div className="mb-6">
              <img 
                src={aiPhotoshootMockup} 
                alt="AI Photoshoot Demo Interface"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              AI Photoshoot
            </h3>
            
            <p className="text-muted-foreground mb-6">
              Show a sample flat garment → AI-styled model photo. No photoshoots. No models. Just upload.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/ai-photoshoot" className="flex-1">
                <Button className="btn-primary w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Start Demo
                </Button>
              </Link>
              <Link to="/ai-photoshoot" className="flex-1">
                <Button variant="outline" className="btn-outline w-full">
                  View Samples
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center mt-12 p-6 bg-card border border-border rounded-xl max-w-4xl mx-auto">
          <p className="text-muted-foreground mb-4">
            <strong>Note:</strong> Use a clear, full-body photo with plain background for best results.
          </p>
          <Button className="btn-primary">
            Want a custom solution? Contact us for your own branded integration
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;