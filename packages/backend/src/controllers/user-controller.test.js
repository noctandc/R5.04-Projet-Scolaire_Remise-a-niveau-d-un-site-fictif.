/* eslint-env jest */
/* eslint-disable unicorn/no-null */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userController = require('./user-controller');

const mockDatabase = {
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn()
};

jest.mock('../db/database', () => ({
  getDb: jest.fn(() => mockDatabase)
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('User Controller', () => {
  let request;
  let response;

  beforeEach(() => {
    jest.clearAllMocks();
    request = { body: {} };
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // TESTS REGISTER
  describe('registerUser', () => {
    it('should create a new user successfully', () => {
      request.body = { username: 'test', password: 'pwd', firstname: 'John', lastname: 'Doe' };
      bcrypt.hashSync.mockReturnValue('hashed');
      jwt.sign.mockReturnValue('token');

      mockDatabase.run.mockImplementation(function (query, parameters, callback) {
        callback.call({ lastID: 1 }, null);
      });

      userController.registerUser(request, response);

      expect(response.status).toHaveBeenCalledWith(201);
      expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ auth: true }));
    });

    it('should return 500 on db error', () => {
      request.body = { username: 'test', password: 'pwd' };
      bcrypt.hashSync.mockReturnValue('hashed');
      mockDatabase.run.mockImplementation((q, p, callback) => callback(new Error('Fail')));

      userController.registerUser(request, response);
      expect(response.status).toHaveBeenCalledWith(500);
    });
  });

  // TESTS LOGIN
  describe('loginUser', () => {
    it('should login successfully', () => {
      request.body = { username: 'test', password: 'pwd' };
      mockDatabase.get.mockImplementation((q, p, callback) => callback(null, { id: 1, password: 'hash' }));
      bcrypt.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue('token');

      userController.loginUser(request, response);

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ auth: true }));
    });

    it('should return 404 if user not found', () => {
      request.body = { username: 'unknown', password: 'pwd' };
      mockDatabase.get.mockImplementation((q, p, callback) => callback(null));

      userController.loginUser(request, response);
      expect(response.status).toHaveBeenCalledWith(404);
    });
  });

  // TESTS GET ALL USERS
  describe('getAllUsers', () => {
    it('should return all users', () => {
      const users = [
        { id: 1, username: 'test' },
        { id: 2, username: 'test2' }
      ];

      mockDatabase.all.mockImplementation((query, parameters, callback) => {
        callback(null, users);
      });

      userController.getAllUsers(request, response);

      expect(response.json).toHaveBeenCalledWith(users);
    });

    it('should return 500 on db error', () => {
      mockDatabase.all.mockImplementation((q, p, callback) => callback(new Error('Fail')));

      userController.getAllUsers(request, response);
      expect(response.status).toHaveBeenCalledWith(500);
    });
  });

  // TESTS FIND SIMILAR USERNAMES
  describe('findSimilarUsernames', () => {
    it('should find similar users based on Levenshtein distance', () => {
      const users = [{ username: 'toto' }, { username: 'tata' }, { username: 'xylophone' }];

      mockDatabase.all.mockImplementation((query, parameters, callback) => {
        callback(null, users);
      });

      userController.findSimilarUsernames(request, response);

      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          similar: expect.arrayContaining([expect.objectContaining({ user1: 'toto', user2: 'tata' })])
        })
      );
    });

    it('should return 500 on db error', () => {
      mockDatabase.all.mockImplementation((q, p, callback) => callback(new Error('Fail')));
      userController.findSimilarUsernames(request, response);
      expect(response.status).toHaveBeenCalledWith(500);
    });
  });
});
