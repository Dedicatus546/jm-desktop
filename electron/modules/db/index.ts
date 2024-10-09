import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import Sqlite, { Database } from "better-sqlite3";
import { ipcMain } from "electron";
import { inject, singleton } from "tsyringe";

import { ConfigService } from "../config";
import { DirService } from "../dir";

export type DownloadItem = {
  id: number;
  name: string;
  author: string;
};

@singleton()
export class DbService {
  private db: Database | null = null;

  constructor(
    @inject(DirService) private dirService: DirService,
    // @ts-expect-error inject configService
    @inject(ConfigService) private configService: ConfigService,
  ) {
    this.initDatabase();

    ipcMain.handle("app/isDownload", async (_e, comicId: number) => {
      return this.isComicDownload(comicId);
    });
    ipcMain.handle("app/getDownloadList", async (_e, page, pageSize) => {
      return this.getDownloadComicList(page, pageSize);
    });
    ipcMain.handle(
      "app/saveDownloadFile",
      async (_e, buffer: ArrayBuffer, name: string) => {
        writeFileSync(
          resolve(configService.get().downloadDir, name),
          Buffer.from(buffer),
        );
      },
    );
    ipcMain.handle("app/insertDownload", async (_e, args) => {
      return this.insertDownloadComic(args);
    });
  }

  private initDatabase() {
    this.db = new Sqlite(this.dirService.get("db"));
    this.db.exec(`CREATE TABLE IF NOT EXISTS download (
      id INTEGER PRIMARY KEY,
      name VARCHAR(100),
      author VARCHAR(50),
      createAt INTEGER 
    )`);
  }

  public getDownloadComicList(page: number = 1, pageSize: number = 10) {
    return {
      total:
        this.db
          ?.prepare<
            [],
            { count: number }
          >(`SELECT COUNT(*) count FROM download`)
          .get()?.count ?? 0,
      list: this.db
        ?.prepare<
          [number, number],
          DownloadItem
        >("SELECT * FROM download ORDER BY createAt DESC LIMIT ? OFFSET ? ")
        .all(pageSize, (page - 1) * pageSize),
    };
  }

  private findByComicId(comicId: number) {
    return this.db
      ?.prepare<[number], DownloadItem>(`SELECT * FROM download WHERE id = ?`)
      .get(comicId);
  }

  public isComicDownload = (comicId: number) => {
    return this.findByComicId(comicId) !== undefined;
  };

  public insertDownloadComic = (item: DownloadItem) => {
    if (this.findByComicId(item.id)) {
      const r = this.db
        ?.prepare("UPDATE download set createAt = ? WHERE id = ?")
        .run(Date.now(), item.id);
      return (r?.changes ?? 0) > 0;
    }
    const r = this.db
      ?.prepare(
        "INSERT INTO download(id, name, author, createAt) VALUES(?, ?, ?, ?)",
      )
      .run(item.id, item.name, item.author, Date.now());
    return (r?.changes ?? 0) > 0;
  };
}
