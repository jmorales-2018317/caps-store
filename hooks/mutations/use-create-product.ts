import { createProduct } from "@/app/actions/dashboard";
import { queryKeys } from "@/lib/query-keys";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type Args = Parameters<typeof createProduct>[0];
type Data = Awaited<ReturnType<typeof createProduct>>;
type Options = UseMutationOptions<Data, unknown, Args>;

const useCreateProduct = (options?: Options) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options ?? {};

  return useMutation({
    mutationFn: (vars) => createProduct(vars),
    async onSuccess(data, variables, context, mutation) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.products.all(),
      });
      toast.success("Producto creado correctamente.");
      onSuccess?.(data, variables, context, mutation);
    },
    onError(error, variables, context, mutation) {
      toast.error("No se pudo crear el producto.");
      onError?.(error, variables, context, mutation);
    },
    ...rest,
  });
};

export { useCreateProduct };
