"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const process_1 = __importDefault(require("process"));
const dotenv_1 = __importDefault(require("dotenv"));
const yargs_1 = __importDefault(require("yargs/yargs"));
const mongodb_1 = require("mongodb");
var IconStyle;
(function (IconStyle) {
    IconStyle[IconStyle["filled"] = 1] = "filled";
    IconStyle[IconStyle["regular"] = 2] = "regular";
    IconStyle[IconStyle["thin"] = 3] = "thin";
})(IconStyle || (IconStyle = {}));
function iconMapper(iconName, data, parts) {
    const mappedData = {
        name: iconName,
        raw: data
    };
    const folder = [];
    for (const part of parts) {
        if (Number(part)) {
            mappedData.size = Number(part);
        }
        else if (IconStyle[part]) {
            mappedData.style = IconStyle[part];
        }
        else {
            folder.push(part);
        }
    }
    mappedData.folder = folder.join('-');
    return mappedData;
}
const args = (0, yargs_1.default)(process_1.default.argv.slice(2)).options({
    'source': {
        alias: 's',
        type: 'string',
        demandOption: true
    },
    'dbname': {
        alias: 'd',
        type: 'string',
        demandOption: true
    },
    'collection': {
        alias: 'c',
        type: 'string',
        demandOption: true
    }
}).parseSync();
dotenv_1.default.config();
const client = new mongodb_1.MongoClient(process_1.default.env.MONGODB_CONNECTION_STRING
    .replace('<<DB_NAME>>', args.dbname));
const data = [];
const DEST_DB = args.dbname;
const SRC_PATH = args.source;
const DEST_COLLECTION = args.collection;
const Schema = {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'folder', 'size', 'style', 'raw'],
            additionalProperties: false,
            properties: {
                _id: {},
                name: {
                    bsonType: 'string',
                    description: '(name: string) is required'
                },
                folder: {
                    bsonType: 'string',
                    description: '(folder: string) is required'
                },
                raw: {
                    bsonType: 'string',
                    description: '(raw: string) is required'
                },
                size: {
                    bsonType: 'int',
                    description: '(size: number) is required'
                },
                style: {
                    enum: [1, 2, 3],
                    description: 'Style is required and must be of type IconStyle["filled" | "regular" | "thin"]'
                }
            }
        }
    }
};
function ingestData() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        yield client.connect();
        const db = client.db(DEST_DB);
        console.log('Successfully connected to database server');
        (_a = db.collection(DEST_COLLECTION)) === null || _a === void 0 ? void 0 : _a.drop();
        db.createCollection(DEST_COLLECTION, Schema);
        const collection = db.collection(DEST_COLLECTION);
        const insertResult = yield collection.insertMany(data);
        console.log('Inserted documents => \n', insertResult);
        return 'DB INGEST DONE';
    });
}
function processSourceDir(srcPath, folderdepth) {
    fs_1.default.readdir(srcPath, (error, files) => {
        if (error) {
            console.error('Could not list the directory.', error);
            process_1.default.exit(1);
        }
        files.forEach((filePath, index) => {
            let file = path_1.default.join(srcPath, filePath);
            fs_1.default.stat(file, (error, stat) => {
                if (error) {
                    console.error('Error stating file.', error);
                    return;
                }
                if (stat.isDirectory()) {
                    // processSourceDir(file);
                    return;
                }
                else if (filePath.startsWith('.') || filePath.startsWith('_')) {
                    return;
                }
                if (filePath.includes('fluent_') || filePath.includes('ic_')) {
                    filePath = filePath.replace(/(ic_fluent_)/, '');
                }
                const fileData = fs_1.default.readFileSync(path_1.default.join(srcPath, filePath), 'utf8');
                const fileNameParts = [
                    ...filePath.replace(/\.[^/.]+/, '')
                        .replace(/[^a-z0-9]/gi, ' ')
                        .split(' ')
                ];
                const icon = iconMapper(filePath, fileData, fileNameParts);
                data.push(icon);
            });
        });
    });
}
processSourceDir(SRC_PATH, 0);
ingestData()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());
//# sourceMappingURL=build-database.js.map