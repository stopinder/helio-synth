import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
  },
}));

expect.extend(toHaveNoViolations);

describe('ErrorBoundary', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  beforeEach(() => {
    // Suppress console error
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders fallback when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('calls toast.error when an error occurs', () => {
    const { toast } = require('react-hot-toast');
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(toast.error).toHaveBeenCalledWith(
      'Something went wrong. Please try again.',
      expect.any(Object)
    );
  });

  it('renders custom fallback when provided', () => {
    const CustomFallback = () => <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should handle errors gracefully', async () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    const { container } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 