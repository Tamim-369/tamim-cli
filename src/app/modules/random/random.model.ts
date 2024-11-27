import { Schema, model } from 'mongoose';
import { IRandom, RandomModel } from './random.interface';

const randomSchema = new Schema<IRandom, RandomModel>({
  title: { type: String, required: true },
  products: {
              type: [{ type: Schema.Types.ObjectId, ref: 'Product'},],
              required: true
            },
  arrString: {type: [String], required: false },
  arrdate: {type: [Date], required: true },
  number: { type: Number, required: true }
}, { timestamps: true });

export const Random = model<IRandom, RandomModel>('Random', randomSchema);
