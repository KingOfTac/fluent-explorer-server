import fs from 'fs';
import path from 'path';
import process from 'process';
import dotenv from 'dotenv';
import yargs from 'yargs/yargs';
import { MongoClient } from 'mongodb';
import type { Db, Collection, Document, InsertManyResult } from 'mongodb';

enum IconStyle {
	filled = 1,
	regular = 2,
	thin = 3
}

interface IconSchema {  
	name: string;
	folder: string;
	raw: string;
	size: number;
	style: IconStyle
}

function iconMapper(iconName: string, data: string, parts: string[]): IconSchema {
	const mappedData: IconSchema = ({
		name: iconName,
		raw: data
	} as IconSchema);
	const folder: string[] = [];

	for (const part of parts) {
		if (Number(part)) {
			mappedData.size = Number(part);
		} else if (IconStyle[part]) {
			mappedData.style = IconStyle[part];
		} else {
			folder.push(part);
		}
	}

	mappedData.folder = folder.join('-');

	return mappedData;
}

const args = yargs(process.argv.slice(2)).options({
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

dotenv.config();
const client = new MongoClient(
	process.env.MONGODB_CONNECTION_STRING!
		.replace('<<DB_NAME>>', args.dbname)
);
const data: IconSchema[] = [];
const DEST_DB: string = args.dbname;
const SRC_PATH: string = args.source;
const DEST_COLLECTION: string = args.collection;

const Schema = {
	validator: {
		$jsonSchema: {
			bsonType: 'object',
			required: ['name','folder','size','style','raw'],
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
					enum: [1,2,3],
					description: 'Style is required and must be of type IconStyle["filled" | "regular" | "thin"]'
				}
			}
		}
	}
}

async function ingestData(): Promise<string> {
	await client.connect();
	const db: Db = client.db(DEST_DB);
	console.log('Successfully connected to database server');

	db.collection(DEST_COLLECTION)?.drop();
	db.createCollection(DEST_COLLECTION, Schema);
	const collection: Collection<Document>
		= db.collection(DEST_COLLECTION);

	const insertResult: InsertManyResult<Document> =
		await collection.insertMany(data);

	console.log('Inserted documents => \n', insertResult);

	return 'DB INGEST DONE';
}

function processSourceDir(srcPath: string, folderdepth: number): void {
	fs.readdir(srcPath, (error, files) => {
		if (error) {
			console.error('Could not list the directory.', error);
			process.exit(1);
		}

		files.forEach((filePath, index) => {
			let file: string = path.join(srcPath, filePath);

			fs.stat(file, (error, stat) => {
				if (error) {
					console.error('Error stating file.', error);
					return;
				}

				if (stat.isDirectory()) {
					// processSourceDir(file);
					return;
				} else if (filePath.startsWith('.') || filePath.startsWith('_')) {
					return;
				}

				if (filePath.includes('fluent_') || filePath.includes('ic_')) {
					filePath = filePath.replace(/(ic_fluent_)/,'')
				}

				const fileData = fs.readFileSync(
					path.join(srcPath, filePath),
					'utf8'
				);
				
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