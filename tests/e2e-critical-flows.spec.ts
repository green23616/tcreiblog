import { expect, test } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("main")).toBeVisible();
});

test("tags page loads", async ({ page }) => {
  await page.goto("/tags");

  await expect(page).toHaveTitle(/Tags/);
});

test("login page loads", async ({ page }) => {
  await page.goto("/login");

  expect(await page.getByRole("button").count()).toBeGreaterThanOrEqual(1);
});

test("/write redirects to login", async ({ page }) => {
  await page.goto("/write");

  await expect(page).toHaveURL(/\/login/);
});

test("/settings redirects to login", async ({ page }) => {
  await page.goto("/settings");

  await expect(page).toHaveURL(/\/login/);
});
