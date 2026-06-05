import { test, expect } from "@playwright/test";

test.describe("Secciones (rutas de filtro)", () => {
  test("la página de venta carga con h1 y breadcrumb", async ({ page }) => {
    await page.goto("/propiedades/venta/");
    await expect(page.locator("h1")).toContainText(/venta/i);
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
  });

  test("la página de alquiler es indexable y canónica", async ({ page }) => {
    await page.goto("/propiedades/alquiler/");
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", /\/propiedades\/alquiler\/?$/);
  });

  test("combinación inexistente devuelve 404", async ({ page }) => {
    const res = await page.goto("/propiedades/venta/combinacion-que-no-existe-xyz/");
    expect(res?.status()).toBe(404);
  });

  test("desde la base se puede navegar a una sección", async ({ page }) => {
    await page.goto("/propiedades/");
    // The app uses trailingSlash: true so links are /propiedades/venta/
    await page.locator('a[href="/propiedades/venta/"]').first().click();
    await expect(page).toHaveURL(/\/propiedades\/venta\/?/);
  });
});
