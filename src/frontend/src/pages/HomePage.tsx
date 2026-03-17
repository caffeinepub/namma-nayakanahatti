import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { VendorStatus } from "../backend.d";
import type { VendorCategory } from "../backend.d";
import { useAllVendors, useVendorsByCategory } from "../hooks/useQueries";

const CATEGORIES: {
  key: VendorCategory | null;
  emoji: string;
  label: string;
}[] = [
  { key: null, emoji: "🏪", label: "All" },
  { key: "temple" as VendorCategory, emoji: "🛕", label: "Temple Kits" },
  { key: "restaurant" as VendorCategory, emoji: "🍲", label: "Hot Meals" },
  { key: "grocery" as VendorCategory, emoji: "🛒", label: "Groceries" },
  { key: "pharmacy" as VendorCategory, emoji: "💊", label: "Health" },
];

const PRO_TIPS = [
  {
    id: "landmark",
    title: "📍 Landmark Accuracy",
    content:
      "Nayakanahatti streets can be bustling and addresses often vary. Always add a descriptive landmark like 'behind the temple' or 'near the old banyan tree' in your address notes so our riders find you faster.",
  },
  {
    id: "whatsapp",
    title: "📶 Low Signal? Use WhatsApp",
    content:
      "If your mobile internet is weak near the temple area, browse our catalog and place orders directly through our official WhatsApp Business number 7483314430. We also support instant UPI payments within the chat.",
  },
  {
    id: "jathre",
    title: "🎡 Jathre Planning",
    content:
      "During the annual Rathotsava (Feb–March), the town sees lakhs of visitors. Use our 'Scheduled Delivery' feature to pre-order your puja essentials 24 hours in advance and avoid the festival rush.",
  },
  {
    id: "eco",
    title: "⚡ Eco-Friendly Choice",
    content:
      "Look for the E-Delivery badge. Most of our riders use silent electric bikes, which help keep our temple town clean and reduce noise pollution for a more peaceful pilgrimage.",
  },
  {
    id: "local",
    title: "🤝 Support Local",
    content:
      "Every order you place helps a local Nayakanahatti shop owner grow their business and creates employment for the town's youth. We use a fair subscription model for our vendors so they keep more of their earnings.",
  },
  {
    id: "bhog",
    title: "🙏 Hygiene First (BHOG Standards)",
    content:
      "For temple-related deliveries, our riders follow strict BHOG (Blissful Hygienic Offering to God) safety standards, ensuring your offerings are handled with the respect they deserve.",
  },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] =
    useState<VendorCategory | null>(null);
  const navigate = useNavigate();
  const { data: allVendors } = useAllVendors();
  const { data: filteredVendors, isLoading } =
    useVendorsByCategory(selectedCategory);

  const vendors = selectedCategory
    ? filteredVendors
    : (allVendors ?? filteredVendors);

  return (
    <div className="pb-24">
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <img
          src="/assets/generated/hero-temple-banner.dim_1200x400.jpg"
          alt="Namma Nayakanahatti"
          className="w-full h-44 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-background/80 flex flex-col justify-end p-4">
          <h1 className="font-display text-2xl font-bold text-white drop-shadow-md leading-tight">
            Namma Nayakanahatti
          </h1>
          <p className="text-xs text-white/90 drop-shadow font-medium mt-0.5">
            Your Digital Bridge to Temple Offerings &amp; Daily Needs
          </p>
          <div className="flex gap-2 mt-2">
            <Badge className="bg-primary/90 text-primary-foreground text-[10px] px-2 py-0.5">
              ⚡ Under 30 min delivery
            </Badge>
            <Badge className="text-[10px] px-2 py-0.5 bg-green-600/90 text-white border-0">
              🌿 E-Delivery
            </Badge>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <section className="px-4 pt-4">
        <h2 className="font-display text-base font-semibold mb-3">
          What do you need?
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key ?? "all"}
              type="button"
              data-ocid={`category.${cat.key ?? "all"}.tab`}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all ${
                selectedCategory === cat.key
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              }`}
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className="text-[11px] font-semibold whitespace-nowrap">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Vendor Listings */}
      <section className="px-4 pt-5">
        <h2 className="font-display text-base font-semibold mb-3">
          {selectedCategory
            ? `${CATEGORIES.find((c) => c.key === selectedCategory)?.emoji} ${CATEGORIES.find((c) => c.key === selectedCategory)?.label}`
            : "🏪 All Vendors"}
        </h2>

        {isLoading ? (
          <div
            className="grid grid-cols-2 gap-3"
            data-ocid="vendors.loading_state"
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory ?? "all"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 gap-3"
            >
              {(vendors ?? []).length === 0 ? (
                <div
                  className="col-span-2 py-10 text-center"
                  data-ocid="vendors.empty_state"
                >
                  <p className="text-muted-foreground text-sm">
                    No vendors found in this category.
                  </p>
                </div>
              ) : (
                (vendors ?? []).map((vendor, idx) => (
                  <motion.div
                    key={vendor.id.toString()}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      data-ocid={`vendors.item.${idx + 1}`}
                      className="cursor-pointer hover:shadow-md transition-shadow border-border p-3"
                      onClick={() =>
                        navigate({
                          to: "/vendor/$id",
                          params: { id: vendor.id.toString() },
                        })
                      }
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl">
                          {vendor.category === "temple"
                            ? "🛕"
                            : vendor.category === "restaurant"
                              ? "🍲"
                              : vendor.category === "grocery"
                                ? "🛒"
                                : "💊"}
                        </span>
                        <div className="flex flex-col gap-1 items-end">
                          <Badge
                            className={`text-[9px] px-1.5 py-0 font-semibold ${
                              vendor.status === VendorStatus.open
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-red-100 text-red-600 border-red-200"
                            }`}
                          >
                            {vendor.status === VendorStatus.open
                              ? "Open"
                              : "Closed"}
                          </Badge>
                          {vendor.isEcoDelivery && (
                            <Badge className="text-[9px] px-1.5 py-0 bg-green-600 text-white border-0">
                              🌿 E-Delivery
                            </Badge>
                          )}
                        </div>
                      </div>
                      <h3 className="font-semibold text-xs leading-tight line-clamp-2">
                        {vendor.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                        {vendor.description}
                      </p>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* Namma Pro-Tips */}
      <section className="px-4 pt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h2 className="font-display text-base font-bold text-amber-900 mb-2">
            💡 Namma Pro-Tips
          </h2>
          <p className="text-xs text-amber-700 mb-3">
            Get the best experience ordering in Nayakanahatti
          </p>
          <Accordion type="multiple" className="space-y-1">
            {PRO_TIPS.map((tip) => (
              <AccordionItem
                key={tip.id}
                value={tip.id}
                className="border border-amber-200 rounded-lg bg-white/60 px-3"
              >
                <AccordionTrigger className="text-xs font-semibold text-amber-900 py-2 hover:no-underline">
                  {tip.title}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-amber-800 pb-2">
                  {tip.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <footer className="px-4 pt-6 pb-2 text-center">
        <p className="text-[10px] text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
