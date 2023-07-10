export const formatArrayFilter = filter => {
  if (typeof filter === 'string') {
    return filter;
  }
  return '[' + filter.join('|') + ']';
};

export const formatProduct = ({ product, shopId, shopConfig }) => {
  const formatedProduct = {
    id: product.id,
    shopId,
    title: product.name,
    description: product.description,
    price: parseFloat(product.price),
    manufacturer: product.manufacturer_name,
    default_category: product.id_category_default,
    categories: product.associations.categories,
    imagesURL: [],
  };

  formatedProduct.imagesURL = product.associations?.images?.map(image => {
    return `${shopConfig.url}/${image.id}/image.jpg`;
  });

  return formatedProduct;
};

export const formatCategory = ({ category, shopId, shopConfig }) => {
  const formatedCategory = {
    id: category.id,
    shopId,
    name: category.name,
    description: category.description,
    imagePath: `${shopConfig.url}/img/tmp/category_${category.id}.jpg`,
  };

  return formatedCategory;
};
