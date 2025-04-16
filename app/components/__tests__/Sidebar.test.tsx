import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Sidebar } from '../Sidebar';

expect.extend(toHaveNoViolations);

describe('Sidebar', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <Sidebar
        onNewSession={() => {}}
        onSelectSession={() => {}}
        currentSessionId={null}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should be keyboard accessible', async () => {
    const { container } = render(
      <Sidebar
        onNewSession={() => {}}
        onSelectSession={() => {}}
        currentSessionId={null}
      />
    );

    const results = await axe(container, {
      rules: {
        'keyboard-interactive': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });
}); 