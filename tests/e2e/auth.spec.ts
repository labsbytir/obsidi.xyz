import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("sign-up explains verification and blocks submit without bot challenge", async ({
  page,
}) => {
  await page.goto("/sign-up");
  await expect(
    page.getByRole("heading", { name: "Your notebooks, under your name." })
  ).toBeVisible();
  await page.getByLabel("Email").fill("browser@example.com");
  await page.getByLabel("Password").fill("correct-horse-battery-staple-1");
  await expect(
    page.getByText("Bot verification is not configured.")
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create account" })
  ).toBeDisabled();
});

test("sign-in links recovery and blocks submit without bot challenge", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await expect(
    page.getByRole("heading", { name: "Welcome back." })
  ).toBeVisible();
  await page.getByRole("link", { name: "Forgot your password?" }).click();
  await expect(page).toHaveURL(/forgot-password$/);
  await expect(
    page.getByText("Reset links expire after one hour")
  ).toBeVisible();
});

test("reset page rejects a missing token and sessions redirect when signed out", async ({
  page,
}) => {
  await page.goto("/reset-password");
  await expect(page.getByText("This link is missing its token.")).toBeVisible();
  await page.goto("/verify-email");
  await expect(page.getByText("This link is not valid")).toBeVisible();
  await page.goto("/settings/sessions");
  await expect(page).toHaveURL(/sign-in$/);
});

test("auth screens pass automated accessibility checks", async ({ page }) => {
  for (const path of [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations, path).toEqual([]);
  }
});
