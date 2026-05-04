import { createDiscount } from "@/app/actions/dashboard";
import { queryKeys } from "@/lib/query-keys";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type Args = Parameters<typeof createDiscount>[0];
type Data = Awaited<ReturnType<typeof createDiscount>>;
type Options = UseMutationOptions<Data, unknown, Args>;

const useCreateDiscount = (options?: Options) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options ?? {};

  return useMutation({
    mutationFn: (vars) => createDiscount(vars),
    async onSuccess(data, variables, context, mutation) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.discounts.all(),
      });
      toast.success("Descuento creado correctamente.");
      onSuccess?.(data, variables, context, mutation);
    },
    onError(error, variables, context, mutation) {
      toast.error("No se pudo crear el descuento.");
      onError?.(error, variables, context, mutation);
    },
    ...rest,
  });
};

export { useCreateDiscount };
