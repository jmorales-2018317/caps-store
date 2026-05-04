"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQty } = useCart();
  const { product, quantity, selectedColor, selectedSize } = item;

  return (
    <div className="flex gap-4 py-6 border-b border-border">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="shrink-0">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-surface overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="96px"
          />
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-0.5">
              {product.hat_style.label}
            </p>
            <Link
              href={`/products/${product.id}`}
              className="text-sm font-bold text-text hover:text-accent transition-colors leading-tight block"
            >
              {product.name}
            </Link>
          </div>
          <button
            onClick={() =>
              removeItem(product.id, selectedColor.name, selectedSize)
            }
            className="text-faint hover:text-accent transition-colors shrink-0 mt-0.5"
            aria-label="Eliminar artículo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Variant info */}
        <div className="flex items-center gap-3 mt-2 mb-4">
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full border border-border"
              style={{ backgroundColor: selectedColor.hex }}
            />
            <span className="text-[11px] text-muted">{selectedColor.name}</span>
          </div>
          <span className="text-faint">·</span>
          <span className="text-[11px] text-muted">{selectedSize}</span>
        </div>

        {/* Qty + price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-border">
            <button
              onClick={() =>
                updateQty(product.id, selectedColor.name, selectedSize, quantity - 1)
              }
              className="w-8 h-8 flex items-center justify-center text-muted hover:text-text transition-colors"
              aria-label="Reducir cantidad"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-text">
              {quantity}
            </span>
            <button
              onClick={() =>
                updateQty(product.id, selectedColor.name, selectedSize, quantity + 1)
              }
              className="w-8 h-8 flex items-center justify-center text-muted hover:text-text transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span className="text-sm font-bold text-text">
            {formatPrice(product.price * quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
