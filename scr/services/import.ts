// RCT
// CODEINTERNEARTICLE
// NOMPRODUIT
// CODEPRODUIT
// TAILLE
// CODECOLORIS
// LIBCOLORIS
// CODESAISONGESTION
// CODERAYON
// RAYON
// CODEFAMILLE
// FAMILLE
// CODESOUSFAMILLE
// SOUSFAMILLE
// PVINI
// PVVIGUEUR_FORUM
// IMAGE
// IMAGE2
// URL_PRODUIT

// id: string;
// shopId: string;
// title: string;
// description: string;
// price: number;
// manufacturer: string;
// default_category: string;
// categories: Array<string>;
// imagesURL: Array<string>;
// quantity: number;

import csv from 'csv-parser';
import fs from 'fs';
import * as productService from 'src/services/product';

export const importJennyferItems = async () => {
  const results = [];
  const shopId = 'pXXswmn5Y20xYGif1r3t';
  fs.createReadStream('src/data/ex jennyfer_base_articles_20221209.csv')
    .pipe(csv({ separator: '|' }))
    .on('data', data => results.push(data))
    .on('end', () => {
      const items = results.map(item => {
        const newItem = {
          shopId: shopId,
          title: item.NOMPRODUIT,
          description: '',
          price: formatPrice(item.PVVIGUEUR_FORUM),
          manufacturer: item.NOMPRODUIT,
          default_category: '',
          categories: [],
          imagesURL: [item.IMAGE, item.IMAGE2],
          quantity: 1,
        };
        return newItem;
      });

      items.forEach(async item => {
        await productService.create({ shopId, product: item });
      });
    });
};

const formatPrice = price => {
  price = price.replace('.', '');
  return parseInt(price, 10);
};
