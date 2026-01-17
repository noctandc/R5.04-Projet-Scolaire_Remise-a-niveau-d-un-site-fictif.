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
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getAllProducts', () => {
    it('should return all products with details', async () => {
      const products = [{ id: 1, name: 'Test', price: 10 }];

      mockDatabase.all.mockImplementation((query, parameters, callback) => callback(undefined, products));

      mockDatabase.get
        .mockImplementationOnce((query, parameters, callback) => callback(undefined, { total: 5 }))
        .mockImplementationOnce((query, parameters, callback) => callback(undefined, { avg: 20 }));
      await productController.getAllProducts(request, response);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'success',
          data: expect.arrayContaining([expect.objectContaining({ id: 1, cheaperCount: 5, avgPrice: 20 })])
        })
      );
    });

    it('should return 400 on db error', () => {
      mockDatabase.all.mockImplementation((query, parameters, callback) => callback(new Error('DB Error')));
      productController.getAllProducts(request, response);
      expect(response.status).toHaveBeenCalledWith(400);
    });
  });

  describe('createProduct', () => {
    it('should create a product and return id', () => {
      request.body = { name: 'Nouveau', price: 10, stock: 5 };

      mockDatabase.run.mockImplementation(function (query, parameters, callback) {
        callback.call({ lastID: 1 });
      });

      productController.createProduct(request, response);

      expect(response.status).toHaveBeenCalledWith(201);
      expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    });
    it('should return 500 on db error', () => {
      request.body = { name: 'N', price: 1, stock: 1 };
      mockDatabase.run.mockImplementation((query, parameters, callback) => callback(new Error('Fail')));

      productController.createProduct(request, response);
      expect(response.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getProduct', () => {
    it('should return a single product', () => {
      request.params.id = 1;
      const product = { id: 1, name: 'Test' };

      mockDatabase.get.mockImplementation((q, p, callback) => callback(undefined, product));

      productController.getProduct(request, response);

      expect(response.json).toHaveBeenCalledWith({
        message: 'success',
        data: product
      });
    });

    it('should return 400 on db error', () => {
      request.params.id = 1;
      mockDatabase.get.mockImplementation((query, parameters, callback) => callback(new Error('Fail')));
      productController.getProduct(request, response);
      expect(response.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateStock', () => {
    it('should update stock successfully', () => {
      request.params.id = 1;
      request.body = { stock: 10 };

      mockDatabase.run.mockImplementation(function (query, parameters, callback) {
        callback.call({ changes: 1 });
      });

      productController.updateStock(request, response);
      expect(response.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 404 if product not found', () => {
      request.params.id = 999;
      request.body = { stock: 10 };

      mockDatabase.run.mockImplementation(function (query, parameters, callback) {
        callback.call({ changes: 0 });
      });

      productController.updateStock(request, response);
      expect(response.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on db error', () => {
      request.params.id = 1;
      mockDatabase.run.mockImplementation((q, p, callback) => callback(new Error('Fail')));
      productController.updateStock(request, response);
      expect(response.status).toHaveBeenCalledWith(500);
    });
  });
});
