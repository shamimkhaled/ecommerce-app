import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'MacBook Pro 14"',
    description: 'The most powerful MacBook Pro ever. With the blazing-fast M3 Pro or M3 Max chip.',
    price: 1999,
    category: 'Laptops',
    image: 'https://picsum.photos/seed/macbookpro/800/1000',
    rating: 4.9,
    reviewsCount: 1240,
    stock: 50,
    brand: 'Apple',
    isFeatured: true,
    discount: 10,
    specs: {
      'Display': '14.2-inch Liquid Retina XDR',
      'Processor': 'Apple M3 Pro chip',
      'Memory': '18GB Unified Memory',
      'Storage': '512GB SSD'
    }
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    description: 'Titanium design. A17 Pro chip. A customizable Action button. The most powerful iPhone ever.',
    price: 999,
    category: 'Smartphones',
    image: 'https://picsum.photos/seed/iphone15pro/800/1000',
    rating: 4.8,
    reviewsCount: 850,
    stock: 30,
    brand: 'Apple',
    isFeatured: true,
    specs: {
      'Display': '6.1-inch Super Retina XDR',
      'Processor': 'A17 Pro chip',
      'Camera': '48MP Main | Ultra Wide',
      'Battery': 'Up to 23 hours video'
    }
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling headphones with exceptional sound quality.',
    price: 399,
    category: 'Audio',
    image: 'https://picsum.photos/seed/sonywh/800/1000',
    rating: 4.7,
    reviewsCount: 2100,
    stock: 100,
    brand: 'Sony',
    isFeatured: true,
    specs: {
      'Battery Life': 'Up to 30 hours',
      'Noise Canceling': 'Dual Noise Sensor',
      'Connectivity': 'Bluetooth 5.2',
      'Weight': '250g'
    }
  },
  {
    id: '4',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'The ultimate Galaxy smartphone with built-in S Pen and AI features.',
    price: 1299,
    category: 'Smartphones',
    image: 'https://picsum.photos/seed/s24u/800/1000',
    rating: 4.8,
    reviewsCount: 980,
    stock: 45,
    brand: 'Samsung',
    discount: 15,
    specs: {
      'Display': '6.8-inch Dynamic AMOLED 2X',
      'Processor': 'Snapdragon 8 Gen 3',
      'Camera': '200MP Main',
      'Battery': '5000mAh'
    }
  }
];

export const categories = [
  'All',
  'Smartphones',
  'Laptops',
  'Audio',
  'Tablets',
  'Accessories',
  'Gaming'
];
