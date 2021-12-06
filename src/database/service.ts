import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import type { Collection, Db } from 'mongodb';

export const collections: { icons?: Collection } = {};

export async function connectToDatabase() {
	dotenv.config();
	const client: MongoClient = new MongoClient(process.env.MONGODB_CONNECTION_STRING!);

	await client.connect();
	const db: Db = client.db(process.env.MONGODB_DB_NAME);
	
	collections.icons = db.collection('icons');
}