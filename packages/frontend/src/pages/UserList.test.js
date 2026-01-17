import { render, screen, fireEvent, waitFor } from '@testing-library/react';
/* eslint-env jest */
import React from 'react';
import '@testing-library/jest-dom';

import * as api from '../services/api';
import UserList from './UserList';

jest.mock('../services/api');

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const mockUsers = [
  { id: 1, firstname: 'John', lastname: 'Doe', username: 'jdoe', created_at: daysAgo(2) },
  { id: 2, firstname: 'Alice', lastname: 'Smith', username: 'alice', created_at: daysAgo(15) },
  { id: 3, firstname: 'Bob', lastname: 'Oldman', username: 'bobby', created_at: daysAgo(40) }
];

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('UserList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders users correctly', async () => {
    api.getUsers.mockResolvedValue(mockUsers);
    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Oldman')).toBeInTheDocument();
    });
  });

  test('filters users by search term', async () => {
    api.getUsers.mockResolvedValue(mockUsers);
    render(<UserList />);
    await waitFor(() => screen.getByText('John Doe'));

    const searchInput = screen.getByPlaceholderText('Search users...');

    fireEvent.change(searchInput, { target: { value: 'Alice' } });
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  test('filters users by join date', async () => {
    api.getUsers.mockResolvedValue(mockUsers);
    render(<UserList />);
    await waitFor(() => screen.getByText('John Doe'));

    const selects = screen.getAllByRole('combobox');
    const dateFilter = selects[0];

    fireEvent.change(dateFilter, { target: { value: 'week' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
  });

  test('sorts users', async () => {
    api.getUsers.mockResolvedValue(mockUsers);
    render(<UserList />);
    await waitFor(() => screen.getByText('John Doe'));

    const selects = screen.getAllByRole('combobox');
    const sortSelect = selects[1];

    fireEvent.change(sortSelect, { target: { value: 'name' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });
});
