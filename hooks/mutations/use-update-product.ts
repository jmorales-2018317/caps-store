import { updateProduct } from "@/app/actions/dashboard";
import { queryKeys } from "@/lib/query-keys";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type Args = Parameters<typeof updateProduct>[0];
type Data = Awaited<ReturnType<typeof updateProduct>>;
type Options = UseMutationOptions<Data, unknown, Args>;

const useUpdateProduct = (options?: Options) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options ?? {};

  return useMutation({
    mutationFn: (vars) => updateProduct(vars),
    async onSuccess(data, variables, context, mutation) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.products.all(),
      });
      toast.success("Producto actualizado correctamente.");
      onSuccess?.(data, variables, context, mutation);
    },
    onError(error, variables, context, mutation) {
      toast.error("No se pudo actualizar el producto.");
      onError?.(error, variables, context, mutation);
    },
    ...rest,
  });
};

export { useUpdateProduct };
