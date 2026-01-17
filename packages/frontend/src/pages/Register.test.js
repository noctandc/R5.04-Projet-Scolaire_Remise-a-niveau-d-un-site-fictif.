import { render, screen, fireEvent, waitFor } from '@testing-library/react';
/* eslint-env jest */
import React from 'react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

import * as api from '../services/api';
import Register from './Register';

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

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders register form correctly', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Last Name/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  test('calls registerUser service and redirects on success', async () => {
    api.registerUser.mockResolvedValue({});

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'John', name: 'firstname' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'Doe', name: 'lastname' } });
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'newuser', name: 'username' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123', name: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(api.registerUser).toHaveBeenCalledWith({
        firstname: 'John',
        lastname: 'Doe',
        username: 'newuser',
        password: 'password123'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  test('displays error message on service failure', async () => {
    const errorResponse = {
      response: {
        data: {
          error: 'User already exists'
        }
      }
    };
    api.registerUser.mockRejectedValue(errorResponse);

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'existing', name: 'username' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'pass', name: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/User already exists/i)).toBeInTheDocument();
    });
  });
});
