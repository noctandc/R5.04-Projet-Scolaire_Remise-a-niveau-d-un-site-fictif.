/* eslint-env jest */
import * as val from './validation';

describe('Validation Utils', () => {
    test('validateEmail regex', () => {
        expect(val.validateEmail('test@test.com')).toBe(true);
        expect(val.validateEmail('invalid-email')).toBe(false);
    });

    test('validatePassword requirements', () => {
        expect(val.validatePassword('Password123').isValid).toBe(true);
        expect(val.validatePassword('short').isValid).toBe(false);
        expect(val.validatePassword('nonumberUppercase').isValid).toBe(false);
    });

    test('validateUser checks all fields', () => {
        const validUser = { firstname: 'A', lastname: 'B', username: 'abc', password: 'Password123' };
        expect(val.validateUser(validUser).isValid).toBe(true);

        const invalidUser = { firstname: '', username: 'a' };
        expect(val.validateUser(invalidUser).isValid).toBe(false);
    });

    test('validateProduct checks price and stock', () => {
        expect(val.validateProduct({ name: 'A', price: 10, stock: 5 }).valid).toBe(true);
        expect(val.validateProduct({ name: '', price: -1, stock: 'abc' }).valid).toBe(false);
    });
});