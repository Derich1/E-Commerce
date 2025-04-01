// useBoxPacking.ts
import { useMemo } from 'react';

export interface Product {
  id: string;
  nome: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  quantity: number;
}

export interface Box {
  id: number;
  name: string;
  height: number;
  width: number;
  length: number;
}

export type PackProduct = {
  product: Product;
  quantity: number;
  orientation: [number, number, number];
};

export type PackBox = {
  box: Box;
  products: PackProduct[];
};

export type PackagingResult = PackBox[];

const calculateBoxFit = (product: Product, box: Box) => {
  const boxDims = [box.length, box.width, box.height].sort((a, b) => a - b);
  let maxFit = 0;
  let bestOrientation: [number, number, number] = [0, 0, 0];

  const orientations: [number, number, number][] = [
    [product.length, product.width, product.height],
    [product.length, product.height, product.width],
    [product.width, product.length, product.height],
    [product.width, product.height, product.length],
    [product.height, product.length, product.width],
    [product.height, product.width, product.length],
  ];

  orientations.forEach(([l, w, h]) => {
    const sortedProd = [l, w, h].sort((a, b) => a - b);
    const fitX = Math.floor(boxDims[0] / sortedProd[0]);
    const fitY = Math.floor(boxDims[1] / sortedProd[1]);
    const fitZ = Math.floor(boxDims[2] / sortedProd[2]);
    const total = fitX * fitY * fitZ;
    if (total > maxFit) {
      maxFit = total;
      bestOrientation = [l, w, h];
    }
  });

  return { maxFit, bestOrientation };
};

const getBoxVolume = (box: Box): number => box.length * box.width * box.height;

const getProductVolume = (product: Product): number =>
  product.length * product.width * product.height;

const simulatePackingForBox = (products: Product[], box: Box): { result: PackagingResult; totalBoxes: number } => {
  let remainingProducts = products.map(p => ({ ...p }));
  const result: PackagingResult = [];
  const boxVolume = getBoxVolume(box);

  while (remainingProducts.some(p => p.quantity > 0)) {
    let usedVolume = 0;
    const currentBox: PackBox = { box, products: [] };

    const sortedProducts = [...remainingProducts].sort((a, b) =>
      getProductVolume(b) - getProductVolume(a)
    );

    sortedProducts.forEach(product => {
      if (product.quantity <= 0) return;

      const { maxFit, bestOrientation } = calculateBoxFit(product, box);
      if (maxFit <= 0) return;

      const prodVolume = getProductVolume(product);
      const availableVolumeUnits = Math.floor((boxVolume - usedVolume) / prodVolume);
      const qtyToPack = Math.min(product.quantity, maxFit, availableVolumeUnits);

      if (qtyToPack > 0) {
        currentBox.products.push({
          product: { ...product },
          quantity: qtyToPack,
          orientation: bestOrientation,
        });
        product.quantity -= qtyToPack;
        usedVolume += qtyToPack * prodVolume;
      }
    });

    result.push(currentBox);
    remainingProducts = remainingProducts.filter(p => p.quantity > 0);
  }

  return { result, totalBoxes: result.length };
};

export const useBoxPacking = (products: Product[], boxes: Box[]) => {
  const candidateBoxes = useMemo(() => 
    boxes.filter(box =>
      products.every(product => calculateBoxFit(product, box).maxFit > 0)
    ), [boxes, products]);

  const packingOptions = candidateBoxes.map(box => {
    const { result, totalBoxes } = simulatePackingForBox(products, box);
    return {
      box,
      result,
      totalBoxes,
      boxVolume: getBoxVolume(box)
    };
  });

  const validOptions = packingOptions.filter(option => option.totalBoxes === 1);

  const bestOption = validOptions.length > 0 
    ? validOptions.reduce((best, current) => 
        current.boxVolume < best.boxVolume ? current : best, validOptions[0])
    : null;

  const packProducts = (): PackagingResult => {
    if (!bestOption) {
      throw new Error('Nenhuma caixa disponível para conter todos os produtos.');
    }
    return bestOption.result;
  };

  return { packProducts };
};