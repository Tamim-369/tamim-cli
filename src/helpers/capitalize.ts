export const capitalizedName = (name: string) => {
  return name[0].toUpperCase() + name.slice(1);
};
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
