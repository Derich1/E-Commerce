// useBoxPacking.ts
import { useMemo } from 'react';

interface Box {
    id: number;
    name: string;
    height: number; // em cm
    width: number;  // em cm
    length: number; // em cm
}

interface ProductDimensions {
    length: number;
    width: number;
    height: number;
    weight: number;
    quantity: number;
}

type PackagingResult = {
    box: Box;
    products: ProductDimensions[]; // Produtos nesta caixa
  }[];
  

const generatePermutations = (dimensions: number[]): number[][] => {
  const result: number[][] = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      const permutation = [...dimensions];
      [permutation[0], permutation[i]] = [permutation[i], permutation[0]];
      [permutation[1], permutation[j]] = [permutation[j], permutation[1]];
      result.push(permutation);
    }
  }
  return Array.from(new Set(result.map(p => JSON.stringify(p)))).map(str => JSON.parse(str));
};

const calculateTotalVolume = (products: ProductDimensions[]): number => {
  return products.reduce((acc, product) => 
    acc + (product.length * product.width * product.height * product.quantity), 0); // Multiplica pela quantidade
};

const findMaxItemsPerBox = (product: ProductDimensions, box: Box) => {
  const boxDimensions = [box.length, box.width, box.height].sort((a, b) => a - b);
  let maxQuantity = 0;

  // Gera todas as permutações possíveis
  const permutations = generatePermutations([
    product.length,
    product.width,
    product.height,
  ]);

  for (const [l, w, h] of permutations) {
    // Calcula quantos cabem em cada dimensão
    const fitX = Math.floor(boxDimensions[2] / l);
    const fitY = Math.floor(boxDimensions[1] / w);
    const fitZ = Math.floor(boxDimensions[0] / h);
    
    const totalFit = fitX * fitY * fitZ;
    if (totalFit > maxQuantity) {
      maxQuantity = totalFit;
    }
  }

  return maxQuantity;
};

const findMinHeight = (product: ProductDimensions, box: Box): number | null => {
  const boxDimensions = [box.length, box.width].sort((a, b) => a - b);
  let minHeight = Infinity;

  const permutations = generatePermutations([
    product.length,
    product.width,
    product.height,
  ]);

  for (const [l, w, h] of permutations) {
    const productBase = [l, w].sort((a, b) => a - b);
    if (productBase[0] <= boxDimensions[0] && productBase[1] <= boxDimensions[1]) {
      if (h < minHeight) {
        minHeight = h;
      }
    }
  }

  return minHeight === Infinity ? null : minHeight;
};

const checkSingleBox = (products: ProductDimensions[], box: Box): boolean => {
  const totalVolume = calculateTotalVolume(products);
  const boxVolume = box.length * box.width * box.height;

  if (totalVolume > boxVolume) return false;

  let remainingHeight = box.height;
  
  for (const product of products) {
    const maxPerBox = findMaxItemsPerBox(product, box);
    if (maxPerBox < product.quantity) return false;
    
    const productHeight = findMinHeight(product, box)! * Math.ceil(product.quantity / maxPerBox);
    if (productHeight > remainingHeight) return false;
    
    remainingHeight -= productHeight;
  }

  return true;
};

const sortBoxesByVolume = (boxes: Box[]): Box[] => {
  return [...boxes].sort((a, b) => 
    (a.length * a.width * a.height) - (b.length * b.width * b.height));
};

export const useBoxPacking = (products: ProductDimensions[], boxes: Box[]) => {
  const sortedBoxes = useMemo(() => sortBoxesByVolume(boxes), [boxes]);

  const packProducts = (): PackagingResult | null => {
    // Agrupa produtos idênticos
    const groupedProductsMap = products.reduce((acc, product) => {
      const key = `${product.length}-${product.width}-${product.height}-${product.weight}`;
      if (acc[key]) {
        acc[key].quantity += product.quantity;
      } else {
        acc[key] = { ...product };
      }
      return acc;
    }, {} as Record<string, ProductDimensions>);

    const groupedProducts = Object.values(groupedProductsMap);

    // Tenta encontrar uma única caixa
    for (const box of sortedBoxes) {
      if (checkSingleBox(groupedProducts, box)) {
        return [{ box, products: groupedProducts }];
      }
    }

    // Bin packing para múltiplas caixas
    const remainingProducts = [...groupedProducts];
    const usedBoxes: PackagingResult = [];

    while (remainingProducts.length > 0) {
      let bestBox: Box | null = null;
      let bestProductIndex = -1;
      let maxQuantity = 0;

      // Encontra a melhor combinação caixa/produto
      for (const box of sortedBoxes) {
        remainingProducts.forEach((product, index) => {
          const quantityPerBox = findMaxItemsPerBox(product, box);
          const possibleQuantity = Math.min(quantityPerBox, product.quantity);
          
          if (possibleQuantity > maxQuantity) {
            maxQuantity = possibleQuantity;
            bestBox = box;
            bestProductIndex = index;
          }
        });
      }

      if (!bestBox || bestProductIndex === -1) return null;

      const productToPack = remainingProducts[bestProductIndex];
      const quantityToPack = Math.min(
        maxQuantity,
        productToPack.quantity
      );

      // Adiciona ao resultado
      usedBoxes.push({
        box: bestBox,
        products: [{
          ...productToPack,
          quantity: quantityToPack
        }]
      });

      // Atualiza a quantidade restante
      if (productToPack.quantity === quantityToPack) {
        remainingProducts.splice(bestProductIndex, 1);
      } else {
        remainingProducts[bestProductIndex] = {
          ...productToPack,
          quantity: productToPack.quantity - quantityToPack
        };
      }
    }

    return usedBoxes;
  };

  return { packProducts };
};