import "reflect-metadata";

import { container } from "tsyringe";

import { WinService } from "./modules/win";

// 启动应用
container.resolve(WinService);
