type Product = {
    id: string;
    nome: string;
    precoEmCentavos: number;
    imagemUrl: string;
    marca: string;
    categoria: string;
    width: number;
    height: number;
    length: number;
    weight: number;
    isFavorited?: boolean;
    descricao: string;
    estoque: number;
};
  

/**
 * Verifica se é possível adicionar uma determinada quantidade de um produto ao carrinho.
 *
 * @param product - O objeto do produto que contém o estoque disponível.
 * @param currentQuantity - Quantidade que já está no carrinho (ou 0 se não houver).
 * @param additionalQuantity - Quantidade que se deseja adicionar (padrão é 1).
 * @returns {boolean} - true se o estoque for suficiente, false caso contrário.
 */
export const canAddToCart = (
  product: Product,
  currentQuantity: number,
  additionalQuantity: number = 1
): boolean => {
  return product.estoque >= currentQuantity + additionalQuantity;
};
