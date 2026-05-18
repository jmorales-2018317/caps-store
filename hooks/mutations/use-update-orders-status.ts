import { updateOrdersStatus } from "@/app/actions/dashboard";
import { queryKeys } from "@/lib/query-keys";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type Args = Parameters<typeof updateOrdersStatus>[0];
type Data = Awaited<ReturnType<typeof updateOrdersStatus>>;
type Options = UseMutationOptions<Data, unknown, Args>;

export function useUpdateOrdersStatus(options?: Options) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options ?? {};

  return useMutation({
    mutationFn: (vars) => updateOrdersStatus(vars),
    async onSuccess(data, variables, context, mutation) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all(),
      });
      const count = variables.ids.length;
      toast.success(
        count === 1
          ? "Estado de la orden actualizado."
          : `Estado actualizado en ${count} ordenes.`
      );
      onSuccess?.(data, variables, context, mutation);
    },
    onError(error, variables, context, mutation) {
      toast.error("No se pudo actualizar el estado de las ordenes.");
      onError?.(error, variables, context, mutation);
    },
    ...rest,
  });
}
