import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { StockStatus, VendorStatus } from "../backend.d";
import { useCart } from "../context/CartContext";
import { useProductsByVendor, useVendor } from "../hooks/useQueries";

export default function VendorPage() {
  const { id } = useParams({ from: "/vendor/$id" });
  const navigate = useNavigate();
  const vendorId = BigInt(id);

  const { data: vendor, isLoading: vendorLoading } = useVendor(vendorId);
  const { data: products, isLoading: productsLoading } =
    useProductsByVendor(vendorId);
  const { addItem, items } = useCart();

  function handleAdd(product: NonNullable<typeof products>[0]) {
    if (!vendor) return;
    addItem(product, vendor);
    toast.success(`${product.name} added to cart`, {
      description: `₹${Number(product.price)} × 1`,
    });
  }

  const cartProductIds = new Set(items.map((i) => i.product.id.toString()));

  if (vendorLoading) {
    return (
      <div className="px-4 py-4 pb-24" data-ocid="vendor.loading_state">
        <Skeleton className="h-8 w-8 rounded-full mb-4" />
        <Skeleton className="h-28 w-full rounded-2xl mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div
        className="px-4 py-10 text-center pb-24"
        data-ocid="vendor.error_state"
      >
        <p className="text-muted-foreground">Vendor not found.</p>
        <Button
          onClick={() => navigate({ to: "/" })}
          variant="outline"
          className="mt-4"
        >
          Go Home
        </Button>
      </div>
    );
  }

  const categoryEmoji =
    vendor.category === "temple"
      ? "🛕"
      : vendor.category === "restaurant"
        ? "🍲"
        : vendor.category === "grocery"
          ? "🛒"
          : "💊";

  return (
    <div className="pb-24">
      <div className="sticky top-[57px] z-30 bg-card border-b border-border">
        <div className="max-w-md mx-auto flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            data-ocid="vendor.back.button"
            onClick={() => navigate({ to: "/" })}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-display font-bold text-base flex-1 truncate">
            {vendor.name}
          </h1>
          <Badge
            className={`text-[10px] px-2 ${
              vendor.status === VendorStatus.open
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {vendor.status === VendorStatus.open ? "Open" : "Closed"}
          </Badge>
        </div>
      </div>

      <div className="px-4 py-3 bg-gradient-to-br from-orange-50 to-amber-50 border-b border-border">
        <div className="flex gap-3 items-start">
          <div className="text-4xl">{categoryEmoji}</div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">
              {vendor.description}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              📍 {vendor.address}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {vendor.isEcoDelivery && (
                <Badge className="text-[10px] bg-green-600 text-white border-0 px-2">
                  🌿 E-Delivery
                </Badge>
              )}
              {vendor.category === "temple" && (
                <Badge className="text-[10px] bg-amber-500 text-white border-0 px-2">
                  🙏 BHOG Certified
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <h2 className="font-display text-sm font-semibold mb-3">
          Menu &amp; Products
        </h2>
        {productsLoading ? (
          <div
            className="grid grid-cols-2 gap-3"
            data-ocid="products.loading_state"
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : (products ?? []).length === 0 ? (
          <div className="py-10 text-center" data-ocid="products.empty_state">
            <p className="text-muted-foreground text-sm">
              No products available.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {(products ?? []).map((product, idx) => (
              <motion.div
                key={product.id.toString()}
                data-ocid={`products.item.${idx + 1}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-card border border-border rounded-xl p-3 flex flex-col"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="font-semibold text-xs leading-tight flex-1">
                      {product.name}
                    </h3>
                    <Badge
                      className={`text-[9px] px-1 py-0 flex-shrink-0 ${
                        product.stockStatus === StockStatus.inStock
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {product.stockStatus === StockStatus.inStock ? "✓" : "✗"}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-sm text-primary">
                    ₹{Number(product.price)}
                  </span>
                  <Button
                    size="sm"
                    data-ocid={`products.add_button.${idx + 1}`}
                    disabled={
                      product.stockStatus !== StockStatus.inStock ||
                      vendor.status !== VendorStatus.open
                    }
                    onClick={() => handleAdd(product)}
                    className={`h-7 w-7 p-0 rounded-full ${
                      cartProductIds.has(product.id.toString())
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-primary hover:bg-primary/90"
                    }`}
                  >
                    {cartProductIds.has(product.id.toString()) ? (
                      <Check size={12} />
                    ) : (
                      <Plus size={12} />
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
