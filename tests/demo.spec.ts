import { expect, test } from "@playwright/test";

const url = "/demo?test=1";

test.use({ viewport: { width: 1536, height: 700 } });

test.beforeEach(async ({ page }) => {
  await page.goto(url);
  await expect(page.getByTestId("home-screen")).toHaveAttribute("data-ready", "true");
});

test("refresh and reset always restore the clean home", async ({ page }) => {
  await page.keyboard.press("1");
  await expect(page.getByTestId("scenario-screen")).toHaveAttribute("data-scenario", "retail");
  await page.keyboard.press("r");
  await expect(page.getByTestId("home-screen")).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("home-screen")).toBeVisible();
});

test("custom home request stays on home and resolves to coming soon", async ({ page }) => {
  await expect(page.getByText("Luna 5.6")).toBeVisible();
  for (const brand of ["OpenAI", "ElevenLabs", "InPost", "Ceneo"]) await expect(page.getByAltText(brand).first()).toBeVisible();
  const input = page.getByTestId("home-composer-input");
  const submit = page.getByTestId("home-composer-submit");
  await expect(submit).toBeDisabled();
  await input.fill("Find a safe camera deal under 1,200 EUR");
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByText("Personalized live search is coming soon. Try an example below.")).toBeVisible();
  await expect(page.getByTestId("home-screen")).toBeVisible();
  await expect(page.getByTestId("scenario-screen")).toHaveCount(0);
  await expect(page.getByTestId("home-evidence-count")).toHaveText("Active");
  await page.getByTestId("home-activity-trigger").click();
  await expect(page.getByTestId("home-activity-popover")).toContainText("Personalized search is coming soon");
  await page.getByTestId("home-profile-trigger").click();
  await expect(page.getByTestId("home-profile-popover")).toContainText("Privacy protection active");
  await page.getByTestId("home-settings-trigger").click();
  await expect(page.getByTestId("home-profile-popover")).toHaveCount(0);
  await expect(page.getByTestId("home-settings-popover")).toBeVisible();
});

test("retail search checks eight sources and expands only two authentic captures", async ({ page }) => {
  await page.keyboard.press("1");
  await expect(page.getByTestId("retail-source-funnel")).toBeVisible();
  await expect(page.getByTestId("retail-source-name")).toHaveCount(8);
  await expect(page.getByTestId("retail-final")).toBeVisible();
  await expect(page.getByText("30-day reference checked")).toBeVisible();
  await expect(page.getByTestId("adidas-capture")).toHaveCount(1);
  await expect(page.getByTestId("eobuwie-capture")).toHaveCount(1);
  await page.waitForTimeout(250);
  await expect(page.getByTestId("retail-final")).toBeVisible();
});

test("private-seller path reaches protected checkout and holds", async ({ page }) => {
  await page.keyboard.press("2");
  await expect(page.locator(".source-price-badge")).toContainText("1,050 PLN");
  await expect(page.getByTestId("private-final")).toBeVisible();
  await expect(page.getByAltText("Serial label evidence")).toBeVisible();
  await page.waitForTimeout(250);
  await expect(page.getByTestId("private-final")).toContainText("Verified deal ready");
});

test("protected call pauses, resumes on click, synchronizes risk, and holds", async ({ page }) => {
  await page.keyboard.press("3");
  const approval = page.getByTestId("start-protected-call");
  await expect(approval).toBeVisible();
  await expect(page.getByText("Voice by ElevenLabs")).toBeVisible();
  await expect(page.getByText("Is the Fujifilm X100V available? Please confirm its condition and included items.")).toHaveCount(0);
  await expect(page.getByTestId("call-transcript")).toHaveCount(0);
  await page.waitForTimeout(200);
  await expect(approval).toBeVisible();
  await approval.click();
  await expect(page.getByTestId("call-transcript").locator(":scope > div")).toHaveCount(5);
  await expect(page.getByTestId("risk-medium")).toBeVisible();
  await expect(page.getByTestId("risk-critical")).toBeVisible();
  await expect(page.getByTestId("risk-personal")).toBeVisible();
  await expect(page.getByTestId("foreign-final")).toBeVisible();
  await expect(page.getByTestId("call-timer")).toHaveText("00:32");
  await expect(page.getByText("I’m not comfortable doing this outside eBay. I’m sorry.")).toBeVisible();
  await page.waitForTimeout(250);
  await expect(page.getByTestId("foreign-final")).toBeVisible();
  await page.keyboard.press("r");
  await expect(page.getByTestId("home-screen")).toBeVisible();
  const audio = page.getByTestId("call-audio");
  await expect.poll(() => audio.evaluate((node: HTMLAudioElement) => ({ paused: node.paused, currentTime: node.currentTime }))).toEqual({ paused: true, currentTime: 0 });
});

test("recording viewport never scrolls and playback remains offline", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (request) => {
    const requestUrl = new URL(request.url());
    if (!["127.0.0.1", "localhost"].includes(requestUrl.hostname)) external.push(request.url());
  });
  await page.goto("/demo?recording=1&test=1");
  await expect(page.getByTestId("recording-loader")).toBeHidden({ timeout: 12_000 });
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
  }));
  expect(dimensions.width).toBe(dimensions.innerWidth);
  expect(dimensions.height).toBe(dimensions.innerHeight);
  expect(external).toEqual([]);
});

test("source and conversation panels keep fixed geometry across transitions", async ({ page }) => {
  await page.keyboard.press("1");
  const retailStage = page.getByTestId("retail-source-stage");
  await expect(retailStage).toBeVisible();
  const retailBefore = await retailStage.boundingBox();
  await expect(page.getByTestId("retail-final")).toBeVisible();
  const retailAfter = await retailStage.boundingBox();
  expect(retailAfter).toEqual(retailBefore);

  await page.keyboard.press("r");
  await page.keyboard.press("2");
  const privateStage = page.getByTestId("private-source-stage");
  const sellerThread = page.getByTestId("seller-thread-panel");
  const checkout = page.getByTestId("checkout-panel");
  await expect(privateStage).toBeVisible();
  const before = await Promise.all([privateStage.boundingBox(), sellerThread.boundingBox(), checkout.boundingBox()]);
  await expect(page.getByTestId("private-final")).toBeVisible();
  const after = await Promise.all([privateStage.boundingBox(), sellerThread.boundingBox(), checkout.boundingBox()]);
  expect(after).toEqual(before);
});

test("all final states remain fully visible at 1536x700", async ({ page }) => {
  const cases = [
    { key: "1", testId: "retail-final" },
    { key: "2", testId: "private-final" },
    { key: "3", testId: "foreign-final", approve: true },
  ] as const;

  for (const scenario of cases) {
    await page.keyboard.press(scenario.key);
    if ("approve" in scenario) {
      await expect(page.getByTestId("start-protected-call")).toBeVisible();
      await page.getByTestId("start-protected-call").click();
    }

    const finalState = page.getByTestId(scenario.testId);
    await expect(finalState).toBeVisible();
    await expect(finalState).toBeInViewport({ ratio: 0.95 });
    const viewport = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
    expect(viewport).toEqual({ width: 1536, height: 700 });

    await page.keyboard.press("r");
    await expect(page.getByTestId("home-screen")).toBeVisible();
  }
});
