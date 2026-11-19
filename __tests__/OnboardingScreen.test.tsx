import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { OnboardingScreen } from '../src/features/onboarding/screens/OnboardingScreen';

describe('OnboardingScreen Component', () => {
  const mockNavigation: any = {
    replace: jest.fn(),
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  it('renders Step 1 baseline inputs correctly with ReactTestRenderer', async () => {
    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <OnboardingScreen navigation={mockNavigation} route={{} as any} />
      );
    });

    expect(tree).toBeDefined();
    const str = JSON.stringify(tree.toJSON());
    expect(str).toContain('Student Archetype');
    expect(str).toContain('Baseline Identity');
    expect(str).toContain('Day Scholar');
    expect(str).toContain('Hostel Resident');
    expect(str).toContain('Next Step');
  });
});
