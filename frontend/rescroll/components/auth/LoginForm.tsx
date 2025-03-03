import React, { useState, useContext } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Image, Text } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../app/_layout';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { setIsAuthenticated, setBypassAuth } = useContext(AuthContext);

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
      <View style={styles.logoContainer}>
        {/* App logo goes here */}
        <ThemedText style={styles.logoText}>ReScroll</ThemedText>
        <ThemedText style={styles.tagline}>Discover, Learn, Explore Research</ThemedText>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email or Username"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>or</ThemedText>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.signupButton} onPress={navigateToSignup}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>
        
        <View style={styles.getStartedContainer}>
          <ThemedText style={styles.getStartedText}>Don't want to sign up yet?</ThemedText>
          <TouchableOpacity onPress={handleGetStarted}>
            <ThemedText style={styles.getStartedButton}>Get Started</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
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
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
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
    backgroundColor: '#ddd',
  },
  dividerText: {
    paddingHorizontal: 10,
    color: '#888',
  },
  signupButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  getStartedContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  getStartedButton: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: 'bold',
  },
}); 