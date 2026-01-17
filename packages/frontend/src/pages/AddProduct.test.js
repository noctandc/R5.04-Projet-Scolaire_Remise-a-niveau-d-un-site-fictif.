import { render, screen, fireEvent, waitFor } from '@testing-library/react';
/* eslint-env jest */
import React from 'react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

import * as api from '../services/api';
import AddProduct from './AddProduct';

jest.mock('../services/api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('AddProduct Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form correctly', () => {
    render(
      <BrowserRouter>
        <AddProduct />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Add New Product/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Product Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Price')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Stock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Product/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  test('validates empty fields (Client-side validation)', async () => {
    render(
      <BrowserRouter>
        <AddProduct />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));

    expect(screen.getByText('All fields are required!')).toBeInTheDocument();
    expect(api.createProduct).not.toHaveBeenCalled();
  });

  test('creates product and redirects on success', async () => {
    api.createProduct.mockResolvedValue({});

    render(
      <BrowserRouter>
        <AddProduct />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Product Name'), { target: { value: 'New Phone' } });
    fireEvent.change(screen.getByPlaceholderText('Price'), { target: { value: '999' } });
    fireEvent.change(screen.getByPlaceholderText('Stock'), { target: { value: '50' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));

    await waitFor(() => {
      expect(api.createProduct).toHaveBeenCalledWith({
        name: 'New Phone',
        price: '999',
        stock: '50'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  test('displays error message on API failure', async () => {
    const errorResponse = {
      response: {
        data: {
          error: 'Product name already exists'
        }
      }
    };
    api.createProduct.mockRejectedValue(errorResponse);

    render(
      <BrowserRouter>
        <AddProduct />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Product Name'), { target: { value: 'Duplicate' } });
    fireEvent.change(screen.getByPlaceholderText('Price'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('Stock'), { target: { value: '10' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));

    await waitFor(() => {
      expect(screen.getByText('Product name already exists')).toBeInTheDocument();
    });
  });

  test('navigates back when cancel is clicked', () => {
    render(
      <BrowserRouter>
        <AddProduct />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/products');
  });
});
