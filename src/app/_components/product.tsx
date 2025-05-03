"use client";
import { api } from "~/trpc/react";

export function Product({ product }: { product: any }) {
  const removeProduct = api.product.remove.useMutation();

  return (
    <div className="flex items-center justify-between">
      <div>{JSON.stringify(product)}</div>
      <div>
        <button
          onClick={() => removeProduct.mutate({ id: product.id })}
          className="rounded-full bg-red-50 p-2 text-red-500 transition-colors duration-200 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
          title="Remove product"
          aria-label="Remove product"
        >
          remove
        </button>
      </div>
    </div>
  );
}
