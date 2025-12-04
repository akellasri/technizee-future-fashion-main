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

  // product / ui state
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [showTryOnModal, setShowTryOnModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // webcam & camera-mode state
  const webcamRef = useRef<Webcam | null>(null);
  const leftPanelRef = useRef<HTMLDivElement | null>(null);
  const cameraBoxRef = useRef<HTMLDivElement | null>(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // meta about capture
  const [capturedMeta, setCapturedMeta] = useState<{
    w: number; h: number; dispW: number; dispH: number;
  } | null>(null);

  // extra refs/guards for flow control
  const hasFlowStartedRef = useRef(false);
  const previewTimeoutRef = useRef<number | null>(null);

  // configuration
  const previewDurationMs = 3000;
  const countdownSeconds = 5;

  // API base
  const API_BASE =
    (import.meta as any).env?.VITE_API_URL ??
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "");
  const TRYON_API_URL = API_BASE ? `${API_BASE.replace(/\/$/, "")}/api/virtual-tryon` : "";

  // Find product by route id
  const product = products.find((p) => p.id === Number(id));

  // Determine kiosk mode (either forced with ?kiosk=1 or detected by tall screen)
  const [isKioskMode, setIsKioskMode] = useState(() => {
    try {
      if (typeof window === "undefined") return false;
      const qp = new URLSearchParams(window.location.search);
      if (qp.get("kiosk") === "1") return true;
      return window.innerHeight >= 1000;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const onResize = () => {
      const qp = new URLSearchParams(window.location.search);
      if (qp.get("kiosk") === "1") return; // forced
      setIsKioskMode(window.innerHeight >= 1000);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // heights
  const smallHeight = 380; // laptop default
  const kioskHeight = 1080; // kiosk
  const [dynamicCameraHeight, setDynamicCameraHeight] = useState<number | null>(null);
  const cameraHeight = dynamicCameraHeight ?? (isKioskMode ? kioskHeight : smallHeight);
  const tryonHeight = cameraHeight; // keep them matched

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

  const waitForReadyBeforeCapture = async (videoEl: HTMLVideoElement, timeoutMs = 1500) => {
    const start = performance.now();
    while (performance.now() - start < timeoutMs) {
      if (videoEl.readyState >= 2 && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) return true;
      await new Promise(res => setTimeout(res, 100));
    }
    return false;
  };

  // countdown helpers
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
      // ignore
    }
    // remove 'playing' listener if we added one
    try {
      (webcamRef.current as any)?._cleanupPlayingListener?.();
    } catch (_) { }
    clearCountdown();
    clearPreviewTimeout();
    setCameraMode(false);
    setIsVideoReady(false);
    hasFlowStartedRef.current = false;
  };

  const autoCaptureFromWebcam = async () => {
    try {
      const webcamAny: any = webcamRef.current;
      const videoEl: HTMLVideoElement | undefined = webcamAny?.video;

      if (!videoEl) {
        await captureFromWebcam();
        return;
      }

      // Wait up to totalWaitMs for the video to report dimensions
      const totalWaitMs = 3000;
      const stepMs = 200;
      const start = performance.now();
      let ready = (videoEl.readyState >= 2 && videoEl.videoWidth > 0 && videoEl.videoHeight > 0);

      while (!ready && (performance.now() - start) < totalWaitMs) {
        await new Promise(r => setTimeout(r, stepMs));
        ready = (videoEl.readyState >= 2 && videoEl.videoWidth > 0 && videoEl.videoHeight > 0);
      }

      if (!ready) {
        await captureFromWebcam();
        return;
      }

      await captureFromWebcam();
    } catch (err) {
      console.error("autoCapture error:", err);
      toast({ title: "Capture failed", description: "Please wait for camera to fully load", variant: "destructive" });
    }
  };

  // CAPTURE: draw exactly the *visible* filled area when webcam uses object-fit: cover
  const captureFromWebcam = async () => {
    try {
      const webcamAny: any = webcamRef.current;
      const videoEl: HTMLVideoElement | undefined = webcamAny?.video;
      if (!webcamAny || !videoEl) {
        toast({ title: "Capture failed", description: "Camera not available", variant: "destructive" });
        return;
      }

      // measure the displayed bounding box (the user sees this on screen)
      let displayRect = null;
      try {
        const rect = videoEl.getBoundingClientRect();
        displayRect = { width: Math.round(rect.width), height: Math.round(rect.height) };
      } catch (_) {
        displayRect = null;
      }

      const ready = await waitForReadyBeforeCapture(videoEl, 1500);
      let dataUrl: string | null = null;
      let vw = 0, vh = 0;

      if (!ready) {
        // fallback to react-webcam's getScreenshot
        const fallback = webcamAny.getScreenshot();
        if (!fallback) {
          toast({ title: "Capture failed", description: "Please wait for camera to fully load", variant: "destructive" });
          return;
        }
        dataUrl = fallback;
        try { (videoEl.srcObject as MediaStream | null)?.getTracks().forEach(t => t.stop()); } catch { }
      } else {
        // ---- For object-fit: cover preview, compute source crop in video coords and draw that ----
        const rect = videoEl.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        const vidW = videoEl.videoWidth || 1;
        const vidH = videoEl.videoHeight || 1;

        const elemW = rect.width;
        const elemH = rect.height;

        // destination size (the visible box) in device pixels
        const destVidW = Math.round(elemW * dpr);
        const destVidH = Math.round(elemH * dpr);

        // compute source rectangle from the intrinsic video that is actually visible when using object-fit: cover
        // scale = how much the video is scaled to cover the element
        const scale = Math.max(elemW / vidW, elemH / vidH);
        const srcW = Math.round(elemW / scale);
        const srcH = Math.round(elemH / scale);
        const srcX = Math.round((vidW - srcW) / 2);
        const srcY = Math.round((vidH - srcH) / 2);

        const canvas = document.createElement("canvas");
        canvas.width = destVidW;
        canvas.height = destVidH;
        canvas.style.width = `${Math.round(elemW)}px`;
        canvas.style.height = `${Math.round(elemH)}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Unable to create canvas context");

        const mirrored = (webcamAny.props && webcamAny.props.mirrored) || webcamAny.props?.mirrored;

        if (mirrored) {
          ctx.save();
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }

        // drawVideo cropped region -> fills canvas
        // drawImage(video, srcX, srcY, srcW, srcH, 0, 0, destVidW, destVidH)
        ctx.drawImage(videoEl, srcX, srcY, srcW, srcH, 0, 0, destVidW, destVidH);

        if (mirrored) ctx.restore();

        const quality = 0.92;
        dataUrl = canvas.toDataURL("image/jpeg", quality);

        // update meta
        vw = vidW;
        vh = vidH;
        displayRect = { width: Math.round(elemW), height: Math.round(elemH) };

        // stop stream tracks
        try { (videoEl.srcObject as MediaStream | null)?.getTracks().forEach(t => t.stop()); } catch { }
      }

      if (!dataUrl) {
        toast({ title: "Capture failed", description: "Could not capture frame", variant: "destructive" });
        return;
      }

      // store raw data and meta
      setCapturedImage(dataUrl);
      setUploadedImage(dataUrl);

      // build meta containing both pixel dims and the visible display box the user saw
      const meta = {
        w: vw || 0,
        h: vh || 0,
        dispW: displayRect ? displayRect.width : 0,
        dispH: displayRect ? displayRect.height : 0,
      };
      setCapturedMeta(meta);

      // ⚠️ Do NOT shrink the camera container on capture.
      // If we update it, only grow it to fit the captured visible area (prevent sudden collapse).
      if (meta.dispH) {
        setDynamicCameraHeight(prev => {
          const minH = 280;
          const prevVal = prev ?? (isKioskMode ? kioskHeight : smallHeight);
          return Math.max(minH, Math.max(prevVal, meta.dispH));
        });
      }

      // persist to sessionStorage so reopening modal restores exact same framing
      try {
        sessionStorage.setItem("lastCapturedImage", dataUrl);
        sessionStorage.setItem("lastCapturedMeta", JSON.stringify(meta));
      } catch (e) { /* ignore */ }

      // UI state after capture
      setIsVideoReady(false);
      clearCountdown();
      clearPreviewTimeout();
      hasFlowStartedRef.current = false;

      // send to tryon API
      setTryOnResult(null);
      setIsProcessing(true);

      toast({ title: "Processing virtual try-on...", description: "Please wait while we generate your try-on result." });

      const garmentImageBase64 = await urlToBase64(product!.images[0]);

      const response = await fetch(TRYON_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_image: dataUrl, garment_image: garmentImageBase64 }),
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
    // remove 'playing' listener if present
    try {
      (webcamRef.current as any)?._cleanupPlayingListener?.();
    } catch (_) { }
    setCameraMode(false);
    setIsVideoReady(false);
    hasFlowStartedRef.current = false;
    // note: intentionally NOT clearing capturedImage / uploadedImage / capturedMeta here
  };

  // restore last captured image & meta when modal opens
  useEffect(() => {
    if (showTryOnModal) {
      try {
        const saved = sessionStorage.getItem("lastCapturedImage");
        const savedMeta = sessionStorage.getItem("lastCapturedMeta");
        if (saved) {
          setCapturedImage(saved);
          setUploadedImage(saved);
        }
        if (savedMeta) {
          try {
            setCapturedMeta(JSON.parse(savedMeta));
          } catch (_) { /* ignore parse */ }
        }
      } catch (e) {
        // ignore storage errors
      }
    }
  }, [showTryOnModal]);

  useEffect(() => {
    return () => {
      clearCountdown();
      clearPreviewTimeout();
      try {
        const videoEl = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
        const stream = videoEl?.srcObject as MediaStream | null;
        stream?.getTracks().forEach(t => t.stop());
      } catch (_) { }
      // also remove playing listener
      try {
        (webcamRef.current as any)?._cleanupPlayingListener?.();
      } catch { }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Recompute dynamic camera height whenever the webcam box width changes
  useEffect(() => {
    if (!cameraMode || !cameraBoxRef.current) return;

    const el = cameraBoxRef.current;

    const ro = new ResizeObserver(() => {
      const videoEl = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
      if (!videoEl || !videoEl.videoWidth || !videoEl.videoHeight) return;

      const boxW = el.clientWidth;
      const baseHeight = Math.round(boxW * (videoEl.videoHeight / videoEl.videoWidth));
      const minH = 380;
      const maxH = isKioskMode ? kioskHeight : 1100;

      setDynamicCameraHeight(Math.max(minH, Math.min(maxH, baseHeight)));
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [cameraMode, isKioskMode, kioskHeight]);

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

  // VIDEO CONSTRAINTS
  const videoConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    aspectRatio: { ideal: 9 / 16 },
    facingMode: "user"
  };

  // Render saved webcam preview exactly like the capture
  const renderSavedWebcamPreview = () => {
    if (!uploadedImage || uploadedImage !== capturedImage || !capturedMeta) return null;

    let targetW = capturedMeta.dispW || 0;
    let targetH = capturedMeta.dispH || 0;

    if (!targetW || !targetH) {
      const aspect = capturedMeta.w && capturedMeta.h ? (capturedMeta.w / capturedMeta.h) : (9 / 16);
      targetH = cameraHeight;
      targetW = Math.round(targetH * aspect);
    }

    // ensure it does not overflow the left panel available width
    const availableW = leftPanelRef.current?.clientWidth ?? 600; // fallback
    if (targetW > availableW) {
      const scale = availableW / targetW;
      targetW = Math.round(targetW * scale);
      targetH = Math.round(targetH * scale);
    }

    // Render wrapper sized exactly to the recorded display bounding box; image uses object-cover
    return (
      <div
        className="mx-auto mb-4 rounded overflow-hidden"
        style={{
          width: `${targetW}px`,
          height: `${targetH}px`,
        }}
      >
        <img
          src={uploadedImage}
          alt="Uploaded (webcam)"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    );
  };

  const VirtualTryOnModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-[95vw] p-6 flex flex-col max-h-[calc(100vh-48px)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Virtual Try-On</h2>
          <Button variant="ghost" size="icon" onClick={closeModal}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid md:grid-cols-[minmax(520px,1fr)_minmax(420px,520px)] gap-6">
            {/* Left panel */}
            <div className="space-y-4" ref={leftPanelRef}>
              <h3 className="font-semibold">Upload Your Photo</h3>
              <p className="text-sm text-muted-foreground">
                For best results, use a clear full-body photo with plain background
              </p>

              {!cameraMode && (
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center overflow-hidden"
                  style={{ minHeight: `${tryonHeight}px` }}
                >

                  {uploadedImage && uploadedImage === capturedImage ? (
                    renderSavedWebcamPreview()
                  ) : uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="max-w-full h-64 object-contain mx-auto mb-4"
                    />
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">Drop your image here or click to upload</p>
                    </div>
                  )}

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
                  <div
                    ref={cameraBoxRef}
                    className="w-full bg-black relative"
                    style={{ height: `${cameraHeight}px` }}
                  >
                    {capturedImage ? (
                      // show exactly the captured frame (no crop)
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        mirrored={true}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        // IMPORTANT: object-cover for full-bleed preview (remove top/bottom bars)
                        className="absolute inset-0 w-full h-full object-cover"
                        onUserMedia={async () => {
                          if (hasFlowStartedRef.current) return;
                          hasFlowStartedRef.current = true;

                          const videoEl = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
                          if (!videoEl) return;

                          // 🔔 listen for when frames actually start painting
                          const onPlaying = async () => {
                            // compute dynamic height based on video aspect + padding (no cropping)
                            try {
                              // compute dynamic height = containerWidth * (videoHeight / videoWidth)
                              await new Promise((r) => setTimeout(r, 50));
                              const vidW = videoEl.videoWidth || 1;
                              const vidH = videoEl.videoHeight || 1;

                              // measure the actual box that holds the webcam (more accurate than leftPanelRef)
                              const boxW = cameraBoxRef.current?.clientWidth
                                ?? leftPanelRef.current?.clientWidth
                                ?? videoEl.getBoundingClientRect().width;

                              const baseHeight = Math.round(boxW * (vidH / vidW)); // <-- NO padding
                              const minH = 280;
                              const maxH = isKioskMode ? kioskHeight : 1100;
                              setDynamicCameraHeight(Math.max(minH, Math.min(maxH, baseHeight)));

                            } catch { /* ignore */ }

                            setIsVideoReady(true);

                            // start countdown only after video is ready (so no black frames)
                            clearPreviewTimeout();
                            previewTimeoutRef.current = window.setTimeout(() => {
                              if (!countdownRef.current && cameraMode && !capturedImage) {
                                startCountdown(countdownSeconds);
                              }
                            }, previewDurationMs) as unknown as number;
                          };

                          videoEl.addEventListener("playing", onPlaying);

                          // store cleanup to remove listener later
                          (webcamRef.current as any)._cleanupPlayingListener = () => {
                            try { videoEl.removeEventListener("playing", onPlaying); } catch { }
                          };
                        }}
                        onUserMediaError={(err) => {
                          console.error("onUserMediaError:", err);
                          toast({ title: "Camera Error", description: "Unable to access camera", variant: "destructive" });
                        }}
                      />
                    )}

                    {/* Light overlay while initializing — keep transparent so live video shows behind the overlay */}
                    {!capturedImage && !isVideoReady && (
                      <div
                        className="absolute inset-0 flex items-center justify-center text-white pointer-events-none"
                        style={{ backgroundColor: "transparent" }}
                      >
                        <div className="rounded px-3 py-1 bg-black/30">Starting camera…</div>
                      </div>
                    )}

                    {/* Countdown overlay — transparent so live video is always visible */}
                    {countdown !== null && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-6xl font-bold text-white bg-black/30 rounded px-6 py-3">
                          {countdown}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex gap-2 p-3 justify-end">
                    {!capturedImage ? (
                      <>
                        <Button onClick={captureFromWebcam} className="btn-primary" disabled={!isVideoReady}>
                          <Camera className="h-4 w-4 mr-2" /> Capture Now
                        </Button>
                        <Button onClick={stopWebcam} variant="outline">Stop Camera</Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => {
                          try { sessionStorage.removeItem("lastCapturedImage"); sessionStorage.removeItem("lastCapturedMeta"); } catch (e) { }
                          setCapturedImage(null);
                          setCapturedMeta(null);
                          setTryOnResult(null);
                          setUploadedImage(null);
                          startWebcam();
                        }}
                        variant="outline"
                      >
                        Retake
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right panel - Try-On Result */}
            <div className="space-y-4">
              <h3 className="font-semibold">Try-On Result</h3>
              <div
                className="relative border border-border rounded-lg bg-muted/30 w-full flex items-center justify-center overflow-hidden"
                style={{ height: `${tryonHeight}px` }}
              >
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

              {/* Download button for try-on result */}
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

        {/* Footer pinned */}
        <div className="flex justify-end space-x-2 mt-1 pt-3 border-border">
          <Button variant="outline" onClick={closeModal}>Close</Button>
          <Button className="btn-primary">Save & Add to Cart</Button>
        </div>
      </Card >
    </div >
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
