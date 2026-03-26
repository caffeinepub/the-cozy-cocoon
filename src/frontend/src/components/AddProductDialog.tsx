import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useBlobUpload } from "../hooks/useBlobUpload";
import { useAddProduct, useToggleProductStatus } from "../hooks/useQueries";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function parseRupees(val: string) {
  const num = Number.parseFloat(val);
  return Number.isNaN(num) ? 0 : num;
}

export function AddProductDialog({ open, onOpenChange }: Props) {
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [isSold, setIsSold] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addProduct = useAddProduct();
  const toggleStatus = useToggleProductStatus();
  const { uploadFile, uploadProgress, isUploading } = useBlobUpload();

  const isPending =
    addProduct.isPending || isUploading || toggleStatus.isPending;

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  };

  const handleReset = () => {
    setName("");
    setCostPrice("");
    setSellingPrice("");
    setIsSold(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleClose = (v: boolean) => {
    if (!isPending) {
      if (!v) handleReset();
      onOpenChange(v);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      let photoUrl = "";
      if (imageFile) {
        photoUrl = await uploadFile(imageFile);
      }
      const productId = await addProduct.mutateAsync({
        name: name.trim(),
        costPrice: parseRupees(costPrice),
        sellingPrice: parseRupees(sellingPrice),
        photoUrl,
      });
      if (isSold) {
        await toggleStatus.mutateAsync(productId);
      }
      toast.success(`"${name.trim()}" added successfully!`);
      handleReset();
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to add product. Please try again.");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="rounded-2xl sm:max-w-md max-h-[90vh] overflow-y-auto"
        data-ocid="product.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Add New Product
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Product Name */}
          <div>
            <Label htmlFor="prod-name" className="text-sm font-medium">
              Product Name
            </Label>
            <Input
              id="prod-name"
              data-ocid="product.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Handmade Scented Candle"
              required
              className="mt-1.5 bg-input border-border"
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="prod-cost" className="text-sm font-medium">
                Cost Price (₹)
              </Label>
              <Input
                id="prod-cost"
                type="number"
                step="0.01"
                min="0"
                data-ocid="product.input"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="0.00"
                required
                className="mt-1.5 bg-input border-border"
              />
            </div>
            <div>
              <Label htmlFor="prod-sell" className="text-sm font-medium">
                Selling Price (₹)
              </Label>
              <Input
                id="prod-sell"
                type="number"
                step="0.01"
                min="0"
                data-ocid="product.input"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="0.00"
                required
                className="mt-1.5 bg-input border-border"
              />
            </div>
          </div>

          {/* Image Upload — use label so it's semantically clickable */}
          <div>
            <span className="text-sm font-medium">Product Photo</span>
            <label
              htmlFor="prod-image-input"
              data-ocid="product.dropzone"
              className={`mt-1.5 flex flex-col border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-36 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  {isDragging ? (
                    <Upload className="w-8 h-8 text-primary" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary">
                      Click to upload
                    </span>{" "}
                    or drag & drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP
                  </p>
                </div>
              )}
            </label>
            <input
              id="prod-image-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              data-ocid="product.upload_button"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageSelect(file);
              }}
            />
            {isUploading && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading photo…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border">
            <Checkbox
              id="prod-sold"
              data-ocid="product.checkbox"
              checked={isSold}
              onCheckedChange={(v) => setIsSold(!!v)}
            />
            <div>
              <Label
                htmlFor="prod-sold"
                className="text-sm font-medium cursor-pointer"
              >
                Mark as Sold
              </Label>
              <p className="text-xs text-muted-foreground">
                {isSold
                  ? "Product will appear in the Sold list"
                  : "Product will appear in the Stock list"}
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              data-ocid="product.cancel_button"
              disabled={isPending}
              className="rounded-xl border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim()}
              data-ocid="product.submit_button"
              className="bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isPending ? "Adding…" : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
