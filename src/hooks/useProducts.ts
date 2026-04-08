import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useProducts() {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("name")
        .order("name");
      if (error) throw error;
      return data.map((p: { name: string }) => p.name);
    },
  });

  const addProduct = async (name: string): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (products.includes(trimmed)) return true;

    const { error } = await supabase
      .from("products")
      .insert({ name: trimmed });

    if (error) {
      if (error.code === "23505") {
        // duplicate – already exists, just refresh
        queryClient.invalidateQueries({ queryKey: ["products"] });
        return true;
      }
      toast.error("Failed to add product", { description: error.message });
      return false;
    }

    queryClient.invalidateQueries({ queryKey: ["products"] });
    toast.success(`Product "${trimmed}" added to catalog`);
    return true;
  };

  return { products, isLoading, addProduct };
}
