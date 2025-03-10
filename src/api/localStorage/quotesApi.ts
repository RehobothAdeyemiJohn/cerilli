
import { Quote } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { KEYS, initLocalStorage } from './storageUtils';

export const quotesApi = {
  getAll: async (): Promise<Quote[]> => {
    initLocalStorage();
    const data = localStorage.getItem(KEYS.QUOTES);
    return data ? JSON.parse(data) : [];
  },
  
  getById: async (id: string): Promise<Quote> => {
    const quotes = await quotesApi.getAll();
    const quote = quotes.find(q => q.id === id);
    if (!quote) {
      throw new Error('Preventivo non trovato');
    }
    return quote;
  },
  
  create: async (quote: Omit<Quote, 'id'>): Promise<Quote> => {
    const quotes = await quotesApi.getAll();
    const newQuote = {
      ...quote,
      id: uuidv4(),
    };
    
    quotes.push(newQuote);
    localStorage.setItem(KEYS.QUOTES, JSON.stringify(quotes));
    
    return newQuote;
  },
  
  update: async (id: string, updates: Partial<Quote>): Promise<Quote> => {
    const quotes = await quotesApi.getAll();
    const index = quotes.findIndex(q => q.id === id);
    
    if (index === -1) {
      throw new Error('Preventivo non trovato');
    }
    
    const updatedQuote = {
      ...quotes[index],
      ...updates,
    };
    
    quotes[index] = updatedQuote;
    localStorage.setItem(KEYS.QUOTES, JSON.stringify(quotes));
    
    return updatedQuote;
  },
  
  delete: async (id: string): Promise<void> => {
    const quotes = await quotesApi.getAll();
    const filteredQuotes = quotes.filter(q => q.id !== id);
    
    if (filteredQuotes.length === quotes.length) {
      throw new Error('Preventivo non trovato');
    }
    
    localStorage.setItem(KEYS.QUOTES, JSON.stringify(filteredQuotes));
  }
};
