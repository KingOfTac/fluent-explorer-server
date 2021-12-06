import express from 'express';
import type { Application } from 'express';
import bodyParser from 'body-parser';
import { mainRoutes, iconRoutes } from './routes';
import { connectToDatabase } from './database';

class App {
	public app: Application;

	constructor() {
		this.app = express();
		this.config();
	}

	private config(): void {
		connectToDatabase()
			.then(() => {
				this.app.use(bodyParser.json());
				this.app.use(bodyParser.urlencoded({ extended: false }));
				this.app.use('/', mainRoutes);
				this.app.use('/api/icons/', iconRoutes);
			})
			.catch((error) => {
				console.error('Database connection failed', error);
				process.exit();
			})
	}
}

export default new App().app;