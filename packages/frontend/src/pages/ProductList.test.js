import { render, screen, fireEvent, waitFor } from '@testing-library/react';
/* eslint-env jest */
import React from 'react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

import * as api from '../services/api';
import ProductList from './ProductList';

jest.mock('../services/api');

const mockProducts = [
  { id: 1, name: 'Cheap Apple', price: 20, stock: 100 },
  { id: 2, name: 'Medium Banana', price: 60, stock: 5 },
  { id: 3, name: 'Expensive Computer', price: 150, stock: 0 }
];

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('ProductList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders products correctly after fetching', async () => {
    api.getProducts.mockResolvedValue(mockProducts);

    render(
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
    );

    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    expect(screen.getByText('All Prices')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Cheap Apple')).toBeInTheDocument();
      expect(screen.getByText('Medium Banana')).toBeInTheDocument();
      expect(screen.getByText('Expensive Computer')).toBeInTheDocument();
    });

    expect(screen.getByText('Price: $20')).toBeInTheDocument();
    expect(screen.getByText('Stock: 100')).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    api.getProducts.mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load products')).toBeInTheDocument();
    });
  });

  // TEST DE LA RECHERCHE FLOUE
  test('filters products by fuzzy search', async () => {
    api.getProducts.mockResolvedValue(mockProducts);

    render(
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
    );

    await waitFor(() => screen.getByText('Cheap Apple'));

    const searchInput = screen.getByPlaceholderText('Search products...');

    fireEvent.change(searchInput, { target: { value: 'Banana' } });
    expect(screen.getByText('Medium Banana')).toBeInTheDocument();
    expect(screen.queryByText('Cheap Apple')).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'aple' } });
    expect(screen.getByText('Cheap Apple')).toBeInTheDocument();
    expect(screen.queryByText('Medium Banana')).not.toBeInTheDocument();
  });

  // TEST DU FILTRE PRIX
  test('filters products by price category', async () => {
    api.getProducts.mockResolvedValue(mockProducts);

    render(
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
    );

    await waitFor(() => screen.getByText('Cheap Apple'));

    const selects = screen.getAllByRole('combobox');
    const priceSelect = selects[0];

    fireEvent.change(priceSelect, { target: { value: 'low' } });
    expect(screen.getByText('Cheap Apple')).toBeInTheDocument();
    expect(screen.queryByText('Medium Banana')).not.toBeInTheDocument();

    fireEvent.change(priceSelect, { target: { value: 'high' } });
    expect(screen.getByText('Expensive Computer')).toBeInTheDocument();
    expect(screen.queryByText('Cheap Apple')).not.toBeInTheDocument();
  });

  // TEST DU FILTRE STOCK
  test('filters products by stock status', async () => {
    api.getProducts.mockResolvedValue(mockProducts);

    render(
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
    );

    await waitFor(() => screen.getByText('Cheap Apple'));

    const selects = screen.getAllByRole('combobox');
    const stockSelect = selects[1];

    fireEvent.change(stockSelect, { target: { value: 'out' } });
    expect(screen.getByText('Expensive Computer')).toBeInTheDocument();
    expect(screen.queryByText('Cheap Apple')).not.toBeInTheDocument();

    fireEvent.change(stockSelect, { target: { value: 'low' } });
    expect(screen.getByText('Medium Banana')).toBeInTheDocument();
    expect(screen.queryByText('Expensive Computer')).not.toBeInTheDocument();
  });

  test('shows message when no products match filters', async () => {
    api.getProducts.mockResolvedValue(mockProducts);

    render(
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
    );

    await waitFor(() => screen.getByText('Cheap Apple'));

    const searchInput = screen.getByPlaceholderText('Search products...');
    fireEvent.change(searchInput, { target: { value: 'XylophoneImpossible' } });

    expect(screen.getByText('No products found matching your criteria')).toBeInTheDocument();
  });
});
