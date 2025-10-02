import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import * as haptics from '../../../utils/haptics';

jest.mock('../../../utils/haptics');
jest.mock('../../../theme', () => ({
  useAppTheme: () => ({
    custom: {
      colors: {
        brand: {
          primary: '#0066CC',
        },
      },
      layoutSpacing: {
        borderRadius: {
          md: 8,
        },
        minTouchTarget: 44,
      },
    },
  }),
}));

describe('Button Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with primary variant by default', () => {
      const { getByText } = render(
        <Button onPress={jest.fn()}>Click Me</Button>
      );

      expect(getByText('Click Me')).toBeTruthy();
    });

    it('should render with secondary variant', () => {
      const { toJSON } = render(
        <Button variant="secondary" onPress={jest.fn()}>
          Secondary
        </Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render with outline variant', () => {
      const { toJSON } = render(
        <Button variant="outline" onPress={jest.fn()}>
          Outline
        </Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render with ghost variant', () => {
      const { toJSON } = render(
        <Button variant="ghost" onPress={jest.fn()}>
          Ghost
        </Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render with text variant', () => {
      const { toJSON } = render(
        <Button variant="text" onPress={jest.fn()}>
          Text
        </Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Sizes', () => {
    it('should render small button', () => {
      const { toJSON } = render(
        <Button size="small" onPress={jest.fn()}>
          Small
        </Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render medium button by default', () => {
      const { toJSON } = render(
        <Button onPress={jest.fn()}>Medium</Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render large button', () => {
      const { toJSON } = render(
        <Button size="large" onPress={jest.fn()}>
          Large
        </Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when clicked', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button onPress={mockOnPress}>Click Me</Button>
      );

      fireEvent.press(getByText('Click Me'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should trigger haptic feedback on press', () => {
      (haptics.lightImpact as jest.Mock).mockResolvedValue(undefined);
      const { getByText } = render(
        <Button onPress={jest.fn()}>Click Me</Button>
      );

      fireEvent.press(getByText('Click Me'));

      expect(haptics.lightImpact).toHaveBeenCalled();
    });

    it('should not call onPress when disabled', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button onPress={mockOnPress} disabled>
          Disabled
        </Button>
      );

      fireEvent.press(getByText('Disabled'));

      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should not call onPress when loading', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button onPress={mockOnPress} loading>
          Loading
        </Button>
      );

      fireEvent.press(getByText('Loading'));

      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('States', () => {
    it('should show loading state', () => {
      const { toJSON } = render(
        <Button onPress={jest.fn()} loading>
          Loading
        </Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should show disabled state', () => {
      const { toJSON } = render(
        <Button onPress={jest.fn()} disabled>
          Disabled
        </Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Props', () => {
    it('should render with icon', () => {
      const { toJSON } = render(
        <Button onPress={jest.fn()} icon="check">
          With Icon
        </Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render full width', () => {
      const { toJSON } = render(
        <Button onPress={jest.fn()} fullWidth>
          Full Width
        </Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should apply custom style', () => {
      const customStyle = { marginTop: 20, backgroundColor: 'red' };
      const { toJSON } = render(
        <Button onPress={jest.fn()} style={customStyle}>
          Custom Style
        </Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible', () => {
      const { getByText } = render(
        <Button onPress={jest.fn()}>Accessible Button</Button>
      );

      const button = getByText('Accessible Button');
      expect(button).toBeTruthy();
    });

    it('should indicate disabled state for accessibility', () => {
      const { toJSON } = render(
        <Button onPress={jest.fn()} disabled>
          Disabled
        </Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty onPress', () => {
      const { getByText } = render(
        <Button onPress={() => {}}>Empty Handler</Button>
      );

      expect(() => fireEvent.press(getByText('Empty Handler'))).not.toThrow();
    });

    it('should handle async onPress', async () => {
      const mockAsyncPress = jest.fn().mockResolvedValue(undefined);
      const { getByText } = render(
        <Button onPress={mockAsyncPress}>Async</Button>
      );

      fireEvent.press(getByText('Async'));

      expect(mockAsyncPress).toHaveBeenCalled();
    });
  });
});
