import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload,
  Download,
  ArrowLeft,
  Wand2,
  Camera,
  Shirt,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AIPhotoshoot = () => {
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedBackground, setSelectedBackground] = useState("");
  const [selectedPose, setSelectedPose] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        toast({
          title: "Image uploaded successfully!",
          description: "Ready for AI processing",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGeneratePhotoshoot = () => {
    if (!uploadedImage || !selectedModel || !selectedBackground || !selectedPose) {
      toast({
        title: "Missing information",
        description: "Please upload an image and select all options",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setGeneratedImage("https://demo-site-sriharsha251192s-projects.vercel.app/auth/login");
      setIsProcessing(false);
      toast({
        title: "AI Photoshoot Complete!",
        description: "Your professional model image is ready",
      });
    }, 3000);
  };

  const modelOptions = [
    { value: "model1", label: "Professional Female Model" },
    { value: "model2", label: "Professional Male Model" },
    { value: "model3", label: "Casual Female Model" },
    { value: "model4", label: "Casual Male Model" },
  ];

  const backgroundOptions = [
    { value: "studio", label: "White Studio Background" },
    { value: "street", label: "Urban Street Style" },
    { value: "minimal", label: "Minimal Modern" },
    { value: "outdoor", label: "Natural Outdoor" },
  ];

  const poseOptions = [
    { value: "standing", label: "Standing Pose" },
    { value: "sitting", label: "Sitting Pose" },
    { value: "walking", label: "Walking Pose" },
    { value: "casual", label: "Casual Pose" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/virtual-tryon" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <img
                src="/lovable-uploads/676f11a3-0467-482a-bd66-aaf29c1ea20d.png"
                alt="Technizee Logo"
                className="h-8 w-auto"
              />
            </Link>
            <Link to="/virtual-tryon">
              <Button variant="outline">Virtual Try-On Store</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            AI Product Photoshoot
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transform your flat lay or mannequin images into professional model photoshoots.
            No photographers, no models, just AI magic.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Upload & Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Shirt className="h-5 w-5 mr-2" />
              Upload Your Product
            </h2>

            {/* Image Upload */}
            <div className="space-y-4 mb-6">
              <Label>Product Image (Flat lay or Mannequin)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Uploaded product"
                    className="max-w-full h-48 object-contain mx-auto mb-4"
                  />
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Drop your product image here</p>
                  </div>
                )}

                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="product-upload"
                />
                <label htmlFor="product-upload">
                  <Button variant="outline" className="mt-4" asChild>
                    <span className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* AI Settings */}
            <div className="space-y-4">
              <div>
                <Label>Model Type</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select model type" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Background Style</Label>
                <Select value={selectedBackground} onValueChange={setSelectedBackground}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select background" />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Pose Style</Label>
                <Select value={selectedPose} onValueChange={setSelectedPose}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select pose" />
                  </SelectTrigger>
                  <SelectContent>
                    {poseOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full btn-primary mt-6"
                onClick={handleGeneratePhotoshoot}
                disabled={isProcessing || !uploadedImage}
              >
                {isProcessing ? (
                  <>
                    <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate AI Photoshoot
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Results */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <User className="h-5 w-5 mr-2" />
              AI Generated Result
            </h2>

            <div className="border border-border rounded-lg p-8 text-center bg-muted/30 h-80 flex items-center justify-center">
              {isProcessing ? (
                <div className="space-y-4">
                  <Wand2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                  <p className="text-muted-foreground">Creating your AI photoshoot...</p>
                  <div className="w-48 bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ) : generatedImage ? (
                <div className="space-y-4 w-full">
                  <img
                    src={generatedImage}
                    alt="AI Generated Model"
                    className="max-w-full h-60 object-contain mx-auto rounded"
                  />
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button className="btn-primary flex-1" onClick={handleGeneratePhotoshoot}>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate New
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Your AI-generated model photoshoot will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Tips for best results:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use high-resolution product images</li>
                <li>• Ensure good lighting and clear details</li>
                <li>• Flat lay images work better than mannequin shots</li>
                <li>• Choose appropriate model and background combinations</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIPhotoshoot;