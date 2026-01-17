/* eslint-env jest */
import * as format from './formatting';

describe('Formatting Utils', () => {
    test('formatDate handles valid and invalid dates', () => {
        expect(format.formatDate('2025-01-01')).toBe('1/1/2025');
        expect(format.formatDate(null)).toBe('Invalid Date');
    });

    test('formatPrice formats currency correctly', () => {
        expect(format.formatPrice(1250.5)).toBe('$1,250.50');
        expect(format.formatPrice(null)).toBe('$0.00');
        expect(format.formatPrice('abc')).toBe('$0.00');
    });

    test('formatStock returns correct status strings', () => {
        expect(format.formatStock(0)).toBe('Out of Stock');
        expect(format.formatStock(3)).toBe('Low Stock (3 left)');
        expect(format.formatStock(7)).toBe('Limited Stock (7 available)');
        expect(format.formatStock(15)).toBe('In Stock (15)');
        expect(format.formatStock('abc')).toBe('Out of Stock');
    });

    test('formatUserName handles various name combinations', () => {
        expect(format.formatUserName('john', 'doe')).toBe('John Doe');
        expect(format.formatUserName('john', '')).toBe('John');
        expect(format.formatUserName('', 'doe')).toBe('Doe');
        expect(format.formatUserName('', '')).toBe('Unknown User');
    });

    test('formatSearchTerm cleans and capitalizes terms', () => {
        expect(format.formatSearchTerm(' hello world ')).toBe('Hello World');
        expect(format.formatSearchTerm('')).toBe('');
    });
});