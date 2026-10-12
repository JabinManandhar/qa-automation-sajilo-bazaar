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

/*
P5: Remove, both ways
Click Remove and Cancel: the item stays. 
Click Remove and OK: the cart is empty.
 */

// LAB: Core - P5
test("P5 - Remove item: Cancel keeps item, OK removes item", async ({
  page,
}) => {
  await page.goto(APP);

  const productsList = page.getByRole("list", {
    name: "Products",
  });

  // Add Pashmina Shawl
  const pashminaCard = productsList.locator("li").filter({
    has: page.getByRole("heading", {
      name: "Pashmina Shawl",
    }),
  });

  await pashminaCard.getByRole("button", { name: "Add to cart" }).click();

  const pashminaRow = page.getByRole("row", {
    name: /Pashmina Shawl/,
  });

  // Verify the item was added
  await expect(pashminaRow).toBeVisible();
  await expect(pashminaRow.getByTestId("qty")).toHaveText("1");

  await expect(page.getByTestId("cart-count")).toHaveText("1");

  // Remove -> Cancel
  page.once("dialog", async (dialog) => {
    await dialog.dismiss();
  });

  await pashminaRow.getByRole("button", { name: "Remove" }).click();

  await expect(pashminaRow).toBeVisible();
  await expect(pashminaRow.getByTestId("qty")).toHaveText("1");

  await expect(page.getByTestId("cart-count")).toHaveText("1");

  // Remove -> OK
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });

  await pashminaRow.getByRole("button", { name: "Remove" }).click();

  // verify cart is empty after Remove-> OK
  await expect(page.getByTestId("cart-row")).toHaveCount(0);
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
  await expect(page.getByTestId("cart-count")).toHaveText("0");

  // Note: we are starting with only 1 item (Pashmina Shawl) added to cart. If there were multiple items added to cart, check the "qty".
});

/* 
P7: Gift note
Check out a Pashmina Shawl to outside the Valley, then add a gift note through the prompt.
*/

test("P7: Add gift note for Pashmina Shawl checkout", async ({ page }) => {
  await page.goto(APP);

  // Adding a Pashmina Shawl to the cart
  const productsList = page.getByRole("list", { name: "Products" });
  const pashminaCard = productsList.locator("li").filter({
    has: page.getByRole("heading", { name: "Pashmina Shawl" }),
  });
  await pashminaCard.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByTestId("cart-count")).toHaveText("1");   


  //Expected: 4,500 + 250 = 4,750
  await page.getByLabel("Delivery area").selectOption("outside");
  await expect(page.getByTestId("delivery-fee")).toHaveText("Rs 250.00");
  await expect(page.getByTestId("order-total")).toHaveText("Rs 4,750.00");

  //Proceed to Checkout
  await page.getByRole("button", { name: "Proceed to checkout" }).click();
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();

  //fill in "Happy Dashain" gift note once the prompt appears
  page.once("dialog", async (dialog) => {
    await dialog.accept("Happy Dashain!");
  });
  await page.getByRole("button", { name: "Add a gift note" }).click();

  //check Gift note contains the same text as added in the prompt
  await expect(page.getByTestId("gift-note")).toHaveText('Gift note: "Happy Dashain!"');
});
