/* eslint-env jest */
import { render } from '@testing-library/react';

import App from './App';

jest.mock(
  './pages/Login',
  () =>
    function MockLogin() {
      return <div data-testid="login-page">Login Page</div>;
    }
);

jest.mock(
  './pages/Register',
  () =>
    function MockRegister() {
      return <div data-testid="register-page">Register Page</div>;
    }
);

jest.mock(
  './pages/ProductList',
  () =>
    function MockProductList() {
      return <div data-testid="product-list">Product List</div>;
    }
);

jest.mock(
  './pages/AddProduct',
  () =>
    function MockAddProduct() {
      return <div data-testid="add-product">Add Product</div>;
    }
);

jest.mock(
  './pages/UserList',
  () =>
    function MockUserList() {
      return <div data-testid="user-list">User List</div>;
    }
);

describe('Frontend App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });
});
