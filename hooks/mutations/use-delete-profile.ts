import { deleteProfile } from "@/app/actions/dashboard";
import { queryKeys } from "@/lib/query-keys";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type Args = string;
type Data = Awaited<ReturnType<typeof deleteProfile>>;
type Options = UseMutationOptions<Data, unknown, Args>;

const useDeleteProfile = (options?: Options) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options ?? {};

  return useMutation({
    mutationFn: (id) => deleteProfile(id),
    async onSuccess(data, variables, context, mutation) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.profiles.all(),
      });
      toast.success("Perfil eliminado correctamente.");
      onSuccess?.(data, variables, context, mutation);
    },
    onError(error, variables, context, mutation) {
      toast.error("No se pudo eliminar el perfil.");
      onError?.(error, variables, context, mutation);
    },
    ...rest,
  });
};

export { useDeleteProfile };
