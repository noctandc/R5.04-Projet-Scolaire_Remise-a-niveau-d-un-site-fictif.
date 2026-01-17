import { render, screen, fireEvent, waitFor } from '@testing-library/react';
/* eslint-env jest */
import React from 'react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

import * as api from '../services/api';
import Login from './Login';

jest.mock('../services/api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

beforeAll(() => {
  window.alert = jest.fn();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Login Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <Login onLogin={mockOnLogin} />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('calls loginUser service and redirects on success', async () => {
    api.loginUser.mockResolvedValue({});

    render(
      <BrowserRouter>
        <Login onLogin={mockOnLogin} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(api.loginUser).toHaveBeenCalledWith('testuser', 'password123');

      expect(mockOnLogin).toHaveBeenCalled();

      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  test('displays error message on service failure', async () => {
    api.loginUser.mockRejectedValue({ error: 'Invalid credentials' });

    render(
      <BrowserRouter>
        <Login onLogin={mockOnLogin} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
