import { updateCategory } from "@/app/actions/dashboard";
import { queryKeys } from "@/lib/query-keys";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type Args = Parameters<typeof updateCategory>[0];
type Data = Awaited<ReturnType<typeof updateCategory>>;
type Options = UseMutationOptions<Data, unknown, Args>;

const useUpdateCategory = (options?: Options) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options ?? {};

  return useMutation({
    mutationFn: (vars) => updateCategory(vars),
    async onSuccess(data, variables, context, mutation) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all(),
      });
      toast.success("Categoría actualizada correctamente.");
      onSuccess?.(data, variables, context, mutation);
    },
    onError(error, variables, context, mutation) {
      toast.error("No se pudo actualizar la categoría.");
      onError?.(error, variables, context, mutation);
    },
    ...rest,
  });
};

export { useUpdateCategory };
