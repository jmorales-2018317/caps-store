import { deleteStyle } from "@/app/actions/dashboard";
import { queryKeys } from "@/lib/query-keys";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type Args = string;
type Data = Awaited<ReturnType<typeof deleteStyle>>;
type Options = UseMutationOptions<Data, unknown, Args>;

const useDeleteStyle = (options?: Options) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options ?? {};

  return useMutation({
    mutationFn: (id) => deleteStyle(id),
    async onSuccess(data, variables, context, mutation) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.styles.all(),
      });
      toast.success("Estilo eliminado correctamente.");
      onSuccess?.(data, variables, context, mutation);
    },
    onError(error, variables, context, mutation) {
      toast.error("No se pudo eliminar el estilo.");
      onError?.(error, variables, context, mutation);
    },
    ...rest,
  });
};

export { useDeleteStyle };
