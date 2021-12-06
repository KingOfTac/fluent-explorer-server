import { Request, Response } from 'express';
import Ajv from 'ajv';
import type { ValidateFunction } from 'ajv';
import { collections } from '../database';

interface BaseController {
	defaultRouteHandler(req: Request, res: Response): Promise<void>;
}

export function createController (): {
	new <Model>(schema: any, validateOptions: any, collection: string): BaseController
} {
	return class<Model> extends (Object as any) implements BaseController {
		private validate: ValidateFunction;

		constructor (
			private schema: any,
			private validateOptions: any,
			private collection: string
		) {
			super();
			this.validate = new Ajv(validateOptions).compile(schema);
		}

		async defaultRouteHandler(req: Request, res: Response): Promise<void> {
			const params = { ...req?.body, ...req?.query };
			if (this.validate(params)) {
				const query = params;

				try {
					const data = (
						await collections[this.collection]
							.find(query)
							.toArray()
					) as Model[];

					if (data) {
						res.status(200).send(data);
					}
				} catch (error) {
					res.status(404).send(error);
				}
			} else {
				console.error(this.validate.errors);
				res.status(500).send(this.validate.errors);
			}
		}
	} as any;
}

export const BaseController = createController();