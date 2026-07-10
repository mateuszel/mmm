import { expect, test } from "@playwright/test";
test("runs a partner fixture through approval", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Operational recovery" })).toBeVisible();
  await page.getByRole("button", { name: /Solidgate hypothesis/ }).click();
  await expect(page.getByRole("heading", { name: "Payment revenue recovery" })).toBeVisible();
  await page.getByRole("button", { name: "Run agent" }).click();
  await page.getByRole("button", { name: "Approve simulation" }).click();
  await expect(page.getByText("Simulation approved")).toBeVisible();
  await expect(page.getByText("No live change made.")).toBeVisible();
  await page.getByRole("button", { name: /Boski hypothesis/ }).click();
  await expect(page.getByRole("heading", { name: "Proactive goal execution" })).toBeVisible();
  await expect(page.getByText("Messages sent")).toBeVisible();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByRole("heading", { name: "Operational recovery" })).toBeVisible();
});
