import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProductInfo } from "../backend.d";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product?: ProductInfo | null;
  onSubmit: (data: {
    name: string;
    quantity: bigint;
    costPrice: bigint;
    sellingPrice: bigint;
  }) => Promise<void>;
  isPending: boolean;
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  isPending,
}: Props) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  useEffect(() => {
    if (open) {
      setName(product?.name ?? "");
      setQuantity(product ? String(product.quantity) : "");
      setCostPrice(product ? (Number(product.costPrice) / 100).toFixed(2) : "");
      setSellingPrice(
        product ? (Number(product.sellingPrice) / 100).toFixed(2) : "",
      );
    }
  }, [open, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: name.trim(),
      quantity: BigInt(Math.max(0, Number.parseInt(quantity) || 0)),
      costPrice: BigInt(Math.round(Number.parseFloat(costPrice) * 100)),
      sellingPrice: BigInt(Math.round(Number.parseFloat(sellingPrice) * 100)),
    });
  };

  const isEdit = !!product;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="rounded-2xl sm:max-w-md"
        data-ocid="product.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <Label htmlFor="prod-name">Product Name</Label>
            <Input
              id="prod-name"
              data-ocid="product.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Handmade Candle"
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="prod-qty">Quantity</Label>
            <Input
              id="prod-qty"
              type="number"
              min="0"
              data-ocid="product.input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              required
              className="mt-1.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="prod-cost">Cost Price (₹)</Label>
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
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="prod-sell">Selling Price (₹)</Label>
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
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="product.cancel_button"
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim()}
              data-ocid="product.submit_button"
              className="bg-primary text-primary-foreground rounded-xl"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isEdit ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
