/* eslint-env jest */
import { renderHook, act } from '@testing-library/react';

import { useAuth } from './useAuth';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('initializes with no user', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
  });

  test('login updates state', () => {
    const { result } = renderHook(() => useAuth());
    const user = { username: 'test' };

    act(() => {
      result.current.login('token', user);
    });

    expect(result.current.user).toEqual(user);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('logout clears state', () => {
    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.logout();
    });
    expect(result.current.user).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
