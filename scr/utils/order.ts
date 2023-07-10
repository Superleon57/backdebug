const Addition = (number1: number, number2: number) => {
  number1 = typeof number1 === 'number' ? number1 : parseInt(number1, 10);
  number2 = typeof number2 === 'number' ? number2 : parseInt(number2, 10);
  return number1 + number2;
};

export const calculateTotalPerShop = (items, shopId) => {
  return items.reduce((acc, item) => {
    if (item.shopId === shopId) {
      acc += item.price;
    }
    return acc;
  }, 0);
};
