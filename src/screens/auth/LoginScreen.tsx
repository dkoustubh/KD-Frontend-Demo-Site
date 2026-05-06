import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Alert, Image } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { Lock, User as UserIcon, Eye, EyeSlash } from 'phosphor-react-native';

const { width } = Dimensions.get('window');

export const LoginScreen = ({ navigation }: any) => {
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);

  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }]
    };
  });

  useEffect(() => {
    if (user) {
      if (user.role === 'Admin') navigation.replace('AdminDashboard');
      else if (user.role === 'HOD') navigation.replace('HODDashboard');
      else navigation.replace('EngineerDashboard');
    }
  }, [user]);

  const handleLogin = () => {
    setError('');
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });

    if (!empId) {
      setError('Employee ID is required');
      return;
    }

    if (password !== 'mypassword') {
      setError('Incorrect Password');
      return;
    }
    
    const success = login(empId);
    if (!success) {
      setError('Invalid Employee ID');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert("Password Reset", "Please contact Admin or HOD for password reset.");
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.glassCard}>
        <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/ats_logo.png')} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
          <Text style={styles.title}>Site Monitoring System</Text>
          <Text style={styles.subtitle}>Enterprise Operations Portal</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(800).springify()} style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <UserIcon color={colors.textSecondary} size={20} weight="bold" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Employee ID"
              placeholderTextColor={colors.textSecondary}
              value={empId}
              onChangeText={(text) => setEmpId(text.toUpperCase())}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Lock color={colors.textSecondary} size={20} weight="bold" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{padding: 5}}>
              {showPassword ? (
                <EyeSlash color={colors.textSecondary} size={20} weight="bold" />
              ) : (
                <Eye color={colors.textSecondary} size={20} weight="bold" />
              )}
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.optionsContainer}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity activeOpacity={1} onPress={handleLogin}>
            <Animated.View style={[styles.loginButton, buttonAnimatedStyle]}>
              <Text style={styles.loginButtonText}>Secure Login</Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glassCard: {
    width: width > 500 ? 450 : '100%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  }
});
