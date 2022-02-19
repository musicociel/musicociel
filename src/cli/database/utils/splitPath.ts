import { posix } from "path";

export const splitPath = (filePath: string) => {
  const fileName = posix.basename(filePath);
  const fileDirectory = posix.resolve("/", posix.dirname(filePath));
  return [fileDirectory === "/" ? "" : fileDirectory, fileName];
};
