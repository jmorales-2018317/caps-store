"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Check,
  Truck,
  Store,
  CircleCheck,
  Loader2,
  User,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

type Step = "shipping" | "account" | "confirm";

const STEP_ORDER: Step[] = ["shipping", "account", "confirm"];

const labelClass =
  "block text-[11px] font-bold uppercase tracking-widest text-muted mb-1.5";

const CHECKOUT_ACCOUNT_QUERY = "/checkout?step=account";

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
  const searchParams = useSearchParams();
  const { items, cartTotal, clearCart, isLoading: cartLoading } = useCart();
  const { data: user, isPending: userLoading } = useCurrentUser();
  const { data: profile, isPending: profileLoading } = useCurrentProfile();

  const loginHref = `/login?redirect=${encodeURIComponent(CHECKOUT_ACCOUNT_QUERY)}`;
  const signupHref = `/signup?redirect=${encodeURIComponent(CHECKOUT_ACCOUNT_QUERY)}`;

  const stepFromUrl = searchParams.get("step") as Step | null;
  const initialStep =
    stepFromUrl && STEP_ORDER.includes(stepFromUrl) ? stepFromUrl : "shipping";

  const [step, setStepState] = useState<Step>(initialStep);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    const s = searchParams.get("step") as Step | null;
    if (s && STEP_ORDER.includes(s)) setStepState(s);
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
  const currentIdx = STEP_ORDER.indexOf(step);

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

  function goToAccount() {
    const err = validateShipping();
    if (err) {
      setSubmitError(err);
      return;
    }
    setSubmitError(null);
    setStep("account");
  }

  function goToConfirm() {
    const err = validateAccount();
    if (err) {
      setSubmitError(err);
      return;
    }
    setSubmitError(null);
    setStep("confirm");
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
      setStep("account");
      setSubmitting(false);
      return;
    }

    if (!contactParts) {
      setSubmitError("No se pudieron leer los datos de tu perfil.");
      setStep("account");
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
    setPlacedOrderId(result.orderId);
    setSubmitting(false);
  }

  if (placedOrderId) {
    const shortId = placedOrderId.slice(0, 8).toUpperCase();
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center">
        <div className="w-16 h-16 bg-accent flex items-center justify-center mx-auto mb-8">
          <Check className="w-8 h-8 text-bg" />
        </div>
        <h1 className="font-black uppercase text-3xl tracking-tighter text-text mb-4">
          ¡Pedido confirmado!
        </h1>
        <p className="text-sm text-muted mb-10 leading-relaxed">
          Gracias por tu compra. Hemos recibido tu pedido y lo estamos
          preparando. Recibirás un correo de confirmación en breve.
        </p>
        <p className="text-[11px] uppercase tracking-widest text-faint mb-8">
          Pedido #{shortId}
        </p>
        <Button size="lg" asChild>
          <Link href="/products">Seguir comprando</Link>
        </Button>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex items-center gap-3 text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Cargando tu carrito…</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex flex-col items-center gap-3 text-muted">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm">Volviendo al carrito…</span>
        </div>
      </div>
    );
  }

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: "shipping", label: "Envío", icon: <Truck className="w-3 h-3" /> },
    { id: "account", label: "Tu cuenta", icon: <User className="w-3 h-3" /> },
    {
      id: "confirm",
      label: "Confirmación",
      icon: <CircleCheck className="w-3 h-3" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted hover:text-text transition-colors mb-10"
      >
        <ArrowLeft className="w-3 h-3" />
        Volver al carrito
      </Link>

      <div className="mb-10">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-accent mb-1">
          Checkout
        </p>
        <h1 className="font-black uppercase text-4xl sm:text-5xl tracking-tighter text-text leading-none">
          Finalizar compra
        </h1>
      </div>

      <div className="flex items-center gap-0 mb-12 max-w-md">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              type="button"
              onClick={() =>
                STEP_ORDER.indexOf(s.id) <= currentIdx && setStep(s.id)
              }
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${step === s.id
                ? "text-text"
                : STEP_ORDER.indexOf(s.id) < currentIdx
                  ? "text-accent"
                  : "text-faint"
                }`}
            >
              <div
                className={`w-6 h-6 flex items-center justify-center border ${step === s.id
                  ? "border-text bg-text text-bg"
                  : STEP_ORDER.indexOf(s.id) < currentIdx
                    ? "border-accent bg-accent text-bg"
                    : "border-faint"
                  }`}
              >
                {STEP_ORDER.indexOf(s.id) < currentIdx ? (
                  <Check className="w-3 h-3" />
                ) : (
                  s.icon
                )}
              </div>
              <span className="hidden sm:block">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-px mx-2 ${STEP_ORDER.indexOf(s.id) < currentIdx
                  ? "bg-accent"
                  : "bg-border"
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <form onSubmit={handlePlaceOrder} noValidate>
            {step === "shipping" && (
              <div className="space-y-5">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text mb-6 pb-3 border-b border-border">
                  Entrega
                </h2>
                {submitError && (
                  <p
                    className="text-sm text-red-500 border border-red-500/30 bg-red-500/10 px-4 py-3"
                    role="alert"
                  >
                    {submitError}
                  </p>
                )}

                <fieldset className="space-y-3 border-0 p-0 m-0">
                  <legend className={`${labelClass} mb-3`}>
                    ¿Cómo recibes tu pedido?
                  </legend>
                  <div className="space-y-2">
                    <label
                      className={cn(
                        "flex items-center justify-between p-4 border border-border cursor-pointer hover:border-muted transition-colors",
                        shipping.fulfillment === "pickup" && "border-text"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="fulfillment"
                          value="pickup"
                          checked={shipping.fulfillment === "pickup"}
                          onChange={() =>
                            setShipping((s) => ({
                              ...s,
                              fulfillment: "pickup",
                            }))
                          }
                          className="accent-accent"
                        />
                        <Store className="w-4 h-4 text-muted shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-text">
                            Recoger en tienda
                          </p>
                          <p className="text-[11px] text-muted">
                            Sin datos de domicilio · Sin costo de envío
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-text">
                        {formatPrice(0)}
                      </span>
                    </label>
                    <label
                      className={cn(
                        "flex items-center justify-between p-4 border border-border cursor-pointer hover:border-muted transition-colors",
                        shipping.fulfillment === "delivery" && "border-text"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="fulfillment"
                          value="delivery"
                          checked={shipping.fulfillment === "delivery"}
                          onChange={() =>
                            setShipping((s) => ({
                              ...s,
                              fulfillment: "delivery",
                            }))
                          }
                          className="accent-accent"
                        />
                        <Truck className="w-4 h-4 text-muted shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-text">
                            Envío a domicilio
                          </p>
                          <p className="text-[11px] text-muted">
                            Entrega en tu dirección
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-text">
                        {formatPriceDecimal(CHECKOUT_SHIPPING_FEE_GTQ)}
                      </span>
                    </label>
                  </div>
                </fieldset>

                {shipping.fulfillment === "delivery" && (
                  <div className="space-y-5 pt-2 border-t border-border">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text pt-2">
                      Dirección de envío
                    </h3>
                    <div>
                      <label htmlFor="shipping-address" className={labelClass}>
                        Dirección línea 1
                      </label>
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
                        required={shipping.fulfillment === "delivery"}
                        aria-required={
                          shipping.fulfillment === "delivery" || undefined
                        }
                      />
                    </div>
                    <div>
                      <label htmlFor="shipping-address2" className={labelClass}>
                        Dirección línea 2{" "}
                        <span className="font-normal normal-case tracking-normal text-faint">
                          (opcional)
                        </span>
                      </label>
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
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="shipping-city" className={labelClass}>
                          Ciudad
                        </label>
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
                          required={shipping.fulfillment === "delivery"}
                          aria-required={
                            shipping.fulfillment === "delivery" || undefined
                          }
                        />
                      </div>
                      <div>
                        <label htmlFor="shipping-state" className={labelClass}>
                          Departamento / municipio
                        </label>
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
                          required={shipping.fulfillment === "delivery"}
                          aria-required={
                            shipping.fulfillment === "delivery" || undefined
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="shipping-postalCode"
                          className={labelClass}
                        >
                          Código postal
                        </label>
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
                          required={shipping.fulfillment === "delivery"}
                          aria-required={
                            shipping.fulfillment === "delivery" || undefined
                          }
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="shipping-country"
                          className={labelClass}
                        >
                          País
                        </label>
                        <select
                          id="shipping-country"
                          name="country"
                          autoComplete="country-name"
                          value={shipping.country}
                          onChange={(e) =>
                            setShipping((s) => ({
                              ...s,
                              country: e.target.value,
                            }))
                          }
                          className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                        >
                          <option>Guatemala</option>
                          <option>México</option>
                          <option>Estados Unidos</option>
                          <option>Colombia</option>
                          <option>Argentina</option>
                          <option>España</option>
                          <option>Chile</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button type="button" size="lg" onClick={goToAccount}>
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {step === "account" && (
              <div className="space-y-5">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text mb-6 pb-3 border-b border-border">
                  Tu cuenta
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  Usamos el nombre y el correo de tu perfil para el pedido. Solo
                  necesitamos un teléfono de contacto.
                </p>

                {submitError && (
                  <p
                    className="text-sm text-red-500 border border-red-500/30 bg-red-500/10 px-4 py-3"
                    role="alert"
                  >
                    {submitError}
                  </p>
                )}

                {userLoading ? (
                  <div className="flex items-center gap-3 py-12 text-muted">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Comprobando sesión…</span>
                  </div>
                ) : !user ? (
                  <div className="space-y-6 border border-border bg-surface-2 p-8">
                    <p className="text-sm text-text leading-relaxed">
                      Para continuar con tu pedido debes iniciar sesión. Así
                      podremos asociar la compra a tu cuenta y usar tus datos
                      de perfil.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button size="lg" asChild>
                        <Link href={loginHref}>Iniciar sesión</Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild>
                        <Link href={signupHref}>Crear cuenta</Link>
                      </Button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitError(null);
                        setStep("shipping");
                      }}
                      className="text-[11px] font-bold uppercase tracking-widest text-muted hover:text-text transition-colors"
                    >
                      ← Volver a envío
                    </button>
                  </div>
                ) : !accountReady ? (
                  <div className="flex items-center gap-3 py-12 text-muted">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Cargando tu perfil…</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 border border-border p-5 bg-surface-2">
                      <div>
                        <p className={labelClass}>Nombre (desde tu perfil)</p>
                        <p className="text-sm font-medium text-text">
                          {contactParts!.firstName} {contactParts!.lastName}
                        </p>
                      </div>
                      <div>
                        <p className={labelClass}>
                          Correo electrónico (desde tu cuenta)
                        </p>
                        <p className="text-sm font-medium text-text break-all">
                          {contactParts!.email}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="checkout-phone" className={labelClass}>
                        Teléfono de contacto
                      </label>
                      <Input
                        id="checkout-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+502 5555 0000"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        required
                        aria-required
                      />
                      <p className="text-[11px] text-muted mt-1.5">
                        Lo usamos solo para coordinar la entrega o recogida.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitError(null);
                          setStep("shipping");
                        }}
                        className="text-[11px] font-bold uppercase tracking-widest text-muted hover:text-text transition-colors"
                      >
                        ← Atrás
                      </button>
                      <Button type="button" size="lg" onClick={goToConfirm}>
                        Continuar a confirmación
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === "confirm" && (
              <div className="space-y-5">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text mb-6 pb-3 border-b border-border">
                  Confirmar pedido
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  El cobro con tarjeta u otro método se conectará aquí próximamente.
                  Al confirmar se registra tu pedido con el total indicado.
                </p>

                <div className="bg-surface-2 border border-border p-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted">Contacto</span>
                    <span className="font-bold text-text text-right">
                      {contactParts?.firstName} {contactParts?.lastName}
                      <br />
                      <span className="font-normal text-muted text-xs">
                        {contactParts?.email}
                      </span>
                      <br />
                      <span className="font-normal text-muted text-xs">
                        {contactPhone}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 pt-2 border-t border-border">
                    <span className="text-muted">Entrega</span>
                    <span className="font-bold text-text text-right">
                      {shipping.fulfillment === "pickup" ? (
                        "Recoger en tienda"
                      ) : (
                        <>
                          Envío a domicilio
                          <br />
                          <span className="font-normal text-muted text-xs">
                            {shipping.address}
                            {shipping.address2
                              ? `, ${shipping.address2}`
                              : ""}
                            <br />
                            {shipping.city}, {shipping.state}{" "}
                            {shipping.postalCode}
                            <br />
                            {shipping.country}
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {submitError && (
                  <p
                    className="text-sm text-red-500 border border-red-500/30 bg-red-500/10 px-4 py-3"
                    role="alert"
                  >
                    {submitError}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitError(null);
                      setStep("account");
                    }}
                    className="text-[11px] font-bold uppercase tracking-widest text-muted hover:text-text transition-colors"
                  >
                    ← Atrás
                  </button>
                  <Button type="submit" size="lg" disabled={submitting}>
                    <Lock className="w-3.5 h-3.5" />
                    {submitting
                      ? "Creando pedido..."
                      : `Confirmar pago · ${formatPriceDecimal(total)}`}
                  </Button>
                </div>

                <p className="flex items-center gap-2 text-[11px] text-muted pt-2">
                  <Lock className="w-3 h-3 text-faint shrink-0" />
                  Tus datos se usan solo para procesar este pedido.
                </p>
              </div>
            )}
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-surface border border-border p-6 sticky top-24">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text mb-6">
              Tu pedido
            </h2>

            <div className="space-y-4 mb-6 max-h-72 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedColor.name}-${item.selectedSize}`}
                  className="flex gap-3"
                >
                  <div className="relative w-14 h-14 bg-surface-2 shrink-0 overflow-hidden">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-bg text-[9px] font-black flex items-center justify-center rounded-full">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text leading-tight truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[10px] text-muted mt-0.5">
                      {item.selectedColor.name} · {item.selectedSize}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-text shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Subtotal</span>
                <span className="text-sm font-bold text-text">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">
                  {shipping.fulfillment === "pickup"
                    ? "Envío (recogida)"
                    : "Envío a domicilio"}
                </span>
                <span className="text-sm font-bold text-text">
                  {shippingCost === 0 ? (
                    <span className="text-green-600 dark:text-green-500">
                      {formatPrice(0)}
                    </span>
                  ) : (
                    formatPriceDecimal(shippingCost)
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs font-black uppercase tracking-widest text-text">
                  Total
                </span>
                <span className="text-xl font-black text-text">
                  {formatPriceDecimal(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      <div className="flex items-center gap-3 text-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Cargando checkout…</span>
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
