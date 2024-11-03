export interface Config {
  mode: "light" | "dark";
  apiUrl: string;
  downloadDir: string;
  readMode: number;
  currentShuntKey: number | undefined;
  autoLogin: boolean;
  loginUserInfo: string;
  proxy:
    | {
        host: string;
        port: number | undefined;
        username: string;
        password: string;
      }
    | undefined;
}

export interface BaseComic {
  id: number;
  name: string;
  author: string;
}
