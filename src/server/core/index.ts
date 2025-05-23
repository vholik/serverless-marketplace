import {
  Product,
  ProductCategory,
  ProductMaterial,
  ProductTag,
} from "./product";

export class StackOS {
  public product: Product;
  public category: ProductCategory;
  public material: ProductMaterial;
  public tag: ProductTag;

  constructor() {
    this.product = new Product();
    this.category = new ProductCategory();
    this.material = new ProductMaterial();
    this.tag = new ProductTag();
  }
}

export const sdk = new StackOS();
