import React, { useContext, useState } from 'react';
import SplashScreen from '../screens/SplashScreen';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/theme';

import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyOTPScreen from '../screens/auth/VerifyOTPScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import PasswordResetSuccessScreen from '../screens/auth/PasswordResetSuccessScreen';

import HODDashboard from '../screens/dashboard/HODDashboard';
import FacultyDashboard from '../screens/dashboard/FacultyDashboard';
import StudentDashboard from '../screens/dashboard/StudentDashboard';

import NotImplementedScreen from '../screens/NotImplementedScreen';
import AcademicStructureScreen from '../screens/academics/AcademicStructureScreen';
import MoreScreen from '../screens/MoreScreen';
import StudentsScreen from '../screens/hod/StudentsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const commonTabOptions = {
  headerShown: false,
  tabBarActiveTintColor: theme.colors.primary,
  tabBarInactiveTintColor: theme.colors.textMuted,
  tabBarStyle: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    paddingTop: 5,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 10,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '500',
    paddingBottom: 5,
  }
};

/* =========================
   HOD BOTTOM TABS
========================= */

const HODTabs = () => (
  <Tab.Navigator screenOptions={commonTabOptions}>
    <Tab.Screen
      name="Dashboard"
      component={HODDashboard}
      options={{ tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }}
    />

    <Tab.Screen
      name="Students"
      component={StudentsScreen}
      options={{ tabBarIcon: ({ color, size }) => <Feather name="users" size={size} color={color} /> }}
    />

    <Tab.Screen
      name="My Schedule"
      component={NotImplementedScreen}
      options={{ tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} /> }}
    />

    <Tab.Screen
      name="Faculty"
      component={NotImplementedScreen}
      options={{ tabBarIcon: ({ color, size }) => <Feather name="user-check" size={size} color={color} /> }}
    />

    <Tab.Screen
      name="More"
      component={MoreScreen}
      options={{ tabBarIcon: ({ color, size }) => <Feather name="menu" size={size} color={color} /> }}
    />
  </Tab.Navigator>
);


/* =========================
   FACULTY BOTTOM TABS
========================= */

const FacultyTabs = () => (
  <Tab.Navigator screenOptions={commonTabOptions}>
    <Tab.Screen
      name="Dashboard"
      component={FacultyDashboard}
      options={{ tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }}
    />

    <Tab.Screen
      name="Schedule"
      component={NotImplementedScreen}
      options={{ tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} /> }}
    />

    <Tab.Screen
      name="Attendance"
      component={NotImplementedScreen}
      options={{ tabBarIcon: ({ color, size }) => <Feather name="check-circle" size={size} color={color} /> }}
    />

    <Tab.Screen
      name="More"
      component={MoreScreen}
      options={{ tabBarIcon: ({ color, size }) => <Feather name="menu" size={size} color={color} /> }}
    />
  </Tab.Navigator>
);


/* =========================
   STUDENT BOTTOM TABS
========================= */

const StudentTabs = () => (
  <Tab.Navigator screenOptions={commonTabOptions}>
    <Tab.Screen
      name="Dashboard"
      component={StudentDashboard}
      options={{ tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }}
    />

    <Tab.Screen
      name="Schedule"
      component={NotImplementedScreen}
      options={{ tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} /> }}
    />

    <Tab.Screen
      name="Attendance"
      component={NotImplementedScreen}
      options={{ tabBarIcon: ({ color, size }) => <Feather name="check-circle" size={size} color={color} /> }}
    />

    <Tab.Screen
      name="More"
      component={MoreScreen}
      options={{ tabBarIcon: ({ color, size }) => <Feather name="menu" size={size} color={color} /> }}
    />
  </Tab.Navigator>
);


/* =========================
   MAIN APP NAVIGATOR
========================= */

const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);
  const [splashDone, setSplashDone] = useState(false);

  // Show SplashScreen while auth is restoring OR minimum display hasn't elapsed.
  // SplashScreen reads `loading` from AuthContext itself and calls onReady
  // only when both the animation (600ms) and auth check are complete.
  if (loading || !splashDone) {
    return <SplashScreen onReady={() => setSplashDone(true)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {user == null ? (

          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen
              name="VerifyOTP"
              component={VerifyOTPScreen}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
            />
            <Stack.Screen
              name="PasswordResetSuccess"
              component={PasswordResetSuccessScreen}
              options={{ gestureEnabled: false }}
            />
          </>

        ) : (

          <>
            {user.role === 'HOD' && (
              <Stack.Screen
                name="HODRoot"
                component={HODTabs}
              />
            )}

            {user.role === 'Faculty' && (
              <Stack.Screen
                name="FacultyRoot"
                component={FacultyTabs}
              />
            )}

            {user.role === 'Student' && (
              <Stack.Screen
                name="StudentRoot"
                component={StudentTabs}
              />
            )}

            {/* ComingSoon: reached from MoreScreen via React Navigation bubbling */}
            <Stack.Screen
              name="ComingSoon"
              component={NotImplementedScreen}
            />
            {/* Academics: HOD More → Academics navigates here */}
            <Stack.Screen
              name="Academics"
              component={AcademicStructureScreen}
              options={{ headerShown: true, title: 'Academic Structure' }}
            />
          </>

        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;