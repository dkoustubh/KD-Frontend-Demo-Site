import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const AdminDashboard = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Admin Dashboard Placeholder</Text>
  </View>
);

export const HODDashboard = () => (
  <View style={styles.container}>
    <Text style={styles.text}>HOD Dashboard Placeholder</Text>
  </View>
);

export const EngineerDashboard = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Engineer Dashboard Placeholder</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  }
});
