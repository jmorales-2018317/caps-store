import { deleteOrder } from "@/app/actions/dashboard";
import { queryKeys } from "@/lib/query-keys";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type Args = string;
type Data = Awaited<ReturnType<typeof deleteOrder>>;
type Options = UseMutationOptions<Data, unknown, Args>;

const useDeleteOrder = (options?: Options) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options ?? {};

  return useMutation({
    mutationFn: (id) => deleteOrder(id),
    async onSuccess(data, variables, context, mutation) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all(),
      });
      toast.success("Pedido eliminado correctamente.");
      onSuccess?.(data, variables, context, mutation);
    },
    onError(error, variables, context, mutation) {
      toast.error("No se pudo eliminar el pedido.");
      onError?.(error, variables, context, mutation);
    },
    ...rest,
  });
};

export { useDeleteOrder };
