import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { JSONSchemaType } from 'ajv';
import { BaseController } from './base-controller';
import { IconStyle, Icon } from '../models';

interface IArgs {
	name?: string;
	folder?: string;
	size?: number;
	style?: IconStyle;
}

const schema: JSONSchemaType<IArgs> = {
	type: 'object',
	properties: {
		name: { type: 'string', nullable: true },
		folder: { type: 'string', nullable: true },
		size: { type: 'integer', nullable: true },
		style: { type: 'integer', nullable: true },
	},
	required: [],
	additionalProperties: false
};


class IconController extends BaseController<Icon> {
	constructor() {
		super(schema, { coerceTypes: true }, 'icons');
	}
}

export const iconController = new IconController();