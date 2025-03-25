import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface FieldError {
  hasError: boolean;
  message: string;
}

interface FormErrors {
  fullName: FieldError;
  username: FieldError;
  email: FieldError;
  password: FieldError;
}

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({
    fullName: { hasError: false, message: '' },
    username: { hasError: false, message: '' },
    email: { hasError: false, message: '' },
    password: { hasError: false, message: '' },
  });
  const { signUp } = useAuth();

  const resetErrors = () => {
    setFormErrors({
      fullName: { hasError: false, message: '' },
      username: { hasError: false, message: '' },
      email: { hasError: false, message: '' },
      password: { hasError: false, message: '' },
    });
  };

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { ...formErrors };

    // Reset all errors first
    resetErrors();

    // Full Name validation
    if (!fullName.trim()) {
      newErrors.fullName = {
        hasError: true,
        message: 'Full name is required',
      };
      isValid = false;
    }

    // Username validation
    if (!username.trim()) {
      newErrors.username = {
        hasError: true,
        message: 'Username is required',
      };
      isValid = false;
    } else {
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(username)) {
        newErrors.username = {
          hasError: true,
          message: 'Username can only contain letters, numbers, and underscores',
        };
        isValid = false;
      }
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = {
        hasError: true,
        message: 'Email is required',
      };
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = {
          hasError: true,
          message: 'Please enter a valid email address',
        };
        isValid = false;
      }
    }

    // Password validation
    if (!password) {
      newErrors.password = {
        hasError: true,
        message: 'Password is required',
      };
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = {
        hasError: true,
        message: 'Password must be at least 8 characters long',
      };
      isValid = false;
    }

    setFormErrors(newErrors);

    if (!isValid) {
      // Show alert with all error messages
      const errorMessages = Object.values(newErrors)
        .filter(error => error.hasError)
        .map(error => error.message)
        .join('\n• ');
      
      Alert.alert(
        'Validation Error',
        `Please fix the following errors:\n\n• ${errorMessages}`
      );
    }

    return isValid;
  };

  const handleSignup = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      setIsLoading(true);
      await signUp(email, username, password, fullName);
      // No need to navigate here as AuthContext will handle navigation
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('email already exists')) {
          setFormErrors(prev => ({
            ...prev,
            email: { hasError: true, message: 'This email is already registered' }
          }));
          errorMessage = 'This email is already registered. Please use a different email.';
        } else if (error.message.includes('username already exists') || error.message.includes('username is already taken')) {
          setFormErrors(prev => ({
            ...prev,
            username: { hasError: true, message: 'This username is already taken' }
          }));
          errorMessage = 'This username is already taken. Please choose a different username.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    isLoading && styles.inputDisabled,
                    formErrors.fullName.hasError && styles.inputError
                  ]}
                  placeholder="Full Name"
                  placeholderTextColor="#666"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (formErrors.fullName.hasError) {
                      setFormErrors(prev => ({
                        ...prev,
                        fullName: { hasError: false, message: '' }
                      }));
                    }
                  }}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
                {formErrors.fullName.hasError && (
                  <Text style={styles.errorText}>{formErrors.fullName.message}</Text>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    isLoading && styles.inputDisabled,
                    formErrors.username.hasError && styles.inputError
                  ]}
                  placeholder="Username"
                  placeholderTextColor="#666"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (formErrors.username.hasError) {
                      setFormErrors(prev => ({
                        ...prev,
                        username: { hasError: false, message: '' }
                      }));
                    }
                  }}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                {formErrors.username.hasError && (
                  <Text style={styles.errorText}>{formErrors.username.message}</Text>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    isLoading && styles.inputDisabled,
                    formErrors.email.hasError && styles.inputError
                  ]}
                  placeholder="Email"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (formErrors.email.hasError) {
                      setFormErrors(prev => ({
                        ...prev,
                        email: { hasError: false, message: '' }
                      }));
                    }
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                />
                {formErrors.email.hasError && (
                  <Text style={styles.errorText}>{formErrors.email.message}</Text>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    isLoading && styles.inputDisabled,
                    formErrors.password.hasError && styles.inputError
                  ]}
                  placeholder="Password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (formErrors.password.hasError) {
                      setFormErrors(prev => ({
                        ...prev,
                        password: { hasError: false, message: '' }
                      }));
                    }
                  }}
                  secureTextEntry
                  editable={!isLoading}
                />
                {formErrors.password.hasError && (
                  <Text style={styles.errorText}>{formErrors.password.message}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#3b5998" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity 
                onPress={() => router.push('/auth/login')}
                disabled={isLoading}
              >
                <Text style={[styles.footerLink, isLoading && styles.footerLinkDisabled]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  inputDisabled: {
    opacity: 0.7,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ff6b6b',
    backgroundColor: '#fff0f0',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#3b5998',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
  },
  footerLink: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  footerLinkDisabled: {
    opacity: 0.7,
  },
}); 