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
  product: ProductInfo | null;
  onSubmit: (quantity: bigint) => Promise<void>;
  isPending: boolean;
}

export function SellDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  isPending,
}: Props) {
  const [qty, setQty] = useState("1");

  useEffect(() => {
    if (open) setQty("1");
  }, [open]);

  const maxQty = product ? Number(product.quantity) : 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = Math.min(Math.max(1, Number.parseInt(qty) || 1), maxQty);
    await onSubmit(BigInt(n));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="rounded-2xl sm:max-w-sm"
        data-ocid="sell.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Mark as Sold
          </DialogTitle>
        </DialogHeader>
        {product && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <p className="text-sm text-muted-foreground">
              Selling:{" "}
              <span className="font-semibold text-foreground">
                {product.name}
              </span>
              <br />
              Available:{" "}
              <span className="font-semibold text-foreground">
                {String(product.quantity)}
              </span>{" "}
              units
            </p>
            <div>
              <Label htmlFor="sell-qty">Quantity to sell</Label>
              <Input
                id="sell-qty"
                type="number"
                min="1"
                max={maxQty}
                data-ocid="sell.input"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="mt-1.5"
                autoFocus
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-ocid="sell.cancel_button"
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-ocid="sell.submit_button"
                className="bg-primary text-primary-foreground rounded-xl"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Confirm Sale
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
