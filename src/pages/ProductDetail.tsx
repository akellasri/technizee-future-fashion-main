// src/pages/ProductDetail.tsx
import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Camera, Upload, Star, ArrowLeft, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { products } from "@/data/products";
import Webcam from "react-webcam";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const product = products.find((p) => p.id === Number(id));
  const [showTryOnModal, setShowTryOnModal] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const webcamRef = useRef<Webcam | null>(null);

  const API_BASE =
    (import.meta as any).env?.VITE_API_URL ??
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "");
  const TRYON_API_URL = `${API_BASE.replace(/\/$/, "")}/api/virtual-tryon`;

  const stopWebcam = () => {
    try {
      const videoEl = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
      const stream = videoEl?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
    } catch { }
    setCameraMode(false);
  };

  const startCountdown = (seconds = 3) => {
    if (!isVideoReady) {
      toast({
        title: "Camera not ready",
        description: "Please wait for the webcam to initialize.",
        variant: "destructive",
      });
      return;
    }
    setCountdown(seconds);
    const timer = setInterval(() => {
      seconds--;
      setCountdown(seconds > 0 ? seconds : null);
      if (seconds <= 0) {
        clearInterval(timer);
        capturePortraitFrame();
      }
    }, 1000);
  };

  const urlToBase64 = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const capturePortraitFrame = async () => {
    try {
      const videoEl: HTMLVideoElement | undefined = (webcamRef.current as any)?.video;
      if (!videoEl || videoEl.readyState < 2) {
        toast({
          title: "Camera not ready",
          description: "Please wait for the camera stream.",
          variant: "destructive",
        });
        return;
      }

      const canvas = document.createElement("canvas");
      const w = 720;
      const h = 1280;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(Math.PI / 2);
      ctx.scale(-1, 1);

      const scale = Math.max(h / videoEl.videoWidth, w / videoEl.videoHeight);
      const drawW = videoEl.videoWidth * scale;
      const drawH = videoEl.videoHeight * scale;

      ctx.drawImage(videoEl, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(dataUrl);
      setUploadedImage(dataUrl);

      toast({
        title: "Captured!",
        description: "Processing your try-on image...",
      });

      setIsProcessing(true);

      const garmentImageBase64 = await urlToBase64(product!.images[0]);
      const res = await fetch(TRYON_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_image: dataUrl,
          garment_image: garmentImageBase64,
        }),
      });

      const json = await res.json();
      if (json.result_image) {
        setTryOnResult(json.result_image);
        toast({ title: "Try-On ready!" });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Capture failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const VirtualTryOnModal = () => {
    const previewW = 360;
    const previewH = 640;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-6xl p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-bold">Virtual Try-On</h2>
            <Button
              variant="ghost"
              onClick={() => {
                stopWebcam();
                setShowTryOnModal(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* LEFT PANEL */}
            <div className="flex flex-col items-center">
              <div
                style={{
                  width: `${previewW}px`,
                  height: `${previewH}px`,
                  backgroundColor: "black",
                  overflow: "hidden",
                  borderRadius: "12px",
                  position: "relative",
                }}
              >
                <Webcam
                  ref={webcamRef}
                  mirrored
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user",
                  }}
                  onUserMedia={() => setIsVideoReady(true)}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transform: "translate(-50%, -50%) rotate(90deg)",
                    transformOrigin: "center center",
                    width: `${previewH}px`,
                    height: `${previewW}px`,
                    objectFit: "cover",
                  }}
                />
                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 text-white text-6xl font-bold pointer-events-none">
                    {countdown}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <Button disabled={!isVideoReady} onClick={() => startCountdown(3)}>
                  <Camera className="mr-2 h-4 w-4" /> Capture
                </Button>
                <Button variant="outline" onClick={stopWebcam}>
                  Stop
                </Button>
              </div>

              {capturedImage && (
                <div className="mt-4">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="rounded-lg object-cover"
                    style={{ width: previewW, height: previewH }}
                  />
                  <Button
                    className="w-full mt-2"
                    variant="outline"
                    onClick={() => setCapturedImage(null)}
                  >
                    Retake
                  </Button>
                </div>
              )}
            </div>

            {/* RIGHT PANEL */}
            <div className="space-y-4">
              <h3 className="font-semibold">Try-On Result</h3>
              <div
                className="relative border rounded-lg bg-muted/30 flex items-center justify-center overflow-hidden"
                style={{ height: previewH }}
              >
                {!uploadedImage ? (
                  <p className="text-muted-foreground">Upload or capture an image.</p>
                ) : tryOnResult ? (
                  <img
                    src={tryOnResult}
                    alt="Try-On Result"
                    className="w-full h-full object-cover"
                  />
                ) : isProcessing ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    <p className="text-sm text-muted-foreground">Processing...</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Ready to process</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowTryOnModal(false)}>
              Close
            </Button>
            <Button className="btn-primary">Save & Add to Cart</Button>
          </div>
        </Card>
      </div>
    );
  };

  if (!product) return <div>Product not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/virtual-tryon" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
          <Button variant="outline">
            <ShoppingCart className="h-4 w-4 mr-2" /> Cart (0)
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <img
              src={product.images[0]}
              alt={product.name}
              className="rounded-lg w-full h-auto"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-xl font-semibold mb-4">{product.price}</p>
            <Button
              className="w-full btn-primary py-6"
              onClick={() => setShowTryOnModal(true)}
            >
              <Camera className="mr-2 h-5 w-5" />
              Virtual Try-On
            </Button>
          </div>
        </div>
      </div>

      {showTryOnModal && <VirtualTryOnModal />}
    </div>
  );
};

export default ProductDetail;