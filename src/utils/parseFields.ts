export const parseFields = (fields: string[]) => {
  return fields.map((field: string) => {
    if (!field) {
      throw new Error("Field definition cannot be empty");
    }

    const [fieldName, fieldType] = field?.includes("?:")
      ? field.replace("?:", ":").split(":")
      : field.split(":");

    if (!fieldName || !fieldType) {
      throw new Error(
        `Invalid field format: ${field}. Expected format: name:type`
      );
    }
    return {
      name: fieldName.trim(),
      type: fieldType.trim(),
      isRequired: !field.toString().includes("?"),
    };
  });
};
