// src/pages/ProductDetail.tsx
import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Camera,
  Upload,
  Star,
  ArrowLeft,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { products } from "@/data/products";
import Webcam from "react-webcam";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();

  // product / ui state
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [showTryOnModal, setShowTryOnModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // webcam & camera-mode state
  const webcamRef = useRef<Webcam | null>(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // extra refs/guards for flow control
  const hasFlowStartedRef = useRef(false);
  const previewTimeoutRef = useRef<number | null>(null);

  // configuration
  const previewDurationMs = 3000;
  const countdownSeconds = 5;

  // use VITE_API_URL from Vite (injected at build time). Fallback to localhost for local dev.
  const API_BASE =
    (import.meta as any).env?.VITE_API_URL ??
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "");

  const TRYON_API_URL = API_BASE ? `${API_BASE.replace(/\/$/, "")}/api/virtual-tryon` : "";


  // Find product by route id
  const product = products.find((p) => p.id === Number(id));

  // helper: convert remote garment url -> base64
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

  const waitForVideoReady = (videoEl: HTMLVideoElement, timeoutMs = 6000) =>
    new Promise<void>((resolve, reject) => {
      const start = performance.now();
      const check = () => {
        const haveData = videoEl.readyState >= 2;
        const hasDims = videoEl.videoWidth > 0 && videoEl.videoHeight > 0;
        if (haveData && hasDims) return resolve();
        if (performance.now() - start > timeoutMs) return reject(new Error("Video not ready"));
        requestAnimationFrame(check);
      };
      check();
    });

  const waitForReadyBeforeCapture = async (videoEl: HTMLVideoElement, timeoutMs = 1500) => {
    const start = performance.now();
    while (performance.now() - start < timeoutMs) {
      if (videoEl.readyState >= 2 && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) return true;
      // eslint-disable-next-line no-await-in-loop
      await new Promise(res => setTimeout(res, 100));
    }
    return false;
  };

  const startCountdown = (seconds = countdownSeconds) => {
    if (countdownRef.current) return;
    let s = seconds;
    setCountdown(s);
    countdownRef.current = window.setInterval(() => {
      s -= 1;
      setCountdown(s);
      if (s <= 0) {
        if (countdownRef.current) {
          window.clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        setCountdown(null);
        autoCaptureFromWebcam();
      }
    }, 1000) as unknown as number;
  };

  const clearCountdown = () => {
    if (countdownRef.current) {
      window.clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
  };

  const clearPreviewTimeout = () => {
    if (previewTimeoutRef.current) {
      window.clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
  };

  const startWebcam = () => {
    setCapturedImage(null);
    setTryOnResult(null);
    setUploadedImage(null);
    setCameraMode(true);
    setIsVideoReady(false);
    clearCountdown();
    clearPreviewTimeout();
    hasFlowStartedRef.current = false;
  };

  const stopWebcam = () => {
    try {
      const videoEl = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
      const stream = videoEl?.srcObject as MediaStream | null;
      stream?.getTracks().forEach(t => t.stop());
    } catch (e) {
      console.warn("stopWebcam error", e);
    }
    clearCountdown();
    clearPreviewTimeout();
    setCameraMode(false);
    setIsVideoReady(false);
    setCapturedImage(null);
    hasFlowStartedRef.current = false;
  };

  const autoCaptureFromWebcam = async () => {
    await captureFromWebcam();
  };

  const captureFromWebcam = async () => {
    try {
      const videoEl = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
      if (!webcamRef.current || !videoEl) {
        toast({ title: "Capture failed", description: "Camera not available", variant: "destructive" });
        return;
      }

      const ready = await waitForReadyBeforeCapture(videoEl, 1500);
      if (!ready) {
        const fallback = webcamRef.current.getScreenshot();
        if (!fallback) {
          toast({ title: "Capture failed", description: "Please wait for camera to fully load", variant: "destructive" });
          return;
        }
      }

      const imageB64 = webcamRef.current.getScreenshot();
      if (!imageB64) {
        toast({ title: "Capture failed", description: "Could not capture frame", variant: "destructive" });
        return;
      }

      setCapturedImage(imageB64);

      try {
        const video = videoEl;
        const stream = video.srcObject as MediaStream | null;
        stream?.getTracks().forEach(t => t.stop());
      } catch (_) { }

      setIsVideoReady(false);
      clearCountdown();
      clearPreviewTimeout();
      hasFlowStartedRef.current = false;

      // same flow as file upload: send to tryon API
      setUploadedImage(imageB64);
      setTryOnResult(null);
      setIsProcessing(true);

      toast({ title: "Processing virtual try-on...", description: "Please wait while we generate your try-on result." });

      const garmentImageBase64 = await urlToBase64(product!.images[0]);

      const response = await fetch(TRYON_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_image: imageB64, garment_image: garmentImageBase64 }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.result_image) setTryOnResult(result.result_image);

      toast({ title: "Virtual try-on completed!", description: "Your try-on result is ready." });
    } catch (err) {
      console.error("Virtual try-on error:", err);
      toast({ title: "Try-on failed", description: "Please check your connection and try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    clearCountdown();
    clearPreviewTimeout();
    setShowTryOnModal(false);
    try {
      const videoEl = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
      const stream = videoEl?.srcObject as MediaStream | null;
      stream?.getTracks().forEach(t => t.stop());
    } catch (_) { }
    setCameraMode(false);
    setIsVideoReady(false);
    setCapturedImage(null);
    hasFlowStartedRef.current = false;
  };

  useEffect(() => {
    return () => {
      clearCountdown();
      clearPreviewTimeout();
      try {
        const videoEl = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
        const stream = videoEl?.srcObject as MediaStream | null;
        stream?.getTracks().forEach(t => t.stop());
      } catch (_) { }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <Link to="/virtual-tryon" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Store</span>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-6 py-12">
          Product not found.
        </div>
      </div>
    );
  }

  const VirtualTryOnModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Make Card a column with limited max-height so footer can be pinned */}
      <Card className="w-full max-w-2xl p-6 flex flex-col max-h-[calc(100vh-48px)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Virtual Try-On</h2>
          <Button variant="ghost" size="icon" onClick={closeModal}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body: scrollable area */}
        <div className="flex-1 overflow-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left panel */}
            <div className="space-y-4">
              <h3 className="font-semibold">Upload Your Photo</h3>
              <p className="text-sm text-muted-foreground">
                For best results, use a clear full-body photo with plain background
              </p>

              {!cameraMode && (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Uploaded" className="max-w-full h-40 object-contain mx-auto mb-4" />
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">Drop your image here or click to upload</p>
                    </div>
                  )}

                  {/* FULL handler: reads file, sets uploadedImage, sends to TRYON_API_URL and sets tryOnResult */}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const reader = new FileReader();
                      reader.onload = async () => {
                        const userImageB64 = reader.result as string;

                        setUploadedImage(userImageB64);
                        setTryOnResult(null);
                        setIsProcessing(true);

                        toast({
                          title: "Processing virtual try-on...",
                          description: "Please wait while we generate your try-on result.",
                        });

                        try {
                          const garmentImageBase64 = await urlToBase64(product!.images[0]);

                          const response = await fetch(TRYON_API_URL, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              user_image: userImageB64,
                              garment_image: garmentImageBase64,
                            }),
                          });

                          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                          const result = await response.json();

                          if (result.result_image) {
                            setTryOnResult(result.result_image);
                            toast({
                              title: "Virtual try-on completed!",
                              description: "Your try-on result is ready.",
                            });
                          } else {
                            // If API returned but no image, show friendly error
                            toast({
                              title: "Try-on returned no image",
                              description: "The server responded but did not return a result image.",
                              variant: "destructive",
                            });
                          }
                        } catch (err) {
                          console.error("Virtual try-on error:", err);
                          toast({
                            title: "Try-on failed",
                            description: "Please check your connection and try again.",
                            variant: "destructive",
                          });
                        } finally {
                          setIsProcessing(false);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button variant="outline" className="mt-4" asChild>
                      <span className="cursor-pointer"><Upload className="h-4 w-4 mr-2" />Choose Image</span>
                    </Button>
                  </label>

                  <div className="mt-4">
                    <Button onClick={startWebcam} className="btn-primary">
                      <Camera className="h-4 w-4 mr-2" />
                      Use Camera
                    </Button>
                  </div>
                </div>
              )}

              {/* Camera-only full rectangle */}
              {cameraMode && (
                <div className="relative border rounded-lg overflow-hidden">
                  <div className="w-full h-[380px] bg-black relative">
                    {capturedImage ? (
                      <img src={capturedImage} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        mirrored={true}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
                        className="absolute inset-0 w-full h-full object-cover"
                        onUserMedia={async () => {
                          if (hasFlowStartedRef.current) return;
                          hasFlowStartedRef.current = true;

                          const videoEl = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
                          if (!videoEl) {
                            console.warn("onUserMedia: video element missing");
                            return;
                          }

                          try {
                            await waitForVideoReady(videoEl, 6000);
                            setIsVideoReady(true);

                            clearPreviewTimeout();
                            previewTimeoutRef.current = window.setTimeout(() => {
                              if (!countdownRef.current && cameraMode && !capturedImage) {
                                startCountdown(countdownSeconds);
                              }
                            }, previewDurationMs) as unknown as number;
                          } catch (e) {
                            console.warn("Video not ready in time", e);
                          }
                        }}
                        onUserMediaError={(err) => {
                          console.error("onUserMediaError:", err);
                          toast({ title: "Camera Error", description: "Unable to access camera", variant: "destructive" });
                        }}
                      />
                    )}

                    {!capturedImage && !isVideoReady && (
                      <div className="absolute inset-0 flex items-center justify-center text-white bg-black/40">
                        Starting camera…
                      </div>
                    )}

                    {countdown !== null && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-6xl font-bold">
                        {countdown}
                      </div>
                    )}
                  </div>

                  {/* Controls (left) */}
                  <div className="flex gap-2 p-3 justify-end">
                    {!capturedImage ? (
                      <>
                        <Button onClick={captureFromWebcam} className="btn-primary" disabled={!isVideoReady}>
                          <Camera className="h-4 w-4 mr-2" /> Capture Now
                        </Button>
                        <Button onClick={stopWebcam} variant="outline">Stop Camera</Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => {
                            setCapturedImage(null);
                            setTryOnResult(null);
                            setUploadedImage(null);
                            startWebcam();
                          }}
                          variant="outline"
                        >
                          Retake
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right panel - Try-On Result (larger rectangular) */}
            <div className="space-y-4">
              <h3 className="font-semibold">Try-On Result</h3>
              <div className="relative border border-border rounded-lg bg-muted/30 w-full h-[420px] flex items-center justify-center overflow-hidden">
                {!uploadedImage ? (
                  <p className="text-muted-foreground">Upload an image to see virtual try-on</p>
                ) : tryOnResult ? (
                  <img
                    src={tryOnResult}
                    alt="Virtual try-on result"
                    className="w-full h-full object-cover"
                  />
                ) : isProcessing ? (
                  <div className="space-y-4 flex flex-col items-center justify-center">
                    <p className="text-sm text-muted-foreground">Processing your virtual try-on...</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Ready to process</p>
                )}
              </div>

              {/* Download button for try-on result (only) */}
              {tryOnResult && (
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = tryOnResult!;
                      link.download = "tryon-result.jpg";
                      link.click();
                    }}
                    className="btn-primary"
                  >
                    Download Try-On Result
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer: pinned bottom so always visible */}
        <div className="flex justify-end space-x-2 mt-1 pt-3 border-border">
          <Button variant="outline" onClick={closeModal}>Close</Button>
          <Button className="btn-primary">Save & Add to Cart</Button>
        </div>
      </Card>
    </div>
  );

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
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart (0)
              </Button>
              <Link to="/ai-photoshoot">
                <Button className="btn-primary">AI Photoshoot</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {product.images.slice(1).map((image, index) => (
                <div key={index} className="aspect-square bg-muted rounded overflow-hidden">
                  <img
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground ml-1">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
                <Badge variant="secondary">Best Seller</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-foreground">{product.price}</span>
                <span className="text-lg text-muted-foreground line-through">
                  {product.originalPrice}
                </span>
                <Badge className="bg-green-100 text-green-800">Best Price</Badge>
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="font-semibold mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    className={selectedSize === size ? "btn-primary" : ""}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-semibold mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    className={selectedColor === color ? "btn-primary" : ""}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full btn-primary text-lg py-6"
                onClick={() => setShowTryOnModal(true)}
              >
                <Camera className="h-5 w-5 mr-2" />
                Virtual Try-On
              </Button>
              <Button variant="outline" className="w-full text-lg py-6">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground mb-4">High-quality product with perfect fit and comfort.</p>
              <ul className="space-y-2">
                {["Premium Fabric", "Pre-shrunk", "Machine Washable", "Eco-friendly"].map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showTryOnModal && <VirtualTryOnModal />}
    </div>
  );
};

export default ProductDetail;
