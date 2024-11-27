import { Model, Types } from 'mongoose';

export type IRandom = {
  title: string;
  products: [Types.ObjectId];
  arrString?: Array<string>;
  arrdate: Array<Date>;
  number: number
};

export type RandomModel = Model<IRandom>;
