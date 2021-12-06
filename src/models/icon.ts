import { ObjectId } from 'mongodb';

export enum IconStyle {
	'filled' = 1,
	'regular' = 2
};

export class Icon {
	constructor(
		public name: string,
		public folder: string,
		public raw: string,
		public size: number,
		public style: IconStyle,
		public id?: ObjectId
	) { }
}