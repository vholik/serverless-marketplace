"use client";

import { api } from "~/trpc/react";

export function CreateProductButton() {
  const createProduct = api.product.create.useMutation();

  const handleCreateProduct = async () => {
    const product = await createProduct.mutateAsync({
      title: "Test Product 2",
      metadata: {
        test: "test",
      },
      depth: 10,
      height: 10,
      width: 10,
      weight: 10,
      description: "Test Description",
      slug: "test-product-2",
      status: "published",
      images: ["https://via.placeholder.com/150"],
      variants: [
        {
          title: "Test Variant",
          description: "Test Variant Description",
          options: {
            Color: "Red",
          },
        },
      ],
      options: [
        {
          name: "Color",
          values: ["Red", "Blue"],
        },
      ],
    });

    console.log(product);
  };

  return (
    <button
      onClick={handleCreateProduct}
      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
    >
      Create Test Product
    </button>
  );
}
