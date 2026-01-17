/* eslint-env jest */
import axios from 'axios';
import * as api from './api';

jest.mock('axios');

describe('API Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    test('loginUser saves data to localStorage', async () => {
        const mockData = { data: { token: 'abc', user: { name: 'test' } } };
        axios.post.mockResolvedValue(mockData);

        await api.loginUser('user', 'pass');

        expect(localStorage.getItem('token')).toBe('abc');
        expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/auth/login'), {
        username: 'user',
        password: 'pass'
        });
    });

    test('getUsers calls with authorization header', async () => {
        localStorage.setItem('token', 'fake_token');
        axios.get.mockResolvedValue({ data: [] });

        await api.getUsers();

        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/auth/users'), {
        headers: { Authorization: 'Bearer fake_token' }
        });
    });

    test('getProducts processes cheapest and expensive logic', async () => {
        const mockProducts = {
        data: {
            data: [
            { id: 1, name: 'Cheap', price: 10 },
            { id: 2, name: 'Expensive', price: 100 }
            ]
        }
        };
        axios.get.mockResolvedValue(mockProducts);

        const result = await api.getProducts();

        expect(result[0].isCheapest).toBe(true);
        expect(result[1].isCheapest).toBe(false);
        expect(result[0].moreExpensiveCount).toBe(1);
        expect(result[1].moreExpensiveCount).toBe(0);
    });

    test('logout clears localStorage', () => {
        localStorage.setItem('token', 'val');
        api.logout();
        expect(localStorage.getItem('token')).toBeNull();
    });
});