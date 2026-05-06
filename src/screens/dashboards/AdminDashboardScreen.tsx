import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInRight, Layout, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { mockUsers } from '../../mock/users';
import { Users, Shield, Building2, ChevronDown, ChevronUp, MoreHorizontal, UserCircle2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Department tree removed; now located in DirectoryScreen
export const AdminDashboardScreen = () => {
  const user = useAuthStore(state => state.user);

  const departments = useMemo(() => {
    const grouped = mockUsers.reduce((acc, u) => {
      if (u.department !== 'Management') {
        if (!acc[u.department]) acc[u.department] = [];
        acc[u.department].push(u);
      }
      return acc;
    }, {} as Record<string, any[]>);
    
    // Sort keys alphabetically
    return Object.keys(grouped).sort().map(key => ({
      name: key,
      users: grouped[key]
    }));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.heroBg}>
        <LinearGradient 
          colors={['#1A0B2E', '#8E2DE2', '#4A00E0']} 
          style={StyleSheet.absoluteFill} 
          start={{x: 0, y: 0}} 
          end={{x: 1, y: 1}} 
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInRight.duration(800).springify()} style={styles.header}>
          <Text style={styles.greeting}>System Administrator,</Text>
          <Text style={styles.name}>{user?.name || 'Super Admin'}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.floatingCardContainer}>
          <View style={styles.statusPill}>
            <Shield size={16} color="#8E2DE2" style={{marginRight: 6}} />
            <Text style={styles.statusText}>Master Control</Text>
          </View>

          <View style={styles.whiteCard}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>Organization Overview</Text>
              <Text style={styles.cardSub}>Global Workforce Management</Text>
            </View>
            
            <View style={styles.cardMiddle}>
              <View style={styles.mainStatBox}>
                <Building2 size={24} color="#8E2DE2" style={{marginBottom: 8}} />
                <Text style={styles.mainStatValue}>{departments.length}</Text>
                <Text style={styles.mainStatLabel}>Departments</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.mainStatBox}>
                <Users size={24} color="#4A00E0" style={{marginBottom: 8}} />
                <Text style={styles.mainStatValue}>{mockUsers.length}</Text>
                <Text style={styles.mainStatLabel}>Total Users</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>System Analytics</Text>
          </View>
          
          <View style={styles.whiteCard}>
            <Text style={[styles.cardTitle, {fontSize: 18}]}>Server Status</Text>
            <Text style={styles.cardSub}>All systems operational</Text>
            <View style={{height: 120, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{color: '#8E2DE2', fontWeight: '700'}}>View Analytics Dashboard</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 380,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  floatingCardContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#8E2DE2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: -20,
    zIndex: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  whiteCard: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 32,
    padding: 24,
    paddingTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  cardTop: {
    marginBottom: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: '#8A8A8E',
    fontWeight: '500',
  },
  cardMiddle: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#F8F8FA',
    borderRadius: 20,
    padding: 20,
  },
  mainStatBox: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    height: '80%',
    alignSelf: 'center',
  },
  mainStatValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  mainStatLabel: {
    fontSize: 13,
    color: '#8A8A8E',
    fontWeight: '600',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  }
});
