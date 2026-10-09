import { test, expect } from "@playwright/test";
import path from "node:path";
import { listen } from "node:quic";
import { before, beforeEach } from "node:test";
import { pathToFileURL } from "node:url";

// Turns the file path into a file:/// URL that works on any OS
const APP = pathToFileURL(path.resolve("app/sajilo-bazaar.html")).href;

test("shop loads six products", async ({ page }) => {
  await page.goto(APP);
  const products = page
    .getByRole("list", { name: "Products" })
    .getByRole("listitem");
  await expect(products).toHaveCount(6);
});

test("remove empties the cart", async ({ page }) => {
  await page.goto(APP);
  const products = page
    .getByRole("list", { name: "Products" })
    .getByRole("listitem");
  await products
    .filter({ hasText: "Dhaka Topi" })
    .getByRole("button", { name: "Add to cart" })
    .click();
  await expect(page.getByTestId("cart-count")).toHaveText("1");

  page.once("dialog", (dialog) => dialog.accept()); // answer the confirm with OK
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
});

// Warm up
// Add a Lokta Paper Notebook. Prove the message appeared, then disappeared.
test("verify a toast message appeared after Lokta Paper Notebook is added and then disappears", async ({
  page,
}) => {
  await page.goto(APP);

  const productName = "Lokta Paper Notebook";

  const listItem = page.getByRole("listitem").filter({ hasText: productName }); //locate list item with text "Lokta Paper Notebook"
  await listItem.getByRole("button", { name: "Add to cart" }).click();

  const toast = page.getByRole("status");
  await expect(toast).toHaveText(`${productName} added to cart`);
  await expect(toast).toBeHidden();
});

// There is only one Singing Bowl. Add it and prove nobody can add a second.
test("cannot add more singing bowls", async ({ page }) => {
  await page.goto(APP);

  const productName = "Singing Bowl";

  const listItem = page.getByRole("listitem").filter({ hasText: productName });
  await listItem.getByRole("button").click();
  await expect(listItem.getByRole("button")).toHaveText("Sold out");
});
