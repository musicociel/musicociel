import { expect } from "@playwright/test";
import { randomBytes } from "crypto";
import { test } from "../baseTest";

for (const folder of ["", "oneLevel/", "multiple/levels/"]) {
  test(`file at ${folder}myFile.bin`, async ({ branch, request, authorization }) => {
    const randomFileContent = randomBytes(365);
    const resRef = await request.put(`./api/branches/${branch}/files/${folder}myFile.bin`, {
      failOnStatusCode: true,
      data: randomFileContent,
      headers: { authorization, "if-match": `"null"` }
    });
    const infoRef = await resRef.json();
    expect.soft(infoRef.oldFileHash).toBe(null);
    expect.soft(infoRef.oldCommit).toBe(null);

    await test.step("check if the file was correctly stored", async () => {
      const res = await request.get(`./api/branches/${branch}/files/${folder}myFile.bin`, { failOnStatusCode: true, headers: { authorization } });
      expect.soft(await res.body()).toStrictEqual(randomFileContent);
      expect.soft(res.headers()["commit"]).toBe(infoRef.newCommit);
      expect.soft(res.headers()["etag"]).toBe(`"${infoRef.newFileHash}"`);
    });

    await test.step("retrieve the file with if-none-match", async () => {
      const res = await request.get(`./api/branches/${branch}/files/${folder}myFile.bin`, {
        failOnStatusCode: true,
        headers: { authorization, "if-none-match": `"${infoRef.newFileHash}"` }
      });
      expect.soft(res.status()).toBe(304);
      expect.soft(res.headers()["commit"]).toBe(infoRef.newCommit);
      expect.soft(res.headers()["etag"]).toBe(`"${infoRef.newFileHash}"`);
      expect.soft(await res.body()).toStrictEqual(Buffer.from([]));
    });

    await test.step("try to update the file with a wrong previous hash", async () => {
      const res = await request.put(`./api/branches/${branch}/files/${folder}myFile.bin`, {
        data: randomFileContent,
        headers: { authorization, "if-match": `"${infoRef.newCommit}"` } // to succeed, it should be infoRef.newFileHash
      });
      expect(res.status()).toBe(412 /* Precondition Failed */); // check that it failed
    });

    await test.step("put again the same file with the same name", async () => {
      const res = await request.put(`./api/branches/${branch}/files/${folder}myFile.bin`, {
        failOnStatusCode: true,
        data: randomFileContent,
        headers: { authorization, "if-match": `"${infoRef.newFileHash}"` }
      });
      const info = await res.json();
      expect.soft(info.oldFileHash).toBe(infoRef.newFileHash);
      expect.soft(info.oldCommit).toBe(infoRef.newCommit);
      expect.soft(info.newFileHash).toBe(infoRef.newFileHash);
      expect.soft(info.newCommit).toBe(infoRef.newCommit);
    });

    let newCommit: string;

    await test.step("put again the same file with another name", async () => {
      const res = await request.put(`./api/branches/${branch}/files/${folder}myFileCopy.bin`, {
        failOnStatusCode: true,
        data: randomFileContent,
        headers: { authorization }
      });
      const info = await res.json();
      expect.soft(info.oldFileHash).toBe(null);
      expect.soft(info.oldCommit).toBe(infoRef.newCommit);
      expect.soft(info.newFileHash).toBe(infoRef.newFileHash);
      expect.soft(info.newCommit).not.toBe(infoRef.newCommit);
      newCommit = info.newCommit;
    });

    await test.step("check if the first file is still there with the new commit", async () => {
      const res = await request.get(`./api/branches/${branch}/files/${folder}myFile.bin`, { failOnStatusCode: true, headers: { authorization } });
      expect.soft(await res.body()).toStrictEqual(randomFileContent);
      expect.soft(res.headers()["etag"]).toBe(`"${infoRef.newFileHash}"`);
      expect.soft(res.headers()["commit"]).toBe(newCommit);
    });
  });
}
