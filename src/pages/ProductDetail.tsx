import { useState } from "react";
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

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [showTryOnModal, setShowTryOnModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Mock product data - in real app this would come from API
  const product = {
    id: 1,
    name: "Premium Cotton T-Shirt",
    price: "₹1,299",
    originalPrice: "₹1,999",
    images: ["/api/placeholder/500/600", "/api/placeholder/500/600", "/api/placeholder/500/600"],
    rating: 4.5,
    reviews: 128,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Navy", "Gray"],
    description: "Premium quality cotton t-shirt with perfect fit and comfort. Made from 100% organic cotton with sustainable practices.",
    features: ["100% Organic Cotton", "Pre-shrunk", "Machine Washable", "Eco-friendly"]
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        // Here you would call the virtual try-on API
        toast({
          title: "Image uploaded successfully!",
          description: "Processing virtual try-on...",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // Here you would implement camera capture functionality
    toast({
      title: "Camera feature",
      description: "Camera functionality will be implemented with API integration.",
    });
  };

  const VirtualTryOnModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Virtual Try-On</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowTryOnModal(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Upload Your Photo</h3>
            <p className="text-sm text-muted-foreground">
              For best results, use a clear full-body photo with plain background
            </p>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              {uploadedImage ? (
                <img 
                  src={uploadedImage} 
                  alt="Uploaded" 
                  className="max-w-full h-40 object-contain mx-auto mb-4"
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
                onChange={handleFileUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button variant="outline" className="mt-4" asChild>
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </span>
                </Button>
              </label>
              
              <div className="mt-4">
                <Button onClick={handleCameraCapture} className="btn-primary">
                  <Camera className="h-4 w-4 mr-2" />
                  Use Camera
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Try-On Result</h3>
            <div className="border border-border rounded-lg p-8 text-center bg-muted/30">
              {uploadedImage ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Virtual try-on will appear here
                  </p>
                  <div className="h-40 bg-muted rounded flex items-center justify-center">
                    <p className="text-muted-foreground">Processing...</p>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <p className="text-muted-foreground">Upload an image to see virtual try-on</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => setShowTryOnModal(false)}>
            Close
          </Button>
          <Button className="btn-primary">
            Save & Add to Cart
          </Button>
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
                <Badge className="bg-green-100 text-green-800">35% OFF</Badge>
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
              <p className="text-muted-foreground mb-4">{product.description}</p>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
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