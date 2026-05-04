import { createStyle } from "@/app/actions/dashboard";
import { queryKeys } from "@/lib/query-keys";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type Args = Parameters<typeof createStyle>[0];
type Data = Awaited<ReturnType<typeof createStyle>>;
type Options = UseMutationOptions<Data, unknown, Args>;

const useCreateStyle = (options?: Options) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options ?? {};

  return useMutation({
    mutationFn: (vars) => createStyle(vars),
    async onSuccess(data, variables, context, mutation) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.styles.all(),
      });
      toast.success("Estilo creado correctamente.");
      onSuccess?.(data, variables, context, mutation);
    },
    onError(error, variables, context, mutation) {
      toast.error("No se pudo crear el estilo.");
      onError?.(error, variables, context, mutation);
    },
    ...rest,
  });
};

export { useCreateStyle };
