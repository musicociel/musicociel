import { page, musicocielURL } from "./browser";
import { join } from "path";

it("should open a file", async () => {
  await page.goto(musicocielURL);
  const [fileChooser] = await Promise.all([page.waitForEvent("filechooser"), page.click("text=Open a file")]);
  await Promise.all([page.waitForNavigation(), fileChooser.setFiles(join(__dirname, "../sample-songs/opensong/Amazing Grace"))]);
  await page.waitForSelector("text=wretch");
  await Promise.all([page.waitForNavigation(), page.click("text=Musicociel")]);
  await Promise.all([page.waitForNavigation(), page.click("text=Amazing Grace")]);
  await page.waitForSelector("text=wretch");
});
