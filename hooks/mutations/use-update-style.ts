import { updateStyle } from "@/app/actions/dashboard";
import { queryKeys } from "@/lib/query-keys";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type Args = Parameters<typeof updateStyle>[0];
type Data = Awaited<ReturnType<typeof updateStyle>>;
type Options = UseMutationOptions<Data, unknown, Args>;

const useUpdateStyle = (options?: Options) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options ?? {};

  return useMutation({
    mutationFn: (vars) => updateStyle(vars),
    async onSuccess(data, variables, context, mutation) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.styles.all(),
      });
      toast.success("Estilo actualizado correctamente.");
      onSuccess?.(data, variables, context, mutation);
    },
    onError(error, variables, context, mutation) {
      toast.error("No se pudo actualizar el estilo.");
      onError?.(error, variables, context, mutation);
    },
    ...rest,
  });
};

export { useUpdateStyle };
