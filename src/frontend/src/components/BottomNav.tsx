import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, Home, Shield, ShoppingCart, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useActor } from "../hooks/useActor";

export function BottomNav() {
  const { itemCount } = useCart();
  const router = useRouterState();
  const path = router.location.pathname;
  const { actor, isFetching } = useActor();

  const { data: isAdmin } = useQuery({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });

  const links = [
    { to: "/", icon: Home, label: "Home", ocid: "nav.home.link" },
    {
      to: "/cart",
      icon: ShoppingCart,
      label: "Cart",
      ocid: "nav.cart.link",
      badge: itemCount,
    },
    {
      to: "/orders",
      icon: ClipboardList,
      label: "Orders",
      ocid: "nav.orders.link",
    },
    { to: "/profile", icon: User, label: "Profile", ocid: "nav.profile.link" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
      <div className="flex max-w-md mx-auto">
        {links.map(({ to, icon: Icon, label, ocid, badge }) => {
          const isActive = path === to || (to !== "/" && path.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              data-ocid={ocid}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 relative transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/admin"
            data-ocid="nav.admin.link"
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 relative transition-colors ${
              path === "/admin" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Shield size={22} strokeWidth={path === "/admin" ? 2.5 : 1.8} />
            <span
              className={`text-[10px] font-medium ${path === "/admin" ? "font-semibold" : ""}`}
            >
              Admin
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
