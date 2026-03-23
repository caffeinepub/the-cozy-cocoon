import { Skeleton } from "@/components/ui/skeleton";
import { Clock, IndianRupee, ShoppingBag, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { useGetAllProducts, useGetAllSales } from "../hooks/useQueries";

const SKELETON_IDS = ["sk1", "sk2", "sk3", "sk4", "sk5"];

function fmt(cents: bigint) {
  return `₹${(Number(cents) / 100).toFixed(2)}`;
}

function fmtDate(ns: bigint) {
  return new Date(Number(ns) / 1_000_000).toLocaleString();
}

export function SoldTab() {
  const { data: sales = [], isLoading } = useGetAllSales();
  const { data: products = [] } = useGetAllProducts();

  const productMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of products) m.set(String(p.id), p.name);
    return m;
  }, [products]);

  const totalRevenue = useMemo(
    () => sales.reduce((s, sale) => s + sale.totalPrice, 0n),
    [sales],
  );
  const totalProfit = useMemo(
    () => sales.reduce((s, sale) => s + sale.profit, 0n),
    [sales],
  );
  const totalUnits = useMemo(
    () => sales.reduce((s, sale) => s + Number(sale.quantity), 0),
    [sales],
  );

  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="sold.loading_state">
        {SKELETON_IDS.map((id) => (
          <Skeleton key={id} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div
        data-ocid="sold.empty_state"
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
          <ShoppingBag className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold text-foreground">No sales yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Sales will appear here once products are marked as sold.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 items-start">
      <div className="flex-1 min-w-0 space-y-3">
        {[...sales].reverse().map((sale, i) => {
          const productName =
            productMap.get(String(sale.productId)) ??
            `Product #${String(sale.productId)}`;
          return (
            <motion.div
              key={String(sale.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              data-ocid={`sold.item.${i + 1}`}
              className="bg-card rounded-xl border border-border shadow-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-[15px]">
                    {productName}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {fmtDate(sale.timestamp)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Qty
                  </p>
                  <p className="font-bold text-sm text-foreground">
                    {String(sale.quantity)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Cost
                  </p>
                  <p className="font-bold text-sm text-foreground">
                    {fmt(sale.costPrice)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Revenue
                  </p>
                  <p className="font-bold text-sm text-primary">
                    {fmt(sale.totalPrice)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Profit
                  </p>
                  <p
                    className={`font-bold text-sm ${
                      Number(sale.profit) >= 0
                        ? "text-primary"
                        : "text-low-stock"
                    }`}
                  >
                    {fmt(sale.profit)}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <aside className="w-64 shrink-0 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card rounded-xl border border-border shadow-card p-4 sticky top-24"
        >
          <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Sales Summary
          </h3>
          <div className="space-y-0">
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Total Sales</span>
              <span className="font-semibold text-sm">{sales.length}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Units Sold</span>
              <span className="font-semibold text-sm">{totalUnits}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">
                Total Revenue
              </span>
              <span className="font-semibold text-sm text-primary">
                {fmt(totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-muted-foreground">
                Total Profit
              </span>
              <span
                className={`font-semibold text-sm ${
                  Number(totalProfit) >= 0 ? "text-primary" : "text-low-stock"
                }`}
              >
                {fmt(totalProfit)}
              </span>
            </div>
          </div>
        </motion.div>
      </aside>
    </div>
  );
}
