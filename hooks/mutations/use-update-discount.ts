import { updateDiscount } from "@/app/actions/dashboard";
import { queryKeys } from "@/lib/query-keys";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type Args = Parameters<typeof updateDiscount>[0];
type Data = Awaited<ReturnType<typeof updateDiscount>>;
type Options = UseMutationOptions<Data, unknown, Args>;

const useUpdateDiscount = (options?: Options) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options ?? {};

  return useMutation({
    mutationFn: (vars) => updateDiscount(vars),
    async onSuccess(data, variables, context, mutation) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.discounts.all(),
      });
      toast.success("Descuento actualizado correctamente.");
      onSuccess?.(data, variables, context, mutation);
    },
    onError(error, variables, context, mutation) {
      toast.error("No se pudo actualizar el descuento.");
      onError?.(error, variables, context, mutation);
    },
    ...rest,
  });
};

export { useUpdateDiscount };
