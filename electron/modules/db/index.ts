import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import Sqlite, { Database } from "better-sqlite3";
import { ipcMain } from "electron";
import { inject, singleton } from "tsyringe";

import { ConfigService } from "../config";
import { LoggerService } from "../logger";
import { PathService } from "../path";

export type DownloadItem = {
  id: number;
  belongId: number;
  name: string;
  seriesName: string;
  author: string;
  fileName: string;
};

@singleton()
export class DbService {
  private db: Database | null = null;
  private dbFilePath: string;

  constructor(
    @inject(PathService) pathService: PathService,
    @inject(ConfigService) private configService: ConfigService,
    @inject(LoggerService) private loggerService: LoggerService,
  ) {
    this.dbFilePath = join(pathService.getDataDirPath(), "app.db");
    this.loggerService.info(`db 文件路径为 ${this.dbFilePath}`);
    this.initDatabase();

    ipcMain.handle("app/isDownload", async () => {
      return false;
    });
    ipcMain.handle("app/getDownloadList", async (_e, page, pageSize) => {
      return this.getDownloadComicList(page, pageSize);
    });
    ipcMain.handle(
      "app/saveDownloadFile",
      (_e, buffer: ArrayBuffer, name: string) => {
        writeFileSync(
          resolve(this.configService.get().downloadDir, name),
          Buffer.from(buffer),
        );
      },
    );
    ipcMain.handle("app/insertDownload", async (_e, args) => {
      return this.insertDownloadComic(args);
    });
  }

  private initDatabase() {
    this.db = new Sqlite(this.dbFilePath);
    this.db.exec(`CREATE TABLE IF NOT EXISTS download (
      id INTEGER,
      belongId INTEGER,
      name VARCHAR(100),
      seriesName VARCHAR(100),
      author VARCHAR(50),
      fileName VARCHAR(200),
      createAt INTEGER,
      PRIMARY KEY (id, belongId)
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
        "INSERT INTO download(id, belongId, name, fileName, seriesName, author, createAt) VALUES(?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        item.id,
        item.belongId,
        item.name,
        item.fileName,
        item.seriesName,
        item.author,
        Date.now(),
      );
    return (r?.changes ?? 0) > 0;
  };
}
