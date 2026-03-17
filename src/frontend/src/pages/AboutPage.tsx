import { MapPin, MessageCircle, Phone } from "lucide-react";
import { motion } from "motion/react";

export default function AboutPage() {
  return (
    <div className="pb-24">
      <div className="sticky top-[57px] z-30 bg-card border-b border-border px-4 py-3">
        <h1 className="font-display font-bold text-lg">🛕 About Us</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-100 to-amber-50 border border-amber-200 rounded-2xl p-4 text-center"
        >
          <div className="text-4xl mb-2">🛕</div>
          <h2 className="font-display text-xl font-bold text-amber-900">
            Namma Nayakanahatti
          </h2>
          <p className="text-xs text-amber-700 mt-1 font-medium">
            Your Digital Bridge to Temple Offerings &amp; Daily Needs
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <h3 className="font-display font-bold text-sm mb-2">Our Mission</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We bridge the gap between Nayakanahatti's local heritage and modern
            convenience. Whether you are a devotee visiting the Sri Thipperudra
            Swamy Temple or a resident at home, we ensure that what you need is
            just a few taps away.
          </p>
        </motion.div>

        {/* What We Offer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <h3 className="font-display font-bold text-sm mb-3">
            What We Deliver
          </h3>
          <div className="space-y-3">
            {[
              {
                emoji: "🛕",
                title: "Temple Essentials",
                desc: "Authentic puja kits and sacred offerings (copra, flowers) delivered to your location or rest house.",
              },
              {
                emoji: "🍲",
                title: "Namma Ooru Flavors",
                desc: "Fresh, hot vegetarian meals from your favorite local restaurants delivered in minutes.",
              },
              {
                emoji: "🛒",
                title: "Daily Needs",
                desc: "Fresh groceries, milk, and household staples from the most trusted local kirana stores.",
              },
              {
                emoji: "💊",
                title: "Health & Wellness",
                desc: "Emergency medicines and personal care items from local pharmacies when you need them most.",
              },
            ].map((item) => (
              <div key={item.emoji} className="flex gap-3">
                <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                <div>
                  <p className="text-xs font-semibold">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <h3 className="font-display font-bold text-sm mb-3">
            Why Choose Us?
          </h3>
          <div className="space-y-2">
            {[
              {
                icon: "⚡",
                title: "Hyperlocal Expertise",
                desc: "We focus exclusively on Nayakanahatti — faster than any national chain.",
              },
              {
                icon: "📍",
                title: "Real-Time Transparency",
                desc: "Track your order from pickup to your door with live GPS tracking.",
              },
              {
                icon: "🤝",
                title: "Support Local",
                desc: "Every order helps small business owners and creates jobs for local youth.",
              },
            ].map((item) => (
              <div key={item.icon} className="flex gap-3 items-start">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <p className="text-xs font-semibold">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-orange-50 to-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <h3 className="font-display font-bold text-sm mb-3">Contact Us</h3>
          <div className="space-y-3">
            <a
              href="tel:7483314430"
              className="flex items-center gap-3 hover:text-primary transition-colors"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Phone size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Phone</p>
                <p className="text-xs font-bold">7483314430</p>
              </div>
            </a>
            <a
              href="https://wa.me/917483314430"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-green-600 transition-colors"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle size={14} className="text-green-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">WhatsApp</p>
                <p className="text-xs font-bold">7483314430</p>
              </div>
            </a>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <MapPin size={14} className="text-amber-700" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Location</p>
                <p className="text-xs font-bold">
                  Heart of Nayakanahatti, Chitradurga
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center py-2">
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
        </div>
      </div>
    </div>
  );
}
