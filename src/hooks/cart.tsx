import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storageProducts) {
        setProducts([...JSON.parse(storageProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const productExists = products.find(_product => _product.id === product.id);

    let newProducts;

    if(productExists) {
      newProducts = products.map(_product => _product.id === product.id ? {...product, quantity: _product.quantity + 1} : _product)
      setProducts(newProducts);
    } else {
      newProducts = [...products, { ...product, quantity: 1 }];
      setProducts(newProducts);
    }

    await AsyncStorage.setItem(
      '@GoMarketplace:products',
      JSON.stringify(newProducts)
    )
  }, [products]);

  const increment = useCallback(async id => {
    const newProducts = products.map(product => product.id === id ? {...product, quantity: product.quantity + 1} : product);
    setProducts(newProducts);

    await AsyncStorage.setItem(
      '@GoMarketplace:products',
      JSON.stringify(newProducts)
    )
  }, [products]);

  const decrement = useCallback(async id => {
    let newProducts = products.map(product => {
      const quantity =  product.quantity === 0 ? 0 : product.quantity - 1;

      if(product.id === id) {
        return {
          ...product,
          quantity
        }
      } else {
        return product;
      }
    })

    newProducts = newProducts.filter(product => product.quantity !== 0);

    setProducts(newProducts);

    await AsyncStorage.setItem(
      '@GoMarketplace:products',
      JSON.stringify(newProducts)
    )
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
