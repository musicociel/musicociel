import { chromium, FullConfig } from "@playwright/test";

const START_TIMEOUT = 60000;

export default async function (config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  console.log(`Connecting to Musicociel at ${baseURL}`);
  try {
    const page = await browser.newPage({ baseURL });
    const timeout = Date.now() + START_TIMEOUT;
    let error: any = true;
    while (error && Date.now() <= timeout) {
      try {
        const res = await page.goto("./musicociel.json");
        if (!res || !res.ok) {
          throw new Error(`${res?.url}: ${res?.status} ${res?.statusText}`);
        }
        const config = await res.json();
        console.log(`Musicociel config: ${JSON.stringify(config)}`);
        error = null;
      } catch (e) {
        error = e || true;
        await page.waitForTimeout(100);
      }
    }
    if (error) {
      throw new Error(`Could not successfully connect to ${baseURL} in ${START_TIMEOUT}ms: ${error}`);
    }
  } finally {
    await browser.close();
  }
}
