const filterIncluded = (
  capitalizedModuleName: string,
  generateSearchFields: any,
  fields: any
) => {
  return `const getAll${capitalizedModuleName}s = async (queryFields: Record<string, any>): Promise<I${capitalizedModuleName}[]> => {
  const { search, page, limit } = queryFields;
    const query = search ? { $or: [${generateSearchFields(fields)}] } : {};
    let queryBuilder = ${capitalizedModuleName}.find(query);
  
    if (page && limit) {
      queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
    }
    delete queryFields.search;
    delete queryFields.page;
    delete queryFields.limit;
    queryBuilder.find(queryFields);
    return await queryBuilder;
  };`;
};

const filterNotIncluded = (capitalizedModuleName: string) => {
  return `const getAll${capitalizedModuleName}s = async (): Promise<I${capitalizedModuleName}[]> => {
    const result = await ${capitalizedModuleName}.find();
    return result;
  };`;
};
export const serviceLogicHelper = {
  filterIncluded,
  filterNotIncluded,
};
