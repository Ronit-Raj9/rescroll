import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Switch, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows, Glows } from '@/constants/Colors';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import GlowCard from '@/components/GlowCard';

export default function DesignDemo() {
  const [switchValue, setSwitchValue] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [secureValue, setSecureValue] = useState('');
  
  // Color swatches for our grayscale palette
  const greyScale = [
    { name: 'Background', color: Colors.light.background, textColor: Colors.light.text },
    { name: 'Surface', color: Colors.light.backgroundSecondary, textColor: Colors.light.text },
    { name: 'Element', color: Colors.light.backgroundTertiary, textColor: Colors.light.text },
    { name: 'TextSecondary', color: Colors.light.textSecondary, textColor: '#fff' },
    { name: 'TextPrimary', color: Colors.light.text, textColor: '#fff' },
    { name: 'DeepGrey', color: '#3A3A3C', textColor: '#fff' },
  ];
  
  // Accent color swatches
  const accentColors = [
    { name: 'Neon Blue', color: Colors.light.primary, textColor: '#fff' },
    { name: 'Subtle Blue', color: Colors.light.secondary, textColor: '#fff' },
    { name: 'Glow Blue', color: Colors.light.primaryLight, textColor: Colors.light.text },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Design System</Text>
        <Text style={styles.headerSubtitle}>Minimalist Sci-Fi Experience</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Color Palette Section */}
        <Card style={styles.section} variant="outlined">
          <Text style={styles.sectionTitle}>Grayscale Palette</Text>
          <View style={styles.colorsContainer}>
            {greyScale.map((item, index) => (
              <View key={index} style={styles.colorSwatchContainer}>
                <View 
                  style={[
                    styles.colorSwatch, 
                    { backgroundColor: item.color }
                  ]}
                >
                  <Text style={[styles.colorName, { color: item.textColor }]}>
                    {item.name}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          
          <Text style={[styles.sectionTitle, styles.marginTop]}>Accent Colors</Text>
          <View style={styles.colorsContainer}>
            {accentColors.map((item, index) => (
              <View key={index} style={styles.colorSwatchContainer}>
                <View 
                  style={[
                    styles.colorSwatch, 
                    { backgroundColor: item.color }
                  ]}
                >
                  <Text style={[styles.colorName, { color: item.textColor }]}>
                    {item.name}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
        
        {/* Typography Section */}
        <Card style={styles.section} variant="outlined">
          <Text style={styles.sectionTitle}>Typography</Text>
          <View style={styles.typographyContainer}>
            <Text style={styles.xxxl}>XXXL (32px)</Text>
            <Text style={styles.xxl}>XXL (24px)</Text>
            <Text style={styles.xl}>XL (20px)</Text>
            <Text style={styles.lg}>Large (18px)</Text>
            <Text style={styles.md}>Medium (16px)</Text>
            <Text style={styles.sm}>Small (14px)</Text>
            <Text style={styles.xs}>XS (12px)</Text>
          </View>
        </Card>
        
        {/* Button Variants */}
        <Card style={styles.section} variant="outlined">
          <Text style={styles.sectionTitle}>Button Variants</Text>
          
          <View style={styles.buttonContainer}>
            <Button title="Primary" onPress={() => {}} variant="primary" />
            <Button title="Secondary" onPress={() => {}} variant="secondary" />
            <Button title="Outline" onPress={() => {}} variant="outline" />
            <Button title="Ghost" onPress={() => {}} variant="ghost" />
            <Button title="Minimal" onPress={() => {}} variant="minimal" />
            <Button 
              title="Glow" 
              onPress={() => {}} 
              variant="glow" 
            />
          </View>
        </Card>
        
        {/* Card Variants */}
        <Text style={[styles.sectionTitle, styles.marginTop]}>Card Variants</Text>
        
        <View style={styles.cardGridContainer}>
          <Card style={styles.demoCard} variant="default">
            <Text style={styles.cardTitle}>Default Card</Text>
            <Text style={styles.cardText}>Border with white background</Text>
          </Card>
          
          <Card style={styles.demoCard} variant="elevated">
            <Text style={styles.cardTitle}>Elevated Card</Text>
            <Text style={styles.cardText}>With shadow effect</Text>
          </Card>
          
          <Card style={styles.demoCard} variant="outlined">
            <Text style={styles.cardTitle}>Outlined Card</Text>
            <Text style={styles.cardText}>Border with transparent bg</Text>
          </Card>
          
          <Card style={styles.demoCard} variant="interactive">
            <Text style={styles.cardTitle}>Interactive Card</Text>
            <Text style={styles.cardText}>For clickable areas</Text>
          </Card>
        </View>
        
        {/* Glow Card Demo */}
        <Text style={[styles.sectionTitle, styles.marginTop]}>Glow Effects</Text>
        
        <View style={styles.cardGridContainer}>
          <GlowCard style={styles.demoCard} intensity="subtle">
            <Text style={styles.cardTitle}>Subtle Glow</Text>
            <Text style={styles.cardText}>Soft blue halo effect</Text>
          </GlowCard>
          
          <GlowCard style={styles.demoCard} intensity="medium">
            <Text style={styles.cardTitle}>Medium Glow</Text>
            <Text style={styles.cardText}>More prominent glow</Text>
          </GlowCard>
          
          <GlowCard style={styles.demoCard} intensity="strong">
            <Text style={styles.cardTitle}>Strong Glow</Text>
            <Text style={styles.cardText}>Intense neon effect</Text>
          </GlowCard>
          
          <GlowCard 
            style={styles.demoCard} 
            intensity="subtle"
            onPress={() => alert('Clicked!')}
          >
            <Text style={styles.cardTitle}>Interactive</Text>
            <Text style={styles.cardText}>Tap me!</Text>
          </GlowCard>
        </View>
        
        {/* Input Fields */}
        <Card style={styles.section} variant="outlined">
          <Text style={styles.sectionTitle}>Input Fields</Text>
          
          <Input
            label="Standard Input"
            placeholder="Type something..."
            value={inputValue}
            onChangeText={setInputValue}
            leftIcon="mail"
          />
          
          <Input
            label="Password Input"
            placeholder="Enter password"
            value={secureValue}
            onChangeText={setSecureValue}
            secureTextEntry
          />
          
          <Input
            label="Disabled Input"
            placeholder="You can't edit this"
            value="Disabled content"
            onChangeText={() => {}}
            disabled
          />
          
          <Input
            label="Error State"
            placeholder="Try again"
            value=""
            onChangeText={() => {}}
            error="This field cannot be empty"
          />
        </Card>
        
        {/* Icons */}
        <Card style={styles.section} variant="outlined">
          <Text style={styles.sectionTitle}>Icons</Text>
          
          <View style={styles.iconsContainer}>
            <View style={styles.iconItem}>
              <Feather name="home" size={24} color={Colors.light.icon} />
              <Text style={styles.iconName}>home</Text>
            </View>
            
            <View style={styles.iconItem}>
              <Feather name="search" size={24} color={Colors.light.icon} />
              <Text style={styles.iconName}>search</Text>
            </View>
            
            <View style={styles.iconItem}>
              <Feather name="bookmark" size={24} color={Colors.light.icon} />
              <Text style={styles.iconName}>bookmark</Text>
            </View>
            
            <View style={styles.iconItem}>
              <Feather name="settings" size={24} color={Colors.light.icon} />
              <Text style={styles.iconName}>settings</Text>
            </View>
            
            <View style={styles.iconItem}>
              <Feather name="user" size={24} color={Colors.light.primary} />
              <Text style={styles.iconName}>user (active)</Text>
            </View>
            
            <View style={styles.iconItem}>
              <Feather name="send" size={24} color={Colors.light.primary} />
              <Text style={styles.iconName}>send (active)</Text>
            </View>
          </View>
        </Card>
        
        {/* Other UI Elements */}
        <Card style={styles.section} variant="outlined">
          <Text style={styles.sectionTitle}>Other UI Elements</Text>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Toggle Switch</Text>
            <Switch
              value={switchValue}
              onValueChange={setSwitchValue}
              trackColor={{ false: Colors.light.backgroundTertiary, true: Colors.light.primaryLight }}
              thumbColor={switchValue ? Colors.light.primary : Colors.light.backgroundSecondary}
            />
          </View>
          
          <View style={styles.separator} />
          
          <TouchableOpacity style={styles.listItem}>
            <Feather name="help-circle" size={24} color={Colors.light.icon} />
            <Text style={styles.listItemText}>Help & Support</Text>
            <Feather name="chevron-right" size={18} color={Colors.light.icon} />
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity style={styles.listItem}>
            <Feather name="info" size={24} color={Colors.light.icon} />
            <Text style={styles.listItemText}>About ReScroll</Text>
            <Feather name="chevron-right" size={18} color={Colors.light.icon} />
          </TouchableOpacity>
        </Card>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Intellectual Minimalist Sci-Fi Design System © {new Date().getFullYear()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '600',
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  scrollView: {
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  marginTop: {
    marginTop: Spacing.lg,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  colorSwatchContainer: {
    width: '33.33%',
    padding: Spacing.xs,
  },
  colorSwatch: {
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  colorName: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  typographyContainer: {
    marginTop: Spacing.sm,
  },
  xxxl: {
    fontSize: FontSizes.xxxl,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  xxl: {
    fontSize: FontSizes.xxl,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  xl: {
    fontSize: FontSizes.xl,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  lg: {
    fontSize: FontSizes.lg,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  md: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  sm: {
    fontSize: FontSizes.sm,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  xs: {
    fontSize: FontSizes.xs,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  cardGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
    marginBottom: Spacing.lg,
  },
  demoCard: {
    width: '50%',
    padding: Spacing.xs,
    height: 120,
    margin: 0,
  },
  cardTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  cardText: {
    fontSize: FontSizes.sm,
    color: Colors.light.textSecondary,
  },
  iconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
  },
  iconItem: {
    width: '33.33%',
    padding: Spacing.md,
    alignItems: 'center',
  },
  iconName: {
    fontSize: FontSizes.xs,
    color: Colors.light.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  switchLabel: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  listItemText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.light.text,
    marginLeft: Spacing.md,
  },
  footer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSizes.xs,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
}); 