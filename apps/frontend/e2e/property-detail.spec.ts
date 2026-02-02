import { test, expect } from "@playwright/test";

test.describe("Property Detail Page", () => {
  test("navigate from listing to detail page", async ({ page }) => {
    await page.goto("/propiedades");
    const firstCard = page.locator('a[href^="/propiedades/"]').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    await expect(page).toHaveURL(/\/propiedades\/.+/);
  });

  test("detail page has heading, breadcrumb, image area, and contact button", async ({
    page,
  }) => {
    await page.goto("/propiedades");
    await page.locator('a[href^="/propiedades/"]').first().click();
    await expect(page).toHaveURL(/\/propiedades\/.+/);

    await expect(page.locator("h1")).toBeVisible();

    const breadcrumbItems = page.locator(
      'nav[aria-label="Breadcrumb"] .breadcrumb-item'
    );
    await expect(breadcrumbItems).toHaveCount(3);

    await expect(page.locator("#propertyCarousel")).toBeVisible();
    await expect(page.locator("button:has-text('contactate con')")).toBeVisible();
  });

  test("contact modal opens and has form fields", async ({ page }) => {
    await page.goto("/propiedades");
    await page.locator('a[href^="/propiedades/"]').first().click();
    await expect(page).toHaveURL(/\/propiedades\/.+/);

    await page.click("button:has-text('contactate con')");
    await expect(page.locator(".modal.show")).toBeVisible();

    await expect(page.locator("#contactName")).toBeVisible();
    await expect(page.locator("#contactEmail")).toBeVisible();
    await expect(page.locator("#contactPhone")).toBeVisible();
    await expect(page.locator("#contactComments")).toBeVisible();
    await expect(
      page.locator(".modal button[type='submit']:has-text('Enviar')")
    ).toBeVisible();
  });

  test("contact modal closes via close button", async ({ page }) => {
    await page.goto("/propiedades");
    await page.locator('a[href^="/propiedades/"]').first().click();
    await expect(page).toHaveURL(/\/propiedades\/.+/);

    await page.click("button:has-text('contactate con')");
    await expect(page.locator(".modal.show")).toBeVisible();

    await page.click(".modal .btn-close");
    await expect(page.locator(".modal.show")).not.toBeVisible();
  });

  test("invalid slug shows 404", async ({ page }) => {
    await page.goto("/propiedades/nonexistent-slug-12345");
    await expect(page.locator("h1")).toContainText("404");
  });

  test("detail page has JSON-LD structured data", async ({ page }) => {
    await page.goto("/propiedades");
    await page.locator('a[href^="/propiedades/"]').first().click();
    await expect(page).toHaveURL(/\/propiedades\/.+/);

    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();
  });
});
