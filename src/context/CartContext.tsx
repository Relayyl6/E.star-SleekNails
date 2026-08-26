'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: string;
  duration: string;
  image: string;
  quantity: number;
};

export type BookingDetails = {
  date: string | null;
  time: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  photoUrl: string | null;
};

type CartContextType = {
  items: CartItem[];
  bookingDetails: BookingDetails;
  setBookingDetails: React.Dispatch<React.SetStateAction<BookingDetails>>;
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    date: null,
    time: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    photoUrl: null
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedItems = localStorage.getItem('estar_cart');
    const savedDetails = localStorage.getItem('estar_booking_details');
    
    if (savedItems) {
      try { setItems(JSON.parse(savedItems)); } catch (e) {}
    }
    if (savedDetails) {
      try { setBookingDetails(JSON.parse(savedDetails)); } catch (e) {}
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('estar_cart', JSON.stringify(items));
      localStorage.setItem('estar_booking_details', JSON.stringify(bookingDetails));
    }
  }, [items, bookingDetails, isLoaded]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) return prev;
      return [...prev, item];
    });
    setIsOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) => {
      const existing = prev.find(i => i.id === id);
      if (!existing) return prev;
      
      const newQ = existing.quantity + delta;
      
      if (newQ <= 0) {
        return prev.filter(i => i.id !== id);
      }
      
      return prev.map(i => i.id === id ? { ...i, quantity: newQ } : i);
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter(i => i.id !== id));
  };

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
