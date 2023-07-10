export const isNullOrEmpty = (val) => {
  if (val === undefined || val === null || val.trim() === "") {
    return true;
  }
  return false;
};