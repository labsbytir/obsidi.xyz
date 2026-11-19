import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("the landing page loads the pinned self-hosted font and honest navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your notes. Your domain." })
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page
      .locator("body")
      .evaluate((body) => getComputedStyle(body).fontFamily)
  ).toContain("JetBrains Mono");
  const fontResponse = await page.request.get(
    "/fonts/jetbrains-mono-v2.304-regular.woff2"
  );
  expect(fontResponse.status()).toBe(200);
  expect(fontResponse.headers()["content-type"]).toContain("font");
  const action = page
    .getByRole("link", { name: "Read a sample vault" })
    .first();
  expect(
    await action.evaluate(
      (element) => getComputedStyle(element).backgroundColor
    )
  ).toBe("rgb(244, 244, 242)");
  await page.getByRole("link", { name: "Read a sample vault" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Field notes" })
  ).toBeVisible();
  await expect(page.getByText("Sample vault, not account data.")).toBeVisible();
  const panel = page.getByRole("tabpanel");
  const panelSize = await panel.boundingBox();
  expect(panelSize?.width).toBeGreaterThan(300);
  expect(panelSize?.height).toBeLessThan(250);
});

test("reader search supports keyboard, empty results, and focus restoration", async ({
  page,
}) => {
  await page.goto("/sample");
  await page.waitForLoadState("networkidle");
  expect(
    (await page.getByRole("tabpanel").boundingBox())?.width
  ).toBeGreaterThan(300);
  const trigger = page.getByRole("button", { name: "Search notes" });
  await trigger.focus();
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("combobox").fill("no-such-note");
  await expect(dialog.getByText("No matching notes.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("combobox").fill("Small connections");
  await page.getByRole("option", { name: "Small connections" }).click();
  await expect(page).toHaveURL(/#connections$/);
  await page.getByRole("tab", { name: "Markdown", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "[[Start here|a place to begin]]"
  );
  await page.keyboard.press("ArrowLeft");
  await expect(
    page.getByRole("tab", { name: "Reading", exact: true })
  ).toHaveAttribute("aria-selected", "true");
});

for (const width of [360, 768, 1440]) {
  test(`navigation and reader do not overflow at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const path of ["/", "/sample", "/docs", "/pricing"]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth
        ),
        `${path} must not overflow`
      ).toBe(true);
      if (path === "/" || path === "/sample") {
        await page.screenshot({
          path: testInfo.outputPath(
            `${path === "/" ? "landing" : "reader"}-${width}.png`
          ),
          fullPage: true,
        });
      }
    }
    if (width === 360) {
      await page.goto("/");
      const trigger = page.getByRole("button", { name: "Open navigation" });
      await trigger.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
    }
  });
}

test("public screens and search dialog pass automated accessibility checks", async ({
  page,
}) => {
  for (const path of ["/", "/sample", "/docs", "/pricing"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations, path).toEqual([]);
  }
  await page.goto("/sample");
  await page.getByRole("button", { name: "Search notes" }).click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
