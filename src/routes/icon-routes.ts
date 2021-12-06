import express, { Request, Response } from 'express';
import { iconController } from '../controllers';

class IconRoutes {
	public router: express.Router = express.Router();

	constructor() {
		this.config();
	}

	private config(): void {
		this.router.use(express.json());

		this.router.get('/', (req: Request, res: Response) => 
			iconController.defaultRouteHandler(req, res)
		);

		this.router.post('/', (req: Request, res: Response) => 
			iconController.defaultRouteHandler(req, res)
		);
		
		// this.router.get('/:folder/:name', (req: Request, res: Response) => 
		// 	iconController.name(req, res)
		// );

		// this.router.get('/:folder', (req: Request, res: Response) =>
		// 	iconController.folder(req, res)
		// );
	}
}

export const iconRoutes = new IconRoutes().router;