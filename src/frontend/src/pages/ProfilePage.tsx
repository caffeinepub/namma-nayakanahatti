import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, LogIn, Save } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveProfile, useUserProfile } from "../hooks/useQueries";

export default function ProfilePage() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: profile, isLoading } = useUserProfile();
  const { mutateAsync: saveProfile, isPending } = useSaveProfile();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
      setAddress(profile.address);
    }
  }, [profile]);

  if (!identity) {
    return (
      <div className="px-4 py-12 text-center pb-24">
        <div className="text-5xl mb-4">👤</div>
        <h2 className="font-display font-bold text-xl mb-2">
          Login to View Profile
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Create your profile to save your address and track orders.
        </p>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          data-ocid="profile.login.button"
          className="bg-primary text-primary-foreground"
        >
          {isLoggingIn ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          <LogIn size={16} className="mr-2" />
          Login
        </Button>
      </div>
    );
  }

  async function handleSave() {
    try {
      await saveProfile({ name, phone, address });
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile.");
    }
  }

  const principal = identity.getPrincipal().toString();

  return (
    <div className="pb-24">
      <div className="sticky top-[57px] z-30 bg-card border-b border-border px-4 py-3">
        <h1 className="font-display font-bold text-lg">👤 My Profile</h1>
      </div>

      <div className="px-4 py-4">
        {/* Account info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-50 to-amber-50 border border-amber-200 rounded-2xl p-4 mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
              🙏
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{name || "Welcome, Devotee"}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {principal.slice(0, 20)}...
              </p>
              <Badge className="text-[10px] mt-1 bg-primary/10 text-primary border-primary/20">
                Customer
              </Badge>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3" data-ocid="profile.loading_state">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-10 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-semibold">
                Full Name
              </Label>
              <Input
                id="name"
                data-ocid="profile.name.input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs font-semibold">
                Phone Number
              </Label>
              <Input
                id="phone"
                data-ocid="profile.phone.input"
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="profileAddress" className="text-xs font-semibold">
                Default Address
              </Label>
              <Input
                id="profileAddress"
                data-ocid="profile.address.input"
                placeholder="Your home/hotel address in Nayakanahatti"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <Button
              data-ocid="profile.save.button"
              onClick={handleSave}
              disabled={isPending}
              className="w-full bg-primary text-primary-foreground"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Profile
                </>
              )}
            </Button>

            <Separator />

            <Button
              variant="outline"
              data-ocid="profile.logout.button"
              onClick={clear}
              className="w-full text-destructive border-destructive/30 hover:bg-red-50"
            >
              Logout
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
