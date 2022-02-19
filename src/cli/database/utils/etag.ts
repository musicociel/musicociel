import { PreconditionFailed } from "http-errors";

const etagRegExp = /^"[\w/+]+={0,2}"$/;
export const parseEtag = (value: string | undefined) => {
  if (value) {
    value = value.trim();
    if (!etagRegExp.test(value)) {
      throw new PreconditionFailed();
    }
    return Buffer.from(value.substring(1, value.length - 2), "base64");
  }
};

export const formatEtag = (buffer: Buffer) => `"${buffer.toString("base64")}"`;
