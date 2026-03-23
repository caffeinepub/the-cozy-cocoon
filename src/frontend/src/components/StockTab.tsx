import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IndianRupee,
  Package,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Tag,
  Trash2,
  TrendingDown,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { ProductInfo } from "../backend.d";
import {
  useAddProduct,
  useEditProduct,
  useGetAllProducts,
  useRemoveProduct,
  useSellProduct,
} from "../hooks/useQueries";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { ProductDialog } from "./ProductDialog";
import { SellDialog } from "./SellDialog";

const SKELETON_IDS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"];

function fmt(cents: bigint) {
  return `₹${(Number(cents) / 100).toFixed(2)}`;
}

function StatsCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <span
          className={`font-semibold text-sm ${
            accent ? "text-low-stock" : "text-foreground"
          }`}
        >
          {value}
        </span>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  index,
  onEdit,
  onSell,
  onDelete,
}: {
  product: ProductInfo;
  index: number;
  onEdit: (p: ProductInfo) => void;
  onSell: (p: ProductInfo) => void;
  onDelete: (p: ProductInfo) => void;
}) {
  const isLow = Number(product.quantity) < 5;
  const profit = Number(product.sellingPrice) - Number(product.costPrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      data-ocid={`stock.item.${index + 1}`}
      className="bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-shadow p-4 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Package className="w-5 h-5 text-primary" />
        </div>
        <Badge
          className={`text-xs font-semibold rounded-full px-2.5 py-0.5 border-0 ${
            isLow
              ? "bg-low-stock/10 text-low-stock"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {String(product.quantity)} units
        </Badge>
      </div>

      <div>
        <h3 className="font-semibold text-foreground text-[15px] leading-snug line-clamp-2">
          {product.name}
        </h3>
        {isLow && (
          <p className="text-xs text-low-stock mt-0.5 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Low stock
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/50 rounded-lg p-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
            Cost
          </p>
          <p className="font-bold text-sm text-foreground">
            {fmt(product.costPrice)}
          </p>
        </div>
        <div className="bg-primary/5 rounded-lg p-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
            Selling
          </p>
          <p className="font-bold text-sm text-primary">
            {fmt(product.sellingPrice)}
          </p>
        </div>
      </div>

      {profit > 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Tag className="w-3 h-3" />
          Margin:{" "}
          <span className="font-semibold text-foreground">
            {fmt(BigInt(profit))}
          </span>
          /unit
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          onClick={() => onSell(product)}
          data-ocid={`stock.primary_button.${index + 1}`}
          className="flex-1 bg-primary text-primary-foreground rounded-lg h-8 text-xs font-medium hover:bg-primary/90"
        >
          <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Sell
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(product)}
          data-ocid={`stock.edit_button.${index + 1}`}
          className="rounded-lg h-8 w-8 p-0 border-border hover:bg-accent"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(product)}
          data-ocid={`stock.delete_button.${index + 1}`}
          className="rounded-lg h-8 w-8 p-0 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

export function StockTab() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const addProduct = useAddProduct();
  const editProduct = useEditProduct();
  const removeProduct = useRemoveProduct();
  const sellProduct = useSellProduct();

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductInfo | null>(null);
  const [sellTarget, setSellTarget] = useState<ProductInfo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductInfo | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? products.filter((p) => p.name.toLowerCase().includes(q))
      : products;
  }, [products, search]);

  const stats = useMemo(() => {
    const totalItems = products.reduce((s, p) => s + Number(p.quantity), 0);
    const lowStock = products.filter((p) => Number(p.quantity) < 5).length;
    const totalCost = products.reduce(
      (s, p) => s + Number(p.quantity) * Number(p.costPrice),
      0,
    );
    const totalSell = products.reduce(
      (s, p) => s + Number(p.quantity) * Number(p.sellingPrice),
      0,
    );
    return {
      totalItems,
      lowStock,
      totalCost: BigInt(totalCost),
      totalSell: BigInt(totalSell),
    };
  }, [products]);

  const handleAdd = async (data: {
    name: string;
    quantity: bigint;
    costPrice: bigint;
    sellingPrice: bigint;
  }) => {
    try {
      await addProduct.mutateAsync(data);
      setAddOpen(false);
      toast.success("Product added!");
    } catch {
      toast.error("Failed to add product");
    }
  };

  const handleEdit = async (data: {
    name: string;
    quantity: bigint;
    costPrice: bigint;
    sellingPrice: bigint;
  }) => {
    if (!editTarget) return;
    try {
      await editProduct.mutateAsync({ id: editTarget.id, input: data });
      setEditTarget(null);
      toast.success("Product updated!");
    } catch {
      toast.error("Failed to update product");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeProduct.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("Product removed");
    } catch {
      toast.error("Failed to remove product");
    }
  };

  const handleSell = async (qty: bigint) => {
    if (!sellTarget) return;
    try {
      await sellProduct.mutateAsync({
        productId: sellTarget.id,
        quantity: qty,
      });
      setSellTarget(null);
      toast.success(`Sold ${qty} unit(s) of ${sellTarget.name}`);
    } catch {
      toast.error("Failed to record sale");
    }
  };

  return (
    <div className="flex gap-6 items-start">
      <div className="flex-1 min-w-0">
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
            className="bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add New Product
          </Button>
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="stock.loading_state"
          >
            {SKELETON_IDS.map((id) => (
              <Skeleton key={id} className="h-52 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="stock.empty_state"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">
              {search ? "No products found" : "No products yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {search
                ? "Try a different search term"
                : "Add your first product to get started"}
            </p>
            {!search && (
              <Button
                onClick={() => setAddOpen(true)}
                className="mt-4 bg-primary text-primary-foreground rounded-xl"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Product
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
                onEdit={setEditTarget}
                onSell={setSellTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      <aside className="w-64 shrink-0 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card rounded-xl border border-border shadow-card p-4 sticky top-24"
        >
          <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-primary" />
            Stock Overview
          </h3>
          <StatsCard label="Total Items" value={stats.totalItems} />
          <StatsCard
            label="Low Stock"
            value={stats.lowStock}
            sub={stats.lowStock > 0 ? "< 5 units" : undefined}
            accent={stats.lowStock > 0}
          />
          <StatsCard label="Total Cost Value" value={fmt(stats.totalCost)} />
          <StatsCard label="Total Sell Value" value={fmt(stats.totalSell)} />
          <StatsCard
            label="Est. Profit"
            value={fmt(stats.totalSell - stats.totalCost)}
          />
        </motion.div>
      </aside>

      <ProductDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAdd}
        isPending={addProduct.isPending}
      />
      <ProductDialog
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
        product={editTarget}
        onSubmit={handleEdit}
        isPending={editProduct.isPending}
      />
      <SellDialog
        open={!!sellTarget}
        onOpenChange={(v) => !v && setSellTarget(null)}
        product={sellTarget}
        onSubmit={handleSell}
        isPending={sellProduct.isPending}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        productName={deleteTarget?.name ?? ""}
        onConfirm={handleDelete}
        isPending={removeProduct.isPending}
      />
    </div>
  );
}
