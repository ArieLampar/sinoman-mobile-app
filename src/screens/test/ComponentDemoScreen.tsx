import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Input } from '../../components/common';
import { useAppTheme } from '../../theme';

export const ComponentDemoScreen: React.FC = () => {
  const theme = useAppTheme();
  const [inputValue, setInputValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Typography Demo */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, theme.custom.typography.h2]}>Typography</Text>
        <Text style={theme.custom.typography.h1}>Heading 1 - Inter Bold</Text>
        <Text style={theme.custom.typography.h2}>Heading 2 - Inter SemiBold</Text>
        <Text style={theme.custom.typography.h3}>Heading 3 - Inter SemiBold</Text>
        <Text style={theme.custom.typography.bodyLarge}>Body Large - Inter Regular</Text>
        <Text style={theme.custom.typography.bodyBase}>Body Base - Inter Regular</Text>
        <Text style={theme.custom.typography.bodySmall}>Body Small - Inter Regular</Text>
        <Text style={theme.custom.typography.caption}>Caption - Inter Regular</Text>
      </View>

      {/* Button Variants Demo */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, theme.custom.typography.h2]}>Buttons</Text>
        <Button variant="primary" onPress={() => {}}>
          Primary Button
        </Button>
        <View style={styles.gap} />
        <Button variant="secondary" onPress={() => {}}>
          Secondary Button
        </Button>
        <View style={styles.gap} />
        <Button variant="outline" onPress={() => {}}>
          Outline Button
        </Button>
        <View style={styles.gap} />
        <Button variant="ghost" onPress={() => {}}>
          Ghost Button
        </Button>
        <View style={styles.gap} />
        <Button variant="text" onPress={() => {}}>
          Text Button
        </Button>
        <View style={styles.gap} />
        <Button variant="primary" size="small" onPress={() => {}}>
          Small Button
        </Button>
        <View style={styles.gap} />
        <Button variant="primary" size="large" onPress={() => {}}>
          Large Button
        </Button>
        <View style={styles.gap} />
        <Button variant="primary" icon="heart" onPress={() => {}}>
          With Icon
        </Button>
      </View>

      {/* Card Variants Demo */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, theme.custom.typography.h2]}>Cards</Text>

        <Card variant="standard">
          <Text style={theme.custom.typography.h3}>Standard Card</Text>
          <Text style={theme.custom.typography.bodyBase}>
            This is a standard card with minimal elevation and rounded corners.
          </Text>
        </Card>

        <View style={styles.gap} />

        <Card variant="elevated">
          <Text style={theme.custom.typography.h3}>Elevated Card</Text>
          <Text style={theme.custom.typography.bodyBase}>
            This card has more elevation and larger border radius for emphasis.
          </Text>
        </Card>

        <View style={styles.gap} />

        <Card variant="glassmorphism">
          <Text style={theme.custom.typography.h3}>Glassmorphism Card</Text>
          <Text style={theme.custom.typography.bodyBase}>
            A modern glassmorphism effect with gradient and transparency.
          </Text>
        </Card>

        <View style={styles.gap} />

        <Card variant="elevated" onPress={() => alert('Card pressed!')}>
          <Text style={theme.custom.typography.h3}>Pressable Card</Text>
          <Text style={theme.custom.typography.bodyBase}>
            This card is pressable with a nice animation effect.
          </Text>
        </Card>
      </View>

      {/* Input Demo */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, theme.custom.typography.h2]}>Inputs</Text>

        <Input
          label="Email"
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Enter your email"
          leftIcon="email"
          keyboardType="email-address"
        />

        <Input
          label="Password"
          value={passwordValue}
          onChangeText={setPasswordValue}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          leftIcon="lock"
          rightIcon={showPassword ? 'eye-off' : 'eye'}
          onRightIconPress={() => setShowPassword(!showPassword)}
        />

        <Input
          label="Phone Number"
          value=""
          onChangeText={() => {}}
          placeholder="+62"
          leftIcon="phone"
          keyboardType="phone-pad"
          helperText="Enter your WhatsApp number"
        />

        <Input
          label="Amount"
          value=""
          onChangeText={() => {}}
          placeholder="0"
          leftIcon="cash"
          keyboardType="numeric"
          error="Amount must be at least Rp 10.000"
        />

        <Input
          label="Comments"
          value=""
          onChangeText={() => {}}
          placeholder="Enter your comments"
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Color Palette Demo */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, theme.custom.typography.h2]}>Colors</Text>

        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: theme.custom.colors.brand.primary }]} />
          <Text style={theme.custom.typography.bodySmall}>Primary</Text>
        </View>

        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: theme.custom.colors.brand.secondary }]} />
          <Text style={theme.custom.typography.bodySmall}>Secondary</Text>
        </View>

        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: theme.custom.colors.semantic.success }]} />
          <Text style={theme.custom.typography.bodySmall}>Success</Text>
        </View>

        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: theme.custom.colors.semantic.error }]} />
          <Text style={theme.custom.typography.bodySmall}>Error</Text>
        </View>

        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: theme.custom.colors.semantic.warning }]} />
          <Text style={theme.custom.typography.bodySmall}>Warning</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#111827',
  },
  gap: {
    height: 12,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});
