import React, { useState, useContext } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Image, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../app/_layout';
import { IconSymbol } from '../ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { setIsAuthenticated, setBypassAuth } = useContext(AuthContext);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];

  const handleLogin = () => {
    // TODO: Implement actual authentication logic
    console.log('Login attempt with:', email, password);
    // Set authenticated status to true
    setIsAuthenticated(true);
    // Navigate to the home page
    router.replace('/(tabs)');
  };

  const navigateToSignup = () => {
    router.push('/signup');
  };
  
  const handleGetStarted = () => {
    // Set bypass auth to true to skip authentication checks
    setBypassAuth(true);
    // Navigate to the app
    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.logoContainer}>
          <ThemedText style={styles.formTitle}>Log In</ThemedText>
          <ThemedText style={styles.tagline}>Welcome back to ReScroll</ThemedText>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <IconSymbol name="person.circle" size={20} color={colors.darkGray} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email or Username"
              placeholderTextColor={colors.darkGray}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <IconSymbol name="bookmark" size={20} color={colors.darkGray} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.darkGray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <ThemedText style={styles.dividerText}>or</ThemedText>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={navigateToSignup}>
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
          
          <View style={styles.getStartedContainer}>
            <TouchableOpacity onPress={handleGetStarted}>
              <ThemedText style={styles.getStartedButton}>Continue without logging in</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  keyboardAvoidView: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  iconContainer: {
    paddingHorizontal: 15,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#FF5A60',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FF5A60',
  },
  secondaryButtonText: {
    color: '#FF5A60',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    paddingHorizontal: 10,
    color: '#888',
  },
  getStartedContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  getStartedButton: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
}); 