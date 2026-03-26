import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import {
  useDeleteProduct,
  useGetStockProducts,
  useToggleProductStatus,
} from "../hooks/useQueries";
import { AddProductDialog } from "./AddProductDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { ProductCard } from "./ProductCard";

const SKELETON_IDS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"];

export function StockTab() {
  const { data: products = [], isLoading } = useGetStockProducts();
  const toggleStatus = useToggleProductStatus();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? products.filter((p) => p.name.toLowerCase().includes(q))
      : products;
  }, [products, search]);

  const handleToggle = async (id: bigint) => {
    const key = String(id);
    setTogglingIds((prev) => new Set(prev).add(key));
    try {
      await toggleStatus.mutateAsync(id);
      toast.success("Product moved to Sold!");
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

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="stock.search_input"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-card border-border"
          />
        </div>
        <Button
          data-ocid="stock.primary_button"
          onClick={() => setAddOpen(true)}
          className="bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="stock.loading_state"
        >
          {SKELETON_IDS.map((id) => (
            <Skeleton key={id} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="stock.empty_state"
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground">
            {search ? "No products found" : "No stock yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {search
              ? "Try a different search term"
              : "Add your first product to start managing your inventory."}
          </p>
          {!search && (
            <Button
              onClick={() => setAddOpen(true)}
              className="mt-5 bg-primary text-primary-foreground rounded-xl gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add First Product
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <ProductCard
              key={String(p.id)}
              product={p}
              index={i}
              isToggling={togglingIds.has(String(p.id))}
              isDeleting={deletingIds.has(String(p.id))}
              onToggle={handleToggle}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <AddProductDialog open={addOpen} onOpenChange={setAddOpen} />

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
