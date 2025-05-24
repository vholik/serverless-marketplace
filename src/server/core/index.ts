import { Pricing } from "./pricing";
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
  public pricing: Pricing;

  constructor() {
    this.pricing = new Pricing();
    this.product = new Product(this.pricing);
    this.category = new ProductCategory();
    this.material = new ProductMaterial();
    this.tag = new ProductTag();
  }
}

export const sdk = new StackOS();
