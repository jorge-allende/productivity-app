import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders productivity app', () => {
  render(<App />);
  const appTitle = screen.getByText(/productivity ui/i);
  expect(appTitle).toBeInTheDocument();
});
