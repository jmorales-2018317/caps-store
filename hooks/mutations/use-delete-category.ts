import { deleteCategory } from "@/app/actions/dashboard";
import { queryKeys } from "@/lib/query-keys";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type Args = string;
type Data = Awaited<ReturnType<typeof deleteCategory>>;
type Options = UseMutationOptions<Data, unknown, Args>;

const useDeleteCategory = (options?: Options) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options ?? {};

  return useMutation({
    mutationFn: (id) => deleteCategory(id),
    async onSuccess(data, variables, context, mutation) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all(),
      });
      toast.success("Categoría eliminada correctamente.");
      onSuccess?.(data, variables, context, mutation);
    },
    onError(error, variables, context, mutation) {
      toast.error("No se pudo eliminar la categoría.");
      onError?.(error, variables, context, mutation);
    },
    ...rest,
  });
};

export { useDeleteCategory };
