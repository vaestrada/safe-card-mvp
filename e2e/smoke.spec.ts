import { test, expect } from "@playwright/test";

test.describe("Safe Card MVP smoke", () => {
  test("landing loads with OG meta, benefits, and storyboard link", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Safe Card/);
    const og = page.locator('meta[property="og:image"]');
    await expect(og).toHaveAttribute("content", /assets\/og\.jpg/);
    await expect(page.getByText("Proteksyon na naiintindihan mo")).toBeVisible();
    await expect(page.getByText("Emergency ambulance service")).toBeVisible();
    await expect(page.getByRole("link", { name: "Basahin ang kuwento" })).toBeVisible();
  });

  test("storyboard renders four narrated frames with images", async ({ page }) => {
    await page.goto("/storyboard");
    await expect(page.getByText("Ang kuwento ni Ate Liza")).toBeVisible();
    await expect(page.getByText("Frame 1")).toBeVisible();
    await expect(page.getByText("Frame 4")).toBeVisible();
    await expect(page.locator("img[alt='May nagtiwala sa kanya']")).toBeVisible();
  });

  test("referral link redirects to apply and persists the code", async ({ page }) => {
    const response = await page.goto("/r/indy-paragas");
    expect(response?.url()).toContain("/apply");
    await expect(page.getByText("Mula sa referral ni: indy-paragas")).toBeVisible();
  });

  test("form: valid submission shows success (bot-trap variant, no DB write)", async ({ page }) => {
    await page.goto("/apply?ref=indy-paragas");
    await page.getByLabel("Buong pangalan").fill("Smoke Test Applicant");
    await page.getByLabel("Mobile number").fill("09171234567");
    await page.getByLabel("Siyudad o barangay").fill("Quezon City");
    await page.getByLabel("Trabaho o papel sa tahanan").selectOption("kasambahay");
    await page.getByText(/sumasang-ayon ako sa privacy notice/).click();
    // Honeypot fill: exercises the full client->server round trip without
    // writing a test row into the live intake store. (Hidden field: force.)
    await page.locator("#website").fill("playwright-smoke", { force: true });
    await page.getByRole("button", { name: "I-submit ang application" }).click();
    await expect(page.getByText("Natanggap ang inyong application")).toBeVisible();
  });

  test("form: invalid phone shows a friendly Tagalog error", async ({ page }) => {
    await page.goto("/apply");
    await page.getByLabel("Buong pangalan").fill("Smoke Test");
    await page.getByLabel("Mobile number").fill("123");
    await page.getByLabel("Siyudad o barangay").fill("QC");
    await page.getByLabel("Trabaho o papel sa tahanan").selectOption("driver");
    await page.getByText(/sumasang-ayon ako sa privacy notice/).click();
    await page.getByRole("button", { name: "I-submit ang application" }).click();
    await expect(page.getByText("Pakilagay ang tamang mobile number.")).toBeVisible();
  });

  test("form: assisted mode reveals the helper field", async ({ page }) => {
    await page.goto("/apply");
    await page.getByText("May tumutulong sa akin").click();
    await expect(page.getByLabel("Pangalan ng tumutulong (optional)")).toBeVisible();
  });

  test("admin is gated without a cookie", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Safe Card Admin")).toBeVisible();
    await expect(page.getByLabel("Admin password")).toBeVisible();
  });

  test("QR poster renders for a seeded advocate", async ({ page }) => {
    await page.goto("/qr/indy-paragas");
    await expect(page.getByText("Referral poster ni")).toBeVisible();
    await expect(page.locator('svg[shape-rendering="crispEdges"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "I-print ang poster" })).toBeVisible();
  });
});
