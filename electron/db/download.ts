import { db } from "./init";

export type DownloadItem = {
  id: number;
  name: string;
  author: string;
};

db.exec(`CREATE TABLE IF NOT EXISTS download (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100),
  author VARCHAR(50),
  createAt INTEGER 
)`);

export const getDownloadList = (page: number = 1, pageSize: number = 10) => {
  return {
    total:
      db
        .prepare<[], { count: number }>(`SELECT COUNT(*) count FROM download`)
        .get()?.count ?? 0,
    list: db
      .prepare<
        [number, number],
        DownloadItem
      >("SELECT * FROM download ORDER BY createAt DESC LIMIT ? OFFSET ? ")
      .all(pageSize, (page - 1) * pageSize),
  };
};

const findByComicId = (comicId: number) => {
  return db
    .prepare<[number], DownloadItem>(`SELECT * FROM download WHERE id = ?`)
    .get(comicId);
};

export const isDownload = (comicId: number) => {
  return findByComicId(comicId) !== undefined;
};

export const insertDownload = (item: DownloadItem) => {
  if (findByComicId(item.id)) {
    const r = db
      .prepare("UPDATE download set createAt = ? WHERE id = ?")
      .run(Date.now(), item.id);
    return r.changes > 0;
  }
  const r = db
    .prepare(
      "INSERT INTO download(id, name, author, createAt) VALUES(?, ?, ?, ?)",
    )
    .run(item.id, item.name, item.author, Date.now());
  return r.changes > 0;
};
