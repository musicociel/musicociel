import { test } from "./baseTest";
import { join } from "path";
import { fixShowOpenFilePicker } from "./utils/fixShowOpenFilePicker";

test("should open a file", async ({ page }) => {
  await fixShowOpenFilePicker(page);
  await page.goto(".");
  const [fileChooser] = await Promise.all([page.waitForEvent("filechooser"), page.click("text=Open a file")]);
  await Promise.all([page.waitForNavigation(), fileChooser.setFiles(join(__dirname, "../../sample-songs/opensong/Amazing Grace"))]);
  await page.waitForSelector("text=wretch");
  await Promise.all([page.waitForNavigation(), page.click("text=Musicociel")]);
  await Promise.all([page.waitForNavigation(), page.click("text=Amazing Grace")]);
  await page.waitForSelector("text=wretch");
});
