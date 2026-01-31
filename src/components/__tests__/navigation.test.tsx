import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navigation } from '../navigation';

// Mock usePathname
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('Navigation Component', () => {
  it('should render all navigation items', () => {
    render(<Navigation />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Programs')).toBeInTheDocument();
    expect(screen.getByText('Students')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should highlight the active route', () => {
    render(<Navigation />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('text-foreground');
  });

  it('should have correct href attributes', () => {
    render(<Navigation />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');

    const programsLink = screen.getByText('Programs').closest('a');
    expect(programsLink).toHaveAttribute('href', '/dashboard/programs');
  });
});
