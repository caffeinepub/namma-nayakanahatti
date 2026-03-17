import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  Banknote,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../backend.d";
import type { Order, OrderItem } from "../backend.d";
import { useCart } from "../context/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateOrder } from "../hooks/useQueries";

type PaymentMethod = "cod" | "upi";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalAmount,
    itemCount,
  } = useCart();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();
  const { mutateAsync: createOrder, isPending } = useCreateOrder();

  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [scheduled, setScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  if (!identity) {
    return (
      <div className="px-4 py-12 text-center pb-24">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="font-display font-bold text-xl mb-2">
          Login to View Cart
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to place your order and track deliveries.
        </p>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          data-ocid="cart.login.button"
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

  if (items.length === 0) {
    return (
      <div
        className="px-4 py-12 text-center pb-24"
        data-ocid="cart.empty_state"
      >
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="font-display font-bold text-xl mb-2">
          Your cart is empty
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Add items from vendors to place an order.
        </p>
        <Button
          onClick={() => navigate({ to: "/" })}
          data-ocid="cart.shop.button"
          className="bg-primary text-primary-foreground"
        >
          Start Shopping
        </Button>
      </div>
    );
  }

  async function handlePlaceOrder() {
    if (!address.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }
    if (!identity) {
      toast.error("Please login first");
      return;
    }

    const vendorId = items[0].vendor.id;

    const order: Order = {
      id: BigInt(0),
      status: OrderStatus.pending,
      deliveryAddress: address,
      landmarkNotes: landmark,
      scheduledTime:
        scheduled && scheduledTime
          ? BigInt(new Date(scheduledTime).getTime())
          : undefined,
      createdAt: BigInt(Date.now()),
      totalAmount,
      vendorId,
      customerId: identity.getPrincipal(),
    };

    const orderItems: OrderItem[] = items.map((item, idx) => ({
      itemId: BigInt(idx),
      orderId: BigInt(0),
      productId: item.product.id,
      productName: item.product.name,
      quantity: BigInt(item.quantity),
      price: item.product.price,
    }));

    try {
      await createOrder({ order, items: orderItems });
      clearCart();
      const payMsg =
        paymentMethod === "cod"
          ? `Pay ₹${Number(totalAmount)} in cash to the delivery rider.`
          : "Please complete UPI payment on delivery.";
      toast.success("🎉 Order placed successfully!", {
        description: payMsg,
      });
      navigate({ to: "/orders" });
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  }

  return (
    <div className="pb-24">
      <div className="sticky top-[57px] z-30 bg-card border-b border-border px-4 py-3">
        <h1 className="font-display font-bold text-lg">
          🛒 Your Cart ({itemCount} item{itemCount !== 1 ? "s" : ""})
        </h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        {items.map((item, idx) => (
          <motion.div
            key={item.product.id.toString()}
            data-ocid={`cart.item.${idx + 1}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-card border border-border rounded-xl p-3 flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">
                {item.product.name}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {item.vendor.name}
              </div>
              <div className="text-sm font-bold text-primary mt-0.5">
                ₹{Number(item.product.price * BigInt(item.quantity))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-ocid={`cart.minus.${idx + 1}`}
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity - 1)
                }
                className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted"
              >
                <Minus size={12} />
              </button>
              <span className="text-sm font-bold w-5 text-center">
                {item.quantity}
              </span>
              <button
                type="button"
                data-ocid={`cart.plus.${idx + 1}`}
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity + 1)
                }
                className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted"
              >
                <Plus size={12} />
              </button>
              <button
                type="button"
                data-ocid={`cart.delete_button.${idx + 1}`}
                onClick={() => removeItem(item.product.id)}
                className="w-7 h-7 rounded-full text-destructive hover:bg-red-50 flex items-center justify-center"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <Separator className="mx-4" />

      <div className="px-4 py-4 space-y-4">
        <h2 className="font-display font-semibold text-sm">
          🏠 Delivery Details
        </h2>

        <div className="space-y-1">
          <Label htmlFor="address" className="text-xs font-semibold">
            Delivery Address *
          </Label>
          <Input
            id="address"
            data-ocid="cart.address.input"
            placeholder="Your house/room number and street"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="landmark" className="text-xs font-semibold">
            📍 Landmark Note{" "}
            <span className="text-muted-foreground font-normal">
              (helps rider find you)
            </span>
          </Label>
          <Textarea
            id="landmark"
            data-ocid="cart.landmark.textarea"
            placeholder="e.g. Behind the temple, near old banyan tree, blue gate..."
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            className="text-sm resize-none h-16"
          />
          <p className="text-[10px] text-amber-600">
            💡 Pro tip: A good landmark ensures faster delivery in
            Nayakanahatti!
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold">📅 Schedule Delivery</p>
              <p className="text-[10px] text-muted-foreground">
                Pre-order for Jathre or festival days
              </p>
            </div>
            <Switch
              data-ocid="cart.scheduled.switch"
              checked={scheduled}
              onCheckedChange={setScheduled}
            />
          </div>
          {scheduled && (
            <div className="mt-2">
              <Input
                type="datetime-local"
                data-ocid="cart.scheduled_time.input"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="text-xs"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <h2 className="font-display font-semibold text-sm">
            💳 Payment Method
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              data-ocid="cart.payment.cod"
              onClick={() => setPaymentMethod("cod")}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
                paymentMethod === "cod"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <Banknote
                size={22}
                className={
                  paymentMethod === "cod"
                    ? "text-primary"
                    : "text-muted-foreground"
                }
              />
              <span
                className={`text-xs font-semibold ${
                  paymentMethod === "cod"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Cash on Delivery
              </span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                Pay cash to rider
              </span>
            </button>
            <button
              type="button"
              data-ocid="cart.payment.upi"
              onClick={() => setPaymentMethod("upi")}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
                paymentMethod === "upi"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <CreditCard
                size={22}
                className={
                  paymentMethod === "upi"
                    ? "text-primary"
                    : "text-muted-foreground"
                }
              />
              <span
                className={`text-xs font-semibold ${
                  paymentMethod === "upi"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                UPI / Online
              </span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                Pay via UPI on delivery
              </span>
            </button>
          </div>
          {paymentMethod === "cod" && (
            <p className="text-[11px] text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              ✅ Keep exact change ready. Rider will collect ₹
              {Number(totalAmount)} at your door.
            </p>
          )}
          {paymentMethod === "upi" && (
            <p className="text-[11px] text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              📲 Scan the rider's QR code and pay ₹{Number(totalAmount)} via any
              UPI app.
            </p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-3">
          <h3 className="text-xs font-semibold mb-2">Order Summary</h3>
          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item.product.id.toString()}
                className="flex justify-between text-xs text-muted-foreground"
              >
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span>
                  ₹{Number(item.product.price * BigInt(item.quantity))}
                </span>
              </div>
            ))}
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between">
            <span className="font-bold text-sm">Total</span>
            <span className="font-bold text-sm text-primary">
              ₹{Number(totalAmount)}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">Payment</span>
            <span className="text-xs font-medium">
              {paymentMethod === "cod"
                ? "💵 Cash on Delivery"
                : "📲 UPI / Online"}
            </span>
          </div>
        </div>

        <Button
          data-ocid="cart.place_order.button"
          onClick={handlePlaceOrder}
          disabled={isPending}
          className="w-full bg-primary text-primary-foreground font-bold py-3 text-base rounded-xl"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Order...
            </>
          ) : (
            <>🛕 Place Order · ₹{Number(totalAmount)}</>
          )}
        </Button>
      </div>
    </div>
  );
}
