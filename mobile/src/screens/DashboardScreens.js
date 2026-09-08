import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const DashboardBase = ({ title }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AttendX</Text>
      <Text style={styles.subtitle}>{title}</Text>
      <Text style={styles.userInfo}>Logged in as: {user?.name} ({user?.role})</Text>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export const HODDashboard = () => <DashboardBase title="Department Admin Dashboard" />;
export const FacultyDashboard = () => <DashboardBase title="Faculty Dashboard" />;
export const StudentDashboard = () => <DashboardBase title="Student Dashboard" />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f6f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0056b3',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#333',
    marginBottom: 20,
  },
  userInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
