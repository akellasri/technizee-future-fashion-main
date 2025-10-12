import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Camera, Upload, Star, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

import { products } from "@/data/products";

const VirtualTryOn = () => {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userImageFile, setUserImageFile] = useState<File | null>(null);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState<number | null>(null);


  const handleVirtualTryOn = async (productId: number) => {
    const VIRTUAL_TRYON_API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"
      }/api/virtual-tryon`;


    if (!VIRTUAL_TRYON_API_URL) {
      toast({
        title: "API not configured",
        description: "Please provide the Virtual Try-On API URL to enable try-on functionality.",
        variant: "destructive",
      });
      return;
    }

    if (!userImageFile) {
      toast({
        title: "Upload required",
        description: "Please upload your photo first to try on this item.",
        variant: "destructive",
      });
      return;
    }

    setSelectedProduct(productId);
    setIsProcessing(true);

    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      // Convert images to base64
      const userImageB64 = await fileToBase64(userImageFile);
      const garmentImageB64 = await urlToBase64(product.images[0]);

      // Auto-detect category from product
      const category = product.type;

      const requestBody = {
        service: "virtual_tryon",
        user_image: userImageB64,
        garment_image: garmentImageB64,
        category: category,
        garment_type: null, // Auto-detect
        garment_orientation: null, // Auto-detect
        extra_prompt: null
      };

      const response = await fetch(VIRTUAL_TRYON_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed (${response.status})`);
      }

      const data = await response.json();

      if (data.success && data.result_image) {
        setTryOnResult(data.result_image);
        toast({
          title: "Virtual Try-On Complete!",
          description: `Successfully tried on ${product.name}. Detected: ${data.detected_sleeves} sleeves.`,
        });
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }

    } catch (error: any) {
      console.error("Virtual Try-On error:", error);
      toast({
        title: "Try-On failed",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play(); // 👈 ensure video actually starts
        setIsWebcamActive(true);

        // Start countdown
        let seconds = 5;
        setCountdown(seconds);
        const interval = setInterval(() => {
          seconds -= 1;
          if (seconds > 0) {
            setCountdown(seconds);
          } else {
            clearInterval(interval);
            setCountdown(null);
            captureFromWebcam();
          }
        }, 1000);
      }
    } catch (error) {
      toast({
        title: "Webcam Error",
        description: "Unable to access webcam. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsWebcamActive(false);
    }
  };

  const captureFromWebcam = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Ensure video is loaded and has dimensions
      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
            setUserImageFile(file);
            stopWebcam();
            toast({
              title: "Photo captured!",
              description: "Ready for virtual try-on",
            });
          }
        }, 'image/jpeg', 0.8);
      } else {
        toast({
          title: "Capture failed",
          description: "Please wait for camera to fully load",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Optimized for TV */}
      <header className="border-b border-border">
        <div className="container mx-auto px-12 py-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-4">
              <img
                src="/lovable-uploads/676f11a3-0467-482a-bd66-aaf29c1ea20d.png"
                alt="Technizee Logo"
                className="h-16 w-auto"
              />
            </Link>
            <div className="flex items-center space-x-8">
              <Button variant="outline" className="text-xl px-8 py-4 h-auto">
                <ShoppingCart className="h-6 w-6 mr-3" />
                Cart (0)
              </Button>
              <Link to="/ai-photoshoot">
                <Button className="btn-primary text-xl px-8 py-4 h-auto">AI Photoshoot</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-12 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Virtual Try-On Store
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of fashion with our AI-powered virtual try-on technology.
              See how clothes look on you before you buy!
            </p>
          </div>

          {/* User Image Upload Section */}
          <div className="max-w-2xl mx-auto bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 text-center">Upload Your Photo or Use Webcam</h3>


            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUserImageFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                />
              </div>

              {/* Webcam Controls */}
              <div className="flex gap-2">
                {!isWebcamActive ? (
                  <Button onClick={startWebcam} variant="outline" className="flex-1">
                    <Video className="h-4 w-4 mr-2" />
                    Start Webcam
                  </Button>
                ) : (
                  <>
                    <Button onClick={captureFromWebcam} className="flex-1">
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </Button>
                    <Button onClick={stopWebcam} variant="outline">
                      Stop Webcam
                    </Button>
                  </>
                )}
              </div>

              {/* Webcam Video */}
              {isWebcamActive && (
                <div className="relative mt-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full rounded-lg"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Countdown Overlay */}
                  {countdown && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-6xl font-bold">
                      {countdown}
                    </div>
                  )}
                </div>
              )}

              {userImageFile && (
                <p className="text-sm text-green-600 text-center">
                  ✓ Photo ready: {userImageFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Try-On Result Display */}
          {tryOnResult && (
            <div className="max-w-md mx-auto bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 text-center">Your Virtual Try-On Result</h3>
              <img
                src={tryOnResult}
                alt="Virtual try-on result"
                className="w-full rounded-lg shadow-lg"
              />
              <Button
                className="w-full mt-4"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = tryOnResult;
                  link.download = 'virtual-tryon-result.jpg';
                  link.click();
                }}
              >
                Download Result
              </Button>
            </div>
          )}

          {/* Products Grid - Optimized for horizontal TV layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="p-6 hover:shadow-glow hover:scale-105 transition-all duration-300">
                <div className="aspect-[3/4] bg-muted rounded-lg mb-6 relative overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-destructive text-lg px-3 py-1">
                    Sale
                  </Badge>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">{product.name}</h3>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg text-muted-foreground ml-2">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-foreground">{product.price}</span>
                    <span className="text-lg text-muted-foreground line-through">
                      {product.originalPrice}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-3 pt-2">
                    <Link
                      to={`/product/${product.id}`}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full text-lg py-3 h-auto">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      className="btn-primary w-full text-lg py-3 h-auto"
                      onClick={() => handleVirtualTryOn(product.id)}
                      disabled={isProcessing && selectedProduct === product.id}
                    >
                      {isProcessing && selectedProduct === product.id ? "Processing..." : "Try On"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;