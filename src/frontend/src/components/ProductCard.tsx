import { Switch } from "@/components/ui/switch";
import { ImageIcon, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { ProductStatus } from "../backend";
import type { Product } from "../backend.d";

function formatRupees(val: number) {
  return `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

interface Props {
  product: Product;
  index: number;
  isToggling: boolean;
  isDeleting: boolean;
  onToggle: (id: bigint) => void;
  onDelete: (product: Product) => void;
}

export function ProductCard({
  product,
  index,
  isToggling,
  isDeleting,
  onToggle,
  onDelete,
}: Props) {
  const isStock = product.status === ProductStatus.stock;
  const margin = product.sellingPrice - product.costPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      data-ocid={`product.item.${index + 1}`}
      className="bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
        {product.photoUrl ? (
          <img
            src={product.photoUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="w-8 h-8" />
            <span className="text-xs">No photo</span>
          </div>
        )}
        {/* Status badge */}
        <div
          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            isStock
              ? "bg-primary text-primary-foreground"
              : "bg-foreground/70 text-card"
          }`}
        >
          {isStock ? "In Stock" : "Sold"}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-semibold text-foreground text-[15px] leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/60 rounded-xl p-2.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
              Cost
            </p>
            <p className="font-bold text-sm text-foreground">
              {formatRupees(product.costPrice)}
            </p>
          </div>
          <div className="bg-primary/8 rounded-xl p-2.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
              Selling
            </p>
            <p className="font-bold text-sm text-primary">
              {formatRupees(product.sellingPrice)}
            </p>
          </div>
        </div>

        {margin > 0 && (
          <p className="text-xs text-muted-foreground">
            Margin:{" "}
            <span className="font-semibold text-foreground">
              {formatRupees(margin)}
            </span>
          </p>
        )}

        {/* Toggle + Delete row */}
        <div className="flex items-center justify-between mt-auto pt-1 border-t border-border">
          <div className="flex items-center gap-2">
            <Switch
              data-ocid={`product.toggle.${index + 1}`}
              checked={isStock}
              disabled={isToggling}
              onCheckedChange={() => onToggle(product.id)}
              className="data-[state=checked]:bg-primary"
            />
            <span className="text-xs text-muted-foreground">
              {isToggling ? "Updating…" : isStock ? "In Stock" : "Sold"}
            </span>
          </div>
          <button
            type="button"
            data-ocid={`product.delete_button.${index + 1}`}
            disabled={isDeleting}
            onClick={() => onDelete(product)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
