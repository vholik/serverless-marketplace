export const slugify = (string: string): string =>
  string
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

export const isValidSlug = (value: string): boolean => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
};
