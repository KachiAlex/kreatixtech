import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import SEO from '../components/SEO';

function renderWithProviders(ui) {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('SEO', () => {
  it('renders title and meta description', async () => {
    renderWithProviders(<SEO title="Test Page" description="Test description" pathname="/test" />);

    await waitFor(() => {
      expect(document.title).toBe('Test Page | Kreatix Technologies');
    });
    const metaDesc = document.querySelector('meta[name="description"]');
    expect(metaDesc).toBeTruthy();
    expect(metaDesc.getAttribute('content')).toBe('Test description');
  });

  it('renders default title when no title provided', async () => {
    renderWithProviders(<SEO />);

    await waitFor(() => {
      expect(document.title).toBe('Kreatix Technologies — Software, Cybersecurity & Cloud');
    });
  });

  it('adds noindex meta when noindex is true', async () => {
    renderWithProviders(<SEO title="Private" noindex />);

    await waitFor(() => {
      const robots = document.querySelector('meta[name="robots"]');
      expect(robots).toBeTruthy();
      expect(robots.getAttribute('content')).toBe('noindex, nofollow');
    });
  });
});
