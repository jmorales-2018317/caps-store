"use server";

import { createClient } from "@/lib/supabase/server";
import type { CartItem } from "@/types";

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  /** Recoger en tienda o envío a domicilio */
  fulfillment: "pickup" | "delivery";
  subtotal: number;
  shippingCost: number;
  total: number;
}

export interface CreateOrderResult {
  orderId: string;
  error?: string;
}

export async function createOrder(
  formData: CheckoutFormData,
  cartItems: CartItem[]
): Promise<CreateOrderResult> {
  if (cartItems.length === 0) {
    return { orderId: "", error: "El carrito está vacío" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      orderId: "",
      error: "Tu sesión expiró o no estás identificado. Vuelve a iniciar sesión y prueba de nuevo.",
    };
  }

  const isPickup = formData.fulfillment === "pickup";
  const addressLine = isPickup
    ? "Recoger en tienda"
    : [formData.address, formData.address2].filter(Boolean).join(", ");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      contact_name: `${formData.firstName} ${formData.lastName}`.trim(),
      contact_email: formData.email,
      contact_phone: formData.phone || null,
      address: addressLine,
      city: isPickup ? "—" : formData.city,
      state: isPickup ? "—" : formData.state,
      shipping_method: formData.fulfillment,
      subtotal: formData.subtotal,
      shipping_cost: formData.shippingCost,
      total: formData.total,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Error creating order:", orderError);
    return { orderId: "", error: "No se pudo crear el pedido. Intenta de nuevo." };
  }

  const orderItemsPayload = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    product_name: item.product.name,
    color_name: item.selectedColor.name,
    color_hex: item.selectedColor.hex,
    size: item.selectedSize,
    quantity: item.quantity,
    unit_price: item.product.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsPayload);

  if (itemsError) {
    console.error("Error creating order items:", itemsError);
    return { orderId: "", error: "Error al guardar los productos del pedido." };
  }

  return { orderId: order.id as string };
}
