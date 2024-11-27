import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Random } from './random.model';
import { IRandom } from './random.interface';

const createRandom = async (payload: IRandom): Promise<IRandom> => {
  const result = await Random.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create random!');
  }
  return result;
};

const getAllRandoms = async (search: string, page: number | null, limit: number | null): Promise<IRandom[]> => {
  const query = search ? { $or: [{ title: { $regex: search, $options: 'i' } },
        { arrString: { $regex: search, $options: 'i' } }] } : {};
  let queryBuilder = Random.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }

  return await queryBuilder;
};


const getRandomById = async (id: string): Promise<IRandom | null> => {
  const result = await Random.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Random not found!');
  }
  return result;
};

const updateRandom = async (id: string, payload: IRandom): Promise<IRandom | null> => {
  const isExistRandom = await getRandomById(id);
  if (!isExistRandom) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Random not found!');
  }
  const result = await Random.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update random!');
  }
  return result;
};

const deleteRandom = async (id: string): Promise<IRandom | null> => {
  const isExistRandom = await getRandomById(id);
  if (!isExistRandom) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Random not found!');
  }
  const result = await Random.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete random!');
  }
  return result;
};

export const RandomService = {
  createRandom,
  getAllRandoms,
  getRandomById,
  updateRandom,
  deleteRandom,
};
