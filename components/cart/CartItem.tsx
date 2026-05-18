"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Package, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { cn, formatPriceDecimal } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQty } = useCart();
  const { product, quantity, selectedColor, selectedSize } = item;
  const [isRemoving, setIsRemoving] = useState(false);

  const linePrice = product.price * quantity;
  const hasDiscount =
    product.originalPrice != null && product.originalPrice > product.price;

  const handleRemove = () => {
    setIsRemoving(true);
    window.setTimeout(() => {
      removeItem(product.id, selectedColor.name, selectedSize);
      setIsRemoving(false);
    }, 300);
  };

  return (
    <Card
      className={cn("gap-0 overflow-hidden border-border py-0 transition-opacity duration-300", {
        "opacity-50": isRemoving,
      })}
    >
      <div className="flex flex-col sm:flex-row">
        <Link
          href={`/products/${product.id}`}
          className="relative h-36 w-full shrink-0 sm:w-40"
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, 160px"
          />
        </Link>

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">
                {product.hat_style.label}
              </p>
              <Link
                href={`/products/${product.id}`}
                className="text-foreground mt-0.5 block text-lg font-medium hover:text-accent transition-colors"
              >
                {product.name}
              </Link>
              <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                <span
                  className="inline-block size-3 shrink-0 rounded-full border border-border"
                  style={{ backgroundColor: selectedColor.hex }}
                  aria-hidden
                />
                <span>
                  {selectedColor.name}
                  {selectedSize ? ` • ${selectedSize}` : ""}
                </span>
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8 shrink-0 cursor-pointer"
              onClick={handleRemove}
              aria-label="Eliminar artículo"
            >
              <Trash2 />
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 cursor-pointer"
                onClick={() =>
                  updateQty(
                    product.id,
                    selectedColor.name,
                    selectedSize,
                    quantity - 1
                  )
                }
                disabled={quantity <= 1}
                aria-label="Reducir cantidad"
              >
                <Minus />
              </Button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 cursor-pointer"
                onClick={() =>
                  updateQty(
                    product.id,
                    selectedColor.name,
                    selectedSize,
                    quantity + 1
                  )
                }
                aria-label="Aumentar cantidad"
              >
                <Plus />
              </Button>
            </div>

            <div className="text-end">
              <p className="text-lg font-semibold">{formatPriceDecimal(linePrice)}</p>
              {hasDiscount && (
                <p className="text-muted-foreground text-xs line-through">
                  {formatPriceDecimal(product.originalPrice! * quantity)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <CardFooter className="bg-muted/20 border-t border-border px-4 py-2!">
        <div className="text-muted-foreground flex items-center text-sm">
          <Package className="me-2 size-4 shrink-0" />
          <span>Entrega estimada: 3–5 días hábiles</span>
        </div>
      </CardFooter>
    </Card>
  );
}
