import { updateProfile } from "@/app/actions/dashboard";
import { queryKeys } from "@/lib/query-keys";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type Args = Parameters<typeof updateProfile>[0];
type Data = Awaited<ReturnType<typeof updateProfile>>;
type Options = UseMutationOptions<Data, unknown, Args>;

const useUpdateProfile = (options?: Options) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options ?? {};

  return useMutation({
    mutationFn: (vars) => updateProfile(vars),
    async onSuccess(data, variables, context, mutation) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.profiles.all(),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.profiles.current(),
      });
      toast.success("Perfil actualizado correctamente.");
      onSuccess?.(data, variables, context, mutation);
    },
    onError(error, variables, context, mutation) {
      toast.error("No se pudo actualizar el perfil.");
      onError?.(error, variables, context, mutation);
    },
    ...rest,
  });
};

export { useUpdateProfile };
