import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Order,
  OrderItem,
  UserProfile,
  VendorCategory,
} from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useAllVendors() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVendors();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVendorsByCategory(category: VendorCategory | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["vendors", category],
    queryFn: async () => {
      if (!actor) return [];
      if (!category) return actor.getAllVendors();
      return actor.getVendorsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVendor(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["vendor", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getVendor(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useProductsByVendor(vendorId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products", vendorId?.toString()],
    queryFn: async () => {
      if (!actor || vendorId === null) return [];
      return actor.getProductsByVendor(vendorId);
    },
    enabled: !!actor && !isFetching && vendorId !== null,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["profile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useMyOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["orders", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getOrdersByCustomer(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useOrderItems(orderId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["orderItems", orderId?.toString()],
    queryFn: async () => {
      if (!actor || orderId === null) return [];
      return actor.getOrderItems(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== null,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      order,
      items,
    }: { order: Order; items: OrderItem[] }) => {
      if (!actor) throw new Error("No actor");
      return actor.createOrder(order, items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
