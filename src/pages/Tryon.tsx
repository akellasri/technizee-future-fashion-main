import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Tryon = () => {
    const { toast } = useToast();

    const [garmentImageUrl, setGarmentImageUrl] = useState<string | null>(null);
    const [userImageFile, setUserImageFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [tryOnResult, setTryOnResult] = useState<string | null>(null);

    // Read product + image from Shopify URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const imageParam = params.get("image");
        const productId = params.get("product");

        if (!imageParam) {
            toast({
                title: "Missing product image",
                description: "Image parameter was not found in the URL.",
                variant: "destructive",
            });
            return;
        }

        setGarmentImageUrl(imageParam);

        if (productId) {
            console.log("Shopify product id:", productId);
        }
    }, [toast]);

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

    const handleVirtualTryOn = async () => {
        const VIRTUAL_TRYON_API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"
            }/api/virtual-tryon`;

        if (!VIRTUAL_TRYON_API_URL) {
            toast({
                title: "API not configured",
                description: "Please configure the Virtual Try-On API URL.",
                variant: "destructive",
            });
            return;
        }

        if (!userImageFile) {
            toast({
                title: "Upload required",
                description: "Please upload your photo first.",
                variant: "destructive",
            });
            return;
        }

        if (!garmentImageUrl) {
            toast({
                title: "Missing garment image",
                description: "Unable to find product image from Shopify.",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);

        try {
            const userImageB64 = await fileToBase64(userImageFile);
            const garmentImageB64 = await urlToBase64(garmentImageUrl);

            const requestBody = {
                service: "virtual_tryon",
                user_image: userImageB64,
                garment_image: garmentImageB64,
                category: "upper_body",
                garment_type: null,
                garment_orientation: null,
                extra_prompt: null,
            };

            const response = await fetch(VIRTUAL_TRYON_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": import.meta.env.VITE_INTERNAL_KEY
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
                    description: "Your try-on result is ready.",
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

    return (
        <div className="min-h-screen bg-background">
            {/* Simple header */}
            <header className="border-b border-border">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-3">
                        <img
                            src="/lovable-uploads/676f11a3-0467-482a-bd66-aaf29c1ea20d.png"
                            alt="Technizee Logo"
                            className="h-10 w-auto"
                        />
                    </Link>
                    <Link to="/virtual-tryon">
                        <Button variant="outline">Go to full Virtual Try-On</Button>
                    </Link>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: garment image from Shopify */}
                <Card className="p-6 flex flex-col items-center justify-center">
                    <h2 className="text-xl font-semibold mb-4 text-center">
                        Product from Shopify
                    </h2>
                    {garmentImageUrl ? (
                        <img
                            src={garmentImageUrl}
                            alt="Selected garment"
                            className="max-h-[480px] w-auto rounded-lg shadow-md object-contain"
                        />
                    ) : (
                        <p className="text-muted-foreground">
                            Waiting for product image from Shopify URL...
                        </p>
                    )}
                </Card>

                {/* Right: upload + result */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4 text-center">
                            Upload your photo
                        </h2>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setUserImageFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-muted-foreground
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-primary file:text-primary-foreground
                         hover:file:bg-primary/80"
                        />
                        {userImageFile && (
                            <p className="mt-2 text-sm text-green-600">
                                ✓ Photo selected: {userImageFile.name}
                            </p>
                        )}

                        <Button
                            className="w-full mt-4"
                            onClick={handleVirtualTryOn}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Processing..." : "Generate Try-On"}
                        </Button>
                    </Card>

                    {tryOnResult && (
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4 text-center">
                                Your Virtual Try-On Result
                            </h2>
                            <img
                                src={tryOnResult}
                                alt="Virtual try-on result"
                                className="w-full rounded-lg shadow-lg"
                            />
                            <Button
                                className="w-full mt-4"
                                onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = tryOnResult;
                                    link.download = "virtual-tryon-result.jpg";
                                    link.click();
                                }}
                            >
                                Download Result
                            </Button>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tryon;
