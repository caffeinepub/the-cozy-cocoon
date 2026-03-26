import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  ImageIcon,
  RotateCcw,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import {
  useDeleteProduct,
  useGetSoldProducts,
  useToggleProductStatus,
} from "../hooks/useQueries";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

const SKELETON_IDS = ["sk1", "sk2", "sk3", "sk4", "sk5"];

function formatRupees(val: number) {
  return `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(ns: bigint) {
  return new Date(Number(ns) / 1_000_000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function SoldTab() {
  const { data: products = [], isLoading } = useGetSoldProducts();
  const toggleStatus = useToggleProductStatus();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? products.filter((p) => p.name.toLowerCase().includes(q))
      : products;
  }, [products, search]);

  const totalRevenue = useMemo(
    () => products.reduce((s, p) => s + p.sellingPrice, 0),
    [products],
  );

  const handleMoveToStock = async (id: bigint) => {
    const key = String(id);
    setTogglingIds((prev) => new Set(prev).add(key));
    try {
      await toggleStatus.mutateAsync(id);
      toast.success("Product moved back to Stock!");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const key = String(deleteTarget.id);
    setDeletingIds((prev) => new Set(prev).add(key));
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="sold.loading_state">
        {SKELETON_IDS.map((id) => (
          <Skeleton key={id} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      {products.length > 0 && (
        <div className="mb-5 p-4 bg-card rounded-2xl border border-border shadow-xs flex flex-wrap gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total Sold
            </p>
            <p className="font-bold text-lg text-foreground">
              {products.length}
            </p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total Revenue
            </p>
            <p className="font-bold text-lg text-primary">
              {formatRupees(totalRevenue)}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="sold.search_input"
          placeholder="Search sold products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl bg-card border-border"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div
          data-ocid="sold.empty_state"
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground">
            {search ? "No results found" : "No sold products yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {search
              ? "Try a different search term"
              : "Products marked as sold will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product, i) => (
            <motion.div
              key={String(product.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              data-ocid={`sold.item.${i + 1}`}
              className="bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
                {product.photoUrl ? (
                  <img
                    src={product.photoUrl}
                    alt={product.name}
                    className="w-full h-full object-cover opacity-75"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-foreground/70 text-card">
                  Sold
                </div>
              </div>

              <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <h3 className="font-semibold text-foreground text-[15px] leading-snug line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatDate(product.createdAt)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/60 rounded-xl p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                      Cost
                    </p>
                    <p className="font-bold text-sm text-foreground">
                      {formatRupees(product.costPrice)}
                    </p>
                  </div>
                  <div className="bg-muted/60 rounded-xl p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                      Selling
                    </p>
                    <p className="font-bold text-sm text-foreground">
                      {formatRupees(product.sellingPrice)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-1 border-t border-border">
                  <button
                    type="button"
                    data-ocid={`sold.toggle.${i + 1}`}
                    disabled={togglingIds.has(String(product.id))}
                    onClick={() => handleMoveToStock(product.id)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {togglingIds.has(String(product.id))
                      ? "Moving…"
                      : "Move to Stock"}
                  </button>
                  <button
                    type="button"
                    data-ocid={`sold.delete_button.${i + 1}`}
                    disabled={deletingIds.has(String(product.id))}
                    onClick={() => setDeleteTarget(product)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        productName={deleteTarget?.name ?? ""}
        onConfirm={handleDelete}
        isPending={deleteProduct.isPending}
      />
    </div>
  );
}
