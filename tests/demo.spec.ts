import { expect, test } from "@playwright/test";

const url = "/demo?test=1";

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

test("home composer and lightweight menus are genuinely interactive", async ({ page }) => {
  const input = page.getByTestId("home-composer-input");
  const submit = page.getByTestId("home-composer-submit");
  await expect(submit).toBeDisabled();
  await input.fill("Find a safe camera deal under 1,200 EUR");
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByTestId("home-evidence-count")).toHaveText("0 items");
  await page.getByTestId("home-activity-trigger").click();
  await expect(page.getByTestId("home-activity-popover")).toContainText("Request saved locally");
  await page.getByTestId("home-profile-trigger").click();
  await expect(page.getByTestId("home-profile-popover")).toContainText("No account connected");
  await page.getByTestId("home-settings-trigger").click();
  await expect(page.getByTestId("home-profile-popover")).toHaveCount(0);
  await expect(page.getByTestId("home-settings-popover")).toBeVisible();
});

test("retail search checks eight sources and expands only two authentic captures", async ({ page }) => {
  await page.keyboard.press("1");
  await expect(page.getByTestId("retail-source-funnel")).toBeVisible();
  await expect(page.getByTestId("retail-source-name")).toHaveCount(8);
  await expect(page.getByTestId("retail-final")).toBeVisible();
  await expect(page.getByTestId("adidas-capture")).toHaveCount(1);
  await expect(page.getByTestId("eobuwie-capture")).toHaveCount(1);
  await page.waitForTimeout(250);
  await expect(page.getByTestId("retail-final")).toBeVisible();
});

test("private-seller path reaches protected checkout and holds", async ({ page }) => {
  await page.keyboard.press("2");
  await expect(page.getByTestId("private-final")).toBeVisible();
  await page.waitForTimeout(250);
  await expect(page.getByTestId("private-final")).toContainText("Verified deal ready");
});

test("protected call pauses, resumes on click, synchronizes risk, and holds", async ({ page }) => {
  await page.keyboard.press("3");
  const approval = page.getByTestId("start-protected-call");
  await expect(approval).toBeVisible();
  await page.waitForTimeout(200);
  await expect(approval).toBeVisible();
  await approval.click();
  await expect(page.getByTestId("risk-medium")).toBeVisible();
  await expect(page.getByTestId("risk-critical")).toBeVisible();
  await expect(page.getByTestId("risk-personal")).toBeVisible();
  await expect(page.getByTestId("foreign-final")).toBeVisible();
  await expect(page.getByTestId("call-timer")).toHaveText("00:31");
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
