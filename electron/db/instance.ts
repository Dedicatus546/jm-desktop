import sqlite from "better-sqlite3";

import { dbFilePath } from "../dir";

export const db = new sqlite(dbFilePath);
