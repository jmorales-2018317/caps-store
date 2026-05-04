import { deleteDiscount } from "@/app/actions/dashboard";
import { queryKeys } from "@/lib/query-keys";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type Args = string;
type Data = Awaited<ReturnType<typeof deleteDiscount>>;
type Options = UseMutationOptions<Data, unknown, Args>;

const useDeleteDiscount = (options?: Options) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options ?? {};

  return useMutation({
    mutationFn: (id) => deleteDiscount(id),
    async onSuccess(data, variables, context, mutation) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.discounts.all(),
      });
      toast.success("Descuento eliminado correctamente.");
      onSuccess?.(data, variables, context, mutation);
    },
    onError(error, variables, context, mutation) {
      toast.error("No se pudo eliminar el descuento.");
      onError?.(error, variables, context, mutation);
    },
    ...rest,
  });
};

export { useDeleteDiscount };
