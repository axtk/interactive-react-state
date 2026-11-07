import { expect, type Page, test } from "@playwright/test";
import { type Server, serve } from "auxsrv";

class Playground {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  async clickLink(name: string) {
    await this.page.getByRole("link", { name }).click();
  }
  async hasPath(value: string) {
    await expect(this.page).toHaveURL(({ pathname }) => pathname === value);
  }
  async hasMainTitle() {
    await expect(this.page.locator("h1")).toBeVisible();
  }
  async hasSectionTitle(value: string) {
    await expect(this.page.locator("h2:visible")).toHaveText(value);
  }
  async hasFullHeader() {
    await expect(this.page.locator("header")).toHaveClass("full");
  }
  async hasCompactHeader() {
    await expect(this.page.locator("header")).toHaveClass("compact");
  }
}

test.describe("routing", () => {
  let server: Server;

  test.beforeAll(async () => {
    server = await serve({ path: import.meta.url });
  });

  test.afterAll(() => {
    server.close();
  });

  test("links", async ({ page }) => {
    let p = new Playground(page);

    await page.goto("/");
    await p.hasMainTitle();
    await p.hasFullHeader();

    await p.clickLink("full story");
    await p.hasPath("/story");
    await p.hasSectionTitle("Story");
    await p.hasCompactHeader();

    await p.clickLink("Intro");
    await p.hasPath("/");
    await p.hasSectionTitle("Intro");
    await p.hasFullHeader();
  });

  test("non-root url", async ({ page }) => {
    let p = new Playground(page);

    await page.goto("/story");
    await p.hasSectionTitle("Story");
    await p.hasCompactHeader();

    await p.clickLink("Intro");
    await p.hasPath("/");
    await p.hasSectionTitle("Intro");
    await p.hasFullHeader();

    await p.clickLink("full story");
    await p.hasPath("/story");
    await p.hasSectionTitle("Story");
    await p.hasCompactHeader();
  });
});
