import type { Pool } from "pg";
import { asyncHandler } from "../middleware/asyncHandler";
import { NotImplemented } from "http-errors";

export const httpDeleteFile = (db: Pool) => [
  asyncHandler(async (req, res) => {
    // TODO: implement this
    throw new NotImplemented();
  })
];
