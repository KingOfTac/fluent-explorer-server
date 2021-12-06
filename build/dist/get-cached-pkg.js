"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fslib_1 = require("@yarnpkg/fslib");
const libzip_1 = __importDefault(require("@yarnpkg/libzip"));
const zipOpenFs = new fslib_1.ZipOpenFS({ libzip: libzip_1.default });
const crossFs = new fslib_1.PosixFS(zipOpenFs);
console.log(crossFs.readdirSync('F:\\repos\\fluent-explorer-server\\.yarn\\cache\\@fluentui-svg-icons-npm-1.1.153-e454a684b7-e41a3d0df1.zip\\svg-icons\\icons'));
//# sourceMappingURL=get-cached-pkg.js.map