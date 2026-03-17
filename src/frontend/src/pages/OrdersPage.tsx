import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { OrderStatus } from "../backend.d";
import type { Order } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyOrders, useOrderItems } from "../hooks/useQueries";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; emoji: string }
> = {
  [OrderStatus.pending]: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    emoji: "⏳",
  },
  [OrderStatus.preparing]: {
    label: "Preparing",
    color: "bg-blue-100 text-blue-700",
    emoji: "👨‍🍳",
  },
  [OrderStatus.outForDelivery]: {
    label: "Out for Delivery",
    color: "bg-orange-100 text-orange-700",
    emoji: "🛵",
  },
  [OrderStatus.delivered]: {
    label: "Delivered",
    color: "bg-green-100 text-green-700",
    emoji: "✅",
  },
  [OrderStatus.cancelled]: {
    label: "Cancelled",
    color: "bg-red-100 text-red-600",
    emoji: "❌",
  },
};

function OrderItemsDetail({ orderId }: { orderId: bigint }) {
  const { data: items, isLoading } = useOrderItems(orderId);
  if (isLoading)
    return <Loader2 className="animate-spin mx-auto mt-2" size={16} />;
  return (
    <div className="mt-2 space-y-1">
      {(items ?? []).map((item) => (
        <div
          key={item.productId.toString()}
          className="flex justify-between text-xs"
        >
          <span className="text-muted-foreground">
            {item.productName} × {Number(item.quantity)}
          </span>
          <span className="font-medium">
            ₹{Number(item.price * item.quantity)}
          </span>
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.status] ?? {
    label: order.status,
    color: "bg-muted text-foreground",
    emoji: "📦",
  };
  const date = new Date(Number(order.createdAt));

  return (
    <motion.div
      data-ocid={`orders.item.${index}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <button
        type="button"
        className="w-full flex items-center gap-3 p-3 cursor-pointer text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="text-2xl">{status.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">
              Order #{order.id.toString()}
            </span>
            <Badge className={`text-[9px] px-1.5 py-0 ${status.color}`}>
              {status.label}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {order.deliveryAddress}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}{" "}
            {date.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-bold text-sm text-primary">
            ₹{Number(order.totalAmount)}
          </span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-border pt-2 space-y-1">
              <OrderItemsDetail orderId={order.id} />
              {order.landmarkNotes && (
                <p className="text-[11px] text-amber-700 mt-2">
                  📍 <span className="font-medium">Landmark:</span>{" "}
                  {order.landmarkNotes}
                </p>
              )}
              {order.scheduledTime && (
                <p className="text-[11px] text-blue-700">
                  📅 <span className="font-medium">Scheduled:</span>{" "}
                  {new Date(Number(order.scheduledTime)).toLocaleString(
                    "en-IN",
                  )}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function OrdersPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: orders, isLoading } = useMyOrders();

  if (!identity) {
    return (
      <div className="px-4 py-12 text-center pb-24">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="font-display font-bold text-xl mb-2">
          Login to View Orders
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to see your order history and track deliveries.
        </p>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          data-ocid="orders.login.button"
          className="bg-primary text-primary-foreground"
        >
          {isLoggingIn ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Login to Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="sticky top-[57px] z-30 bg-card border-b border-border px-4 py-3">
        <h1 className="font-display font-bold text-lg">📋 My Orders</h1>
      </div>
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-3" data-ocid="orders.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (orders ?? []).length === 0 ? (
          <div className="py-12 text-center" data-ocid="orders.empty_state">
            <div className="text-5xl mb-3">📦</div>
            <p className="font-display font-semibold text-lg mb-1">
              No orders yet
            </p>
            <p className="text-sm text-muted-foreground">
              Your orders will appear here once you place one.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(orders ?? []).map((order, idx) => (
              <OrderCard
                key={order.id.toString()}
                order={order}
                index={idx + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
