export interface Config {
  apiUrl: string;
  downloadDir: string;
  readMode: number;
  currentShuntKey: number | undefined;
}

export interface BaseComic {
  id: number;
  name: string;
  author: string;
}
