import fs from "node:fs";
import path from "node:path";

import sqlite from "better-sqlite3";

import { appDir } from "../utils";

const dbDir = path.resolve(appDir, "data");
const dbFile = path.resolve(dbDir, "data.db");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

export const db = new sqlite(dbFile);
