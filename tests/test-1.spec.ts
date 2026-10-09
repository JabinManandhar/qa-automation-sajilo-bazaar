import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto(
    "file:///D:/Qrius%20related%20ALL/Day%2015%20-Handling%20Real-World%20UI%20Complexity-20261007T051950Z-1-001/qrius-playwright/app/sajilo-bazaar.html",
  );
  await page
    .getByRole("listitem")
    .filter({ hasText: "Pashmina ShawlPure pashmina," })
    .getByRole("button")
    .click();
  await page.getByRole("button", { name: "Add to cart" }).nth(5).click();
  await page
    .getByRole("cell", { name: "Decrease quantity 2 Increase" })
    .getByLabel("Increase quantity")
    .click();
  await page.getByText("3", { exact: true }).click();
  await page.getByTestId("subtotal").click();
  await page.getByTestId("order-total").click();
});
