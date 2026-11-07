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
  async setInput(value: string) {
    await this.page.getByRole("textbox").fill(value);
  }
  async saveInput() {
    await this.page.getByRole("button", { name: "Save" }).click();
  }
  async hasPath(value: string) {
    await expect(this.page).toHaveURL(({ pathname }) => pathname === value);
  }
  async hasSectionTitle(value: string) {
    await expect(this.page.locator("h2:visible")).toHaveText(value);
  }
}

test.describe("routing middleware", () => {
  let server: Server;

  test.beforeAll(async () => {
    server = await serve({ path: import.meta.url });
  });

  test.afterAll(() => {
    server.close();
  });

  test("links and redirection", async ({ page }) => {
    let p = new Playground(page);

    await page.goto("/");
    await p.hasPath("/");

    // Links work
    await p.clickLink("Section 1");
    await p.hasPath("/sections/1");
    await p.hasSectionTitle("Section 1");

    await p.clickLink("Intro");
    await p.hasPath("/");
    await p.hasSectionTitle("Intro");

    await p.clickLink("Section 2");
    await p.hasPath("/sections/2");
    await p.hasSectionTitle("Section 2");

    // Redirected link works
    await p.clickLink("Start");
    await p.hasPath("/");
    await p.hasSectionTitle("Intro");
  });

  test("immediate redirection", async ({ page }) => {
    let p = new Playground(page);

    await page.goto("/start");
    await p.hasSectionTitle("Intro");
    await p.hasPath("/");

    // Links work
    await p.clickLink("Section 1");
    await p.hasPath("/sections/1");
    await p.hasSectionTitle("Section 1");
  });

  test("unsaved input", async ({ page }) => {
    let p = new Playground(page);

    await page.goto("/");
    await p.hasPath("/");
    await p.hasSectionTitle("Intro");

    await p.setInput("test");

    // Can't leave with unsaved input
    await p.clickLink("Section 1");
    await p.hasPath("/");
    await p.hasSectionTitle("Intro");
    await p.clickLink("Section 2");
    await p.hasPath("/");
    await p.hasSectionTitle("Intro");

    await p.saveInput();

    // Can leave with saved input
    await p.clickLink("Section 1");
    await p.hasPath("/sections/1");
    await p.hasSectionTitle("Section 1");

    await p.setInput("test again");

    // Can't leave with unsaved input
    await p.clickLink("Intro");
    await p.hasPath("/sections/1");
    await p.hasSectionTitle("Section 1");
    await p.clickLink("Section 2");
    await p.hasPath("/sections/1");
    await p.hasSectionTitle("Section 1");

    await p.setInput("");

    // Can leave with empty input
    await p.clickLink("Section 2");
    await p.hasPath("/sections/2");
    await p.hasSectionTitle("Section 2");
  });
});
