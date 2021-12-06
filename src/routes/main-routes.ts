import express, { Request, Response } from 'express';
import { mainController } from '../controllers';

class MainRoutes {
	public router: express.Router = express.Router();

	constructor() {
		this.config();
	}

	private config(): void {
		this.router.get('/', (req: Request, res: Response) => 
			mainController.root(req, res)
		);
	}
}

export const mainRoutes = new MainRoutes().router;