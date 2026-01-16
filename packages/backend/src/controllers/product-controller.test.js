/* eslint-env jest */
const productController = require('./product-controller');

const mockDatabase = {
  all: jest.fn(),
  get: jest.fn(),
  run: jest.fn()
};

jest.mock('../db/database', () => ({
  getDb: jest.fn(() => mockDatabase)
}));

describe('Product Controller', () => {
  let request;
  let response;

  beforeEach(() => {
    jest.clearAllMocks();
    request = { params: {}, body: {} };
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getAllProducts', () => {
    it('should return products with calculated details', async () => {
      // PREPARATION
      const mockProducts = [
        { id: 1, name: 'Produit A', price: 100 },
        { id: 2, name: 'Produit B', price: 200 }
      ];

      let controllerWorkPromise;

      mockDatabase.all.mockImplementation((query, parameters, callback) => {
        // eslint-disable-next-line unicorn/no-null
        controllerWorkPromise = callback(null, mockProducts);
      });

      mockDatabase.get.mockImplementation((query, parameters, callback) => {
        if (query.includes('COUNT')) {
          // eslint-disable-next-line unicorn/no-null
          callback(null, { total: 5 });
        } else if (query.includes('AVG')) {
          // eslint-disable-next-line unicorn/no-null
          callback(null, { avg: 150 });
        } else {
          // eslint-disable-next-line unicorn/no-null
          callback(null, {});
        }
      });

      // EXECUTION
      await productController.getAllProducts(request, response);

      if (controllerWorkPromise) await controllerWorkPromise;

      // VERIFICATION
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'success',
          data: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              cheaperCount: 5,
              avgPrice: 150
            })
          ])
        })
      );
    });
  });

  describe('createProduct', () => {
    it('should create a product and return id', () => {
      request.body = { name: 'Nouveau', price: 50, stock: 10 };

      mockDatabase.run.mockImplementation(function (query, parameters, callback) {
        const context = { lastID: 123, changes: 1 };
        // eslint-disable-next-line unicorn/no-null
        callback.call(context, null);
      });

      productController.createProduct(request, response);

      expect(response.status).toHaveBeenCalledWith(201);
      expect(response.json).toHaveBeenCalledWith({
        id: 123,
        name: 'Nouveau',
        price: 50,
        stock: 10
      });
    });
  });
});
