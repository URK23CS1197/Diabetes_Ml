import { render, screen } from '@testing-library/react';
import App from './App';

test('renders diabetes risk assessment title', () => {
  render(<App />);
  const titleElement = screen.getByText(/diabetes risk assessment/i);
  expect(titleElement).toBeInTheDocument();
});
