import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import 'moment/locale/fr';
import 'moment/locale/es';
import 'moment/locale/de';

window._ = _;
window.moment = moment;

// Nettoyage : On ne log pas les versions en production (Best Practices)
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  console.log('Lodash version:', _.VERSION);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

const appRoot = ReactDOM.createRoot(rootElement);
appRoot.render(<App />);

if (isDev) {
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('Global error:', { message, source, lineno, colno, error });
    return false;
  };
}