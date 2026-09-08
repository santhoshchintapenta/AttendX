import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

const AppInput = ({ 
  label, 
  icon, 
  isPassword, 
  value, 
  onChangeText, 
  placeholder,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(isPassword);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused
      ]}>
        {icon && (
          <View style={styles.iconContainer} pointerEvents="none">
            <Feather 
              name={icon} 
              size={20} 
              color={isFocused ? '#2563EB' : '#98A2B3'} 
            />
          </View>
        )}
        
        <TextInput
          style={[styles.input, !icon && { paddingLeft: 16 }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#98A2B3"
          secureTextEntry={hidePassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          pointerEvents="auto"
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setHidePassword(!hidePassword)} 
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather 
              name={hidePassword ? 'eye-off' : 'eye'} 
              size={20} 
              color="#98A2B3" 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#162033',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    borderWidth: 1.5,
    borderColor: '#E6EAF0',
    borderRadius: 16,
    height: 56,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconContainer: {
    paddingLeft: 16,
    paddingRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#162033',
    paddingRight: 16,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  eyeButton: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppInput;
