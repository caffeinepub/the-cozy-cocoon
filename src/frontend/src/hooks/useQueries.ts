import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product, ProductInput, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

export function useGetStockProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["stock-products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStockProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSoldProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["sold-products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSoldProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["all-products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductInput) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addProduct(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stock-products"] });
      qc.invalidateQueries({ queryKey: ["sold-products"] });
      qc.invalidateQueries({ queryKey: ["all-products"] });
    },
  });
}

export function useToggleProductStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.toggleProductStatus(productId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stock-products"] });
      qc.invalidateQueries({ queryKey: ["sold-products"] });
      qc.invalidateQueries({ queryKey: ["all-products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteProduct(productId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stock-products"] });
      qc.invalidateQueries({ queryKey: ["sold-products"] });
      qc.invalidateQueries({ queryKey: ["all-products"] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}
