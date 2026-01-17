const jwt = require('jsonwebtoken');

/* eslint-env jest */
const authMiddleware = require('./auth');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let request, response, next;

  beforeEach(() => {
    jest.clearAllMocks();

    request = { headers: {} };
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('should return 401 if no token is provided', () => {
    authMiddleware(request, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if token is invalid', () => {
    request.headers.authorization = 'Bearer invalid_token';

    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    authMiddleware(request, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ error: 'Failed to authenticate token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should call next() and attach user if token is valid', () => {
    request.headers.authorization = 'Bearer valid_token';
    const mockUser = { id: 1, username: 'testuser' };

    jwt.verify.mockReturnValue(mockUser);

    authMiddleware(request, response, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid_token', expect.any(String));

    expect(request.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });
});
