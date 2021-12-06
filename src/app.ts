import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import type { Application } from 'express';

import { mainRoutes, iconRoutes } from './routes';
import { connectToDatabase } from './database';

class App {
	public app: Application;

	constructor() {
		this.app = express();
		this.config();
	}

	private config(): void {
		this.app.use(helmet());
		this.app.use(cors());
		this.app.use(compression());

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