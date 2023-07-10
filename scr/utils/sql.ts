export const extractCount = (results) => results.reduce((acc, { count, ...column }) => {
  acc.count = count;
  acc.results.push(column);
  return acc;
}, { results: [], count: 0 });


export const removeUndefinedParams = (params) => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
};
