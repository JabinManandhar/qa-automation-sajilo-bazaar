import { expect, Page } from "@playwright/test";

// helper function to use add to cart button for any product
export async function addToCart(page: Page, productName: string) {
  const card = page
    .getByRole("list", { name: "Products" })
    .getByRole("listitem")
    .filter({
      has: page.getByRole("heading", { name: productName, exact: true }),
    });

  await card.getByRole("button", { name: "Add to cart" }).click();
  await expect(card.getByRole("button", { name: "Adding..." })).toBeHidden();
}
