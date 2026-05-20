"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Truck,
  Store,
  Loader2,
  Shield,
  Gift,
  CreditCard,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createOrder } from "./actions";
import type { CheckoutFormData } from "./actions";
import {
  cn,
  formatPrice,
  formatPriceDecimal,
  CHECKOUT_SHIPPING_FEE_GTQ,
} from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import type { Profile } from "@/types";
import { queryKeys } from "@/lib/query-keys";

type Step = "contact" | "shipping";

const STEP_ORDER: Step[] = ["contact", "shipping"];
const STEP_NUMBER: Record<Step, number> = {
  contact: 1,
  shipping: 2,
};

/** Compatibilidad con URLs antiguas (?step=account | confirm) */
function normalizeCheckoutStepParam(raw: string | null): Step {
  if (raw === "shipping") return "shipping";
  if (raw === "contact") return "contact";
  if (raw === "account" || raw === "confirm") return "contact";
  return "contact";
}

const CHECKOUT_CONTACT_QUERY = "/checkout?step=contact";

function contactFromUserAndProfile(
  user: SupabaseUser | null | undefined,
  profile: Profile | null | undefined
): { firstName: string; lastName: string; email: string } | null {
  if (!user) return null;
  const email = user.email ?? profile?.email ?? "";
  const raw = profile?.full_name?.trim();
  if (raw) {
    const parts = raw.split(/\s+/);
    if (parts.length === 1) return { firstName: parts[0]!, lastName: "", email };
    return {
      firstName: parts[0]!,
      lastName: parts.slice(1).join(" "),
      email,
    };
  }
  const local = email.split("@")[0] ?? "Cliente";
  return { firstName: local, lastName: "", email };
}

function CheckoutFlow() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { items, cartTotal, clearCart, isLoading: cartLoading } = useCart();
  const { data: user, isPending: userLoading } = useCurrentUser();
  const { data: profile, isPending: profileLoading } = useCurrentProfile();

  const loginHref = `/login?redirect=${encodeURIComponent(CHECKOUT_CONTACT_QUERY)}`;
  const signupHref = `/signup?redirect=${encodeURIComponent(CHECKOUT_CONTACT_QUERY)}`;

  const stepFromUrl = normalizeCheckoutStepParam(searchParams.get("step"));
  const initialStep = STEP_ORDER.includes(stepFromUrl) ? stepFromUrl : "contact";

  const [step, setStepState] = useState<Step>(initialStep);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    const s = normalizeCheckoutStepParam(searchParams.get("step"));
    if (STEP_ORDER.includes(s)) setStepState(s);
  }, [searchParams]);

  useEffect(() => {
    if (placedOrderId) return;
    if (cartLoading) return;
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [placedOrderId, cartLoading, items.length, router]);

  const setStep = useCallback(
    (next: Step) => {
      setStepState(next);
      router.replace(`/checkout?step=${next}`, { scroll: false });
    },
    [router]
  );

  const [shipping, setShipping] = useState({
    fulfillment: "delivery" as "pickup" | "delivery",
    address: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Guatemala",
  });

  const shippingCost =
    shipping.fulfillment === "pickup" ? 0 : CHECKOUT_SHIPPING_FEE_GTQ;
  const total = cartTotal + shippingCost;
  const currentStepNumber = STEP_NUMBER[step];

  const contactParts = useMemo(
    () => contactFromUserAndProfile(user ?? undefined, profile ?? undefined),
    [user, profile]
  );

  const accountReady =
    !!user &&
    !profileLoading &&
    contactParts != null &&
    contactParts.email.length > 0;

  function validateShipping(): string | null {
    if (shipping.fulfillment === "pickup") return null;
    if (!shipping.address.trim()) return "Indica la dirección de envío.";
    if (!shipping.city.trim()) return "Indica la ciudad.";
    if (!shipping.state.trim()) return "Indica el departamento o municipio.";
    if (!shipping.postalCode.trim()) return "Indica el código postal.";
    return null;
  }

  function validateAccount(): string | null {
    if (!user) return "Debes iniciar sesión para continuar.";
    if (!contactParts?.email) return "No se encontró correo en tu cuenta.";
    if (!contactPhone.trim()) return "Indica un teléfono de contacto.";
    return null;
  }

  function goToShipping() {
    const err = validateAccount();
    if (err) {
      setSubmitError(err);
      return;
    }
    setSubmitError(null);
    setStep("shipping");
  }

  function prevStep() {
    setSubmitError(null);
    if (step === "shipping") setStep("contact");
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const shipErr = validateShipping();
    if (shipErr) {
      setSubmitError(shipErr);
      setStep("shipping");
      setSubmitting(false);
      return;
    }

    const accErr = validateAccount();
    if (accErr) {
      setSubmitError(accErr);
      setStep("contact");
      setSubmitting(false);
      return;
    }

    if (!contactParts) {
      setSubmitError("No se pudieron leer los datos de tu perfil.");
      setStep("contact");
      setSubmitting(false);
      return;
    }

    const formData: CheckoutFormData = {
      firstName: contactParts.firstName,
      lastName: contactParts.lastName,
      email: contactParts.email,
      phone: contactPhone.trim(),
      ...shipping,
      subtotal: cartTotal,
      shippingCost,
      total,
    };

    const result = await createOrder(formData, items);

    if (result.error || !result.orderId) {
      setSubmitError(result.error ?? "Error desconocido");
      setSubmitting(false);
      return;
    }

    clearCart();
    void queryClient.invalidateQueries({ queryKey: queryKeys.orders.mine() });
    setPlacedOrderId(result.orderId);
    setSubmitting(false);
  }

  if (placedOrderId) {
    const shortId = placedOrderId.slice(0, 8).toUpperCase();
    return (
      <div className="bg-muted/30">
        <div className="mx-auto max-w-xl px-4 py-32 text-center">
          <div className="mx-auto mb-8 flex size-16 items-center justify-center rounded-full bg-primary">
            <Check className="size-8 text-primary-foreground" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-balance">
            ¡Pedido confirmado!
          </h1>
          <p className="mb-10 text-sm leading-relaxed text-muted-foreground">
            Gracias por tu compra. Hemos recibido tu pedido y lo estamos
            preparando. Recibirás un correo de confirmación en breve.
          </p>
          <p className="mb-8 text-xs tracking-widest text-muted-foreground uppercase">
            Pedido #{shortId}
          </p>
          <Button size="lg" asChild>
            <Link href="/products">Seguir comprando</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-24">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Cargando tu carrito…</span>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-24">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-sm">Volviendo al carrito…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/cart"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver al carrito
        </Link>

        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-balance">
            Checkout seguro
          </h1>
          <p className="text-muted-foreground">
            Completa tu compra en unos pocos pasos
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-4">
            {[1, 2].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    stepNumber <= currentStepNumber
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {stepNumber}
                </div>
                {stepNumber < 2 ? (
                  <div
                    className={cn(
                      "mx-4 h-1 w-16 rounded transition-colors",
                      stepNumber < currentStepNumber ? "bg-primary" : "bg-muted"
                    )}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-balance">
                  {step === "contact" && "Información de contacto"}
                  {step === "shipping" && "Dirección de envío"}
                </CardTitle>
                <CardDescription>
                  {step === "contact" &&
                    "Usaremos estos datos para enviarte actualizaciones del pedido"}
                  {step === "shipping" &&
                    "Indica la entrega. El siguiente paso será el pago en un proceso externo (próximamente)."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <form onSubmit={handlePlaceOrder} noValidate>
                  {submitError ? (
                    <p
                      className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                      role="alert"
                    >
                      {submitError}
                    </p>
                  ) : null}

                  {step === "contact" ? (
                    <div className="flex flex-col gap-4">
                      {userLoading ? (
                        <div className="flex items-center gap-3 py-8 text-muted-foreground">
                          <Loader2 className="size-5 animate-spin" />
                          <span className="text-sm">Comprobando sesión…</span>
                        </div>
                      ) : !user ? (
                        <div className="flex flex-col gap-6 rounded-lg border bg-muted/40 p-6">
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            Para continuar debes iniciar sesión. Asociaremos el
                            pedido a tu cuenta y usaremos tu perfil para el
                            contacto.
                          </p>
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <Button asChild>
                              <Link href={loginHref}>Iniciar sesión</Link>
                            </Button>
                            <Button variant="outline" asChild>
                              <Link href={signupHref}>Crear cuenta</Link>
                            </Button>
                          </div>
                        </div>
                      ) : !accountReady ? (
                        <div className="flex items-center gap-3 py-8 text-muted-foreground">
                          <Loader2 className="size-5 animate-spin" />
                          <span className="text-sm">Cargando tu perfil…</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="checkout-email">
                              Correo electrónico
                            </Label>
                            <Input
                              id="checkout-email"
                              type="email"
                              autoComplete="email"
                              placeholder="correo@ejemplo.com"
                              value={contactParts!.email}
                              disabled
                              className="h-9 bg-muted/50"
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="checkout-firstName">
                                Nombre
                              </Label>
                              <Input
                                id="checkout-firstName"
                                autoComplete="given-name"
                                placeholder="Juan"
                                value={contactParts!.firstName}
                                disabled
                                className="h-9 bg-muted/50"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="checkout-lastName">Apellidos</Label>
                              <Input
                                id="checkout-lastName"
                                autoComplete="family-name"
                                placeholder="Pérez"
                                value={contactParts!.lastName}
                                disabled
                                className="h-9 bg-muted/50"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Label htmlFor="checkout-phone">
                              Teléfono
                            </Label>
                            <Input
                              id="checkout-phone"
                              name="phone"
                              type="tel"
                              autoComplete="tel"
                              placeholder="+502 5555 0000"
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              className="h-9"
                              required
                              aria-required
                            />
                            <p className="text-xs text-muted-foreground">
                              Lo usamos para coordinar la entrega o la recogida.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ) : null}

                  {step === "shipping" ? (
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-4">
                        <Label className="text-sm font-medium">
                          ¿Cómo recibes tu pedido?
                        </Label>
                        <RadioGroup
                          value={shipping.fulfillment}
                          onValueChange={(value) =>
                            setShipping((s) => ({
                              ...s,
                              fulfillment: value as "pickup" | "delivery",
                            }))
                          }
                          className="flex flex-col gap-3"
                        >
                          <label
                            htmlFor="fulfillment-pickup"
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                              shipping.fulfillment === "pickup" &&
                                "border-primary bg-primary/5"
                            )}
                          >
                            <RadioGroupItem
                              value="pickup"
                              id="fulfillment-pickup"
                            />
                            <Store className="size-5 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Recoger en tienda
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Sin costo de envío
                              </p>
                            </div>
                            <span className="text-sm font-medium">
                              {formatPrice(0)}
                            </span>
                          </label>
                          <label
                            htmlFor="fulfillment-delivery"
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                              shipping.fulfillment === "delivery" &&
                                "border-primary bg-primary/5"
                            )}
                          >
                            <RadioGroupItem
                              value="delivery"
                              id="fulfillment-delivery"
                            />
                            <Truck className="size-5 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Envío a domicilio
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Entrega en tu dirección
                              </p>
                            </div>
                            <span className="text-sm font-medium">
                              {formatPriceDecimal(CHECKOUT_SHIPPING_FEE_GTQ)}
                            </span>
                          </label>
                        </RadioGroup>
                      </div>

                      {shipping.fulfillment === "delivery" ? (
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="shipping-address">
                              Dirección
                            </Label>
                            <Input
                              id="shipping-address"
                              name="address"
                              autoComplete="street-address"
                              placeholder="Calle Principal 123"
                              value={shipping.address}
                              onChange={(e) =>
                                setShipping((s) => ({
                                  ...s,
                                  address: e.target.value,
                                }))
                              }
                              className="h-9"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <Label htmlFor="shipping-address2">
                              Dirección línea 2{" "}
                              <span className="font-normal text-muted-foreground">
                                (opcional)
                              </span>
                            </Label>
                            <Input
                              id="shipping-address2"
                              name="address2"
                              autoComplete="address-line2"
                              placeholder="Depto., interior, referencia"
                              value={shipping.address2}
                              onChange={(e) =>
                                setShipping((s) => ({
                                  ...s,
                                  address2: e.target.value,
                                }))
                              }
                              className="h-9"
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="shipping-city">Ciudad</Label>
                              <Input
                                id="shipping-city"
                                name="city"
                                autoComplete="address-level2"
                                placeholder="Ciudad de Guatemala"
                                value={shipping.city}
                                onChange={(e) =>
                                  setShipping((s) => ({
                                    ...s,
                                    city: e.target.value,
                                  }))
                                }
                                className="h-9"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="shipping-state">
                                Departamento / municipio
                              </Label>
                              <Input
                                id="shipping-state"
                                name="state"
                                autoComplete="address-level1"
                                placeholder="Guatemala"
                                value={shipping.state}
                                onChange={(e) =>
                                  setShipping((s) => ({
                                    ...s,
                                    state: e.target.value,
                                  }))
                                }
                                className="h-9"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="shipping-postalCode">
                                Código postal
                              </Label>
                              <Input
                                id="shipping-postalCode"
                                name="postalCode"
                                autoComplete="postal-code"
                                placeholder="01010"
                                value={shipping.postalCode}
                                onChange={(e) =>
                                  setShipping((s) => ({
                                    ...s,
                                    postalCode: e.target.value,
                                  }))
                                }
                                className="h-9"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="shipping-country">País</Label>
                              <Select
                                value={shipping.country}
                                onValueChange={(value) =>
                                  setShipping((s) => ({ ...s, country: value }))
                                }
                              >
                                <SelectTrigger
                                  id="shipping-country"
                                  className="h-9 w-full"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                  <SelectItem value="Guatemala">
                                    Guatemala
                                  </SelectItem>
                                  <SelectItem value="México">México</SelectItem>
                                  <SelectItem value="Estados Unidos">
                                    Estados Unidos
                                  </SelectItem>
                                  <SelectItem value="Colombia">
                                    Colombia
                                  </SelectItem>
                                  <SelectItem value="Argentina">
                                    Argentina
                                  </SelectItem>
                                  <SelectItem value="España">España</SelectItem>
                                  <SelectItem value="Chile">Chile</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex justify-between pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={step === "contact"}
                      className="flex h-9 cursor-pointer items-center gap-2 px-4"
                    >
                      <ArrowLeft className="size-4" />
                      Atrás
                    </Button>

                    {step === "contact" && accountReady ? (
                      <Button
                        type="button"
                        onClick={goToShipping}
                        className="h-9 cursor-pointer px-4"
                      >
                        Continuar
                      </Button>
                    ) : null}

                    {step === "shipping" ? (
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="flex h-9 cursor-pointer items-center gap-2 px-4"
                      >
                        <CreditCard className="size-4" />
                        {submitting
                          ? "Procesando…"
                          : `Continuar al pago · ${formatPriceDecimal(total)}`}
                      </Button>
                    ) : null}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-balance">Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex max-h-72 flex-col gap-4 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedColor.name}-${item.selectedSize}`}
                      className="flex gap-4"
                    >
                      <div className="relative shrink-0">
                        <div className="relative size-16 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <Badge
                          variant="secondary"
                          className="absolute -top-2 -right-2 size-6 rounded-full p-0 text-xs font-semibold"
                        >
                          {item.quantity}
                        </Badge>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-medium">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {item.selectedColor.name} · {item.selectedSize}
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Truck className="size-3" />
                      {shipping.fulfillment === "pickup"
                        ? "Recogida en tienda"
                        : "Envío a domicilio"}
                    </span>
                    <span>
                      {shippingCost === 0
                        ? formatPrice(0)
                        : formatPriceDecimal(shippingCost)}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPriceDecimal(total)}</span>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="size-4 text-green-600" />
                    <span>Checkout seguro</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Truck className="size-4 text-blue-600" />
                    <span>Envío a domicilio o recogida en tienda</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Gift className="size-4 text-purple-600" />
                    <span>Tus datos protegidos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutFallback() {
  return (
    <div className="bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-24">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm">Cargando checkout…</span>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutFlow />
    </Suspense>
  );
}
