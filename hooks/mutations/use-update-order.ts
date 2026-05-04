import { updateOrder } from "@/app/actions/dashboard";
import { queryKeys } from "@/lib/query-keys";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type Args = Parameters<typeof updateOrder>[0];
type Data = Awaited<ReturnType<typeof updateOrder>>;
type Options = UseMutationOptions<Data, unknown, Args>;

const useUpdateOrder = (options?: Options) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options ?? {};

  return useMutation({
    mutationFn: (vars) => updateOrder(vars),
    async onSuccess(data, variables, context, mutation) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all(),
      });
      toast.success("Pedido actualizado correctamente.");
      onSuccess?.(data, variables, context, mutation);
    },
    onError(error, variables, context, mutation) {
      toast.error("No se pudo actualizar el pedido.");
      onError?.(error, variables, context, mutation);
    },
    ...rest,
  });
};

export { useUpdateOrder };
