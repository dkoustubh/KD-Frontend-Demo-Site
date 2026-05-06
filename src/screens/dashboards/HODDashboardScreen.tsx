import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { Users, Clock, WarningCircle, Briefcase, ChartLineUp, CaretRight } from 'phosphor-react-native';

const { width } = Dimensions.get('window');

const StatPill = ({ title, value, icon: Icon, delay, color }: any) => {
  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).springify()} 
      style={styles.statPill}
    >
      <View style={[styles.iconWrapper, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.pillValue}>{value}</Text>
        <Text style={styles.pillTitle}>{title}</Text>
      </View>
      <TouchableOpacity style={styles.chevronBtn}>
          <CaretRight size={20} color="#1A1A1A" weight="bold" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export const HODDashboardScreen = () => {
  const user = useAuthStore(state => state.user);

  return (
    <View style={styles.container}>
      <View style={styles.heroBg}>
        <LinearGradient 
          colors={['#4A90E2', '#50E3C2']} 
          style={StyleSheet.absoluteFill} 
          start={{x: 0, y: 0}} 
          end={{x: 1, y: 1}} 
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInRight.duration(800).springify()} style={styles.header}>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.floatingCardContainer}>
          <View style={styles.statusPill}>
            <View style={styles.statusDotWrapper}>
              <View style={[styles.statusDot, { backgroundColor: '#4A90E2' }]} />
            </View>
            <Text style={styles.statusText}>{user?.department} Head</Text>
          </View>

          <View style={styles.whiteCard}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>Live Attendance</Text>
              <Text style={styles.cardSub}>Today's Workforce Overview</Text>
            </View>
            
            <View style={styles.cardMiddle}>
              <View style={styles.mainStatBox}>
                <Users size={24} color="#4A90E2" style={{marginBottom: 8}} />
                <Text style={styles.mainStatValue}>124</Text>
                <Text style={styles.mainStatLabel}>Total Staff</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.mainStatBox}>
                <ChartLineUp size={24} color="#50E3C2" weight="bold" style={{marginBottom: 8}} />
                <Text style={styles.mainStatValue}>112</Text>
                <Text style={styles.mainStatLabel}>Present</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.mainStatBox}>
                <Briefcase size={24} color="#F5A623" style={{marginBottom: 8}} />
                <Text style={styles.mainStatValue}>45</Text>
                <Text style={styles.mainStatLabel}>On-Site</Text>
              </View>
            </View>

            <View style={styles.cardBottom}>
              <Text style={styles.hoursText}>8 Pending Approvals</Text>
              <TouchableOpacity style={styles.darkActionPill}>
                <Text style={styles.darkActionText}>Review All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <StatPill title="Present Today" value="42/45" icon={Users} color="#4A90E2" delay={300} />
          <StatPill title="Late Arrivals" value="3" icon={Clock} color="#F5A623" delay={400} />
          <StatPill title="Leave Req." value="5" icon={WarningCircle} color="#FF4B4B" delay={500} />
          <StatPill title="Active Sites" value="4" icon={Briefcase} color="#8E2DE2" delay={600} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.chartCard}>
          <View style={styles.chartTag}>
            <Text style={styles.chartTagText}>Analytics</Text>
          </View>
          <Text style={styles.cardTitle}>Attendance Trend</Text>
          <View style={styles.chartPlaceholder}>
            <LinearGradient 
              colors={['rgba(74, 144, 226, 0.1)', 'rgba(80, 227, 194, 0.05)']} 
              style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
            />
            <ChartLineUp size={32} color="#4A90E2" weight="bold" style={{ opacity: 0.5 }} />
            <Text style={{color: '#8A8A8E', marginTop: 10, fontWeight: '600'}}>Trend Data Generating...</Text>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
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
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: -20,
    zIndex: 10,
  },
  statusDotWrapper: {
    backgroundColor: '#E8F1FA',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 10,
  },
  cardTop: {
    marginBottom: 20,
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
    justifyContent: 'space-between',
    backgroundColor: '#F8F8FA',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  mainStatLabel: {
    fontSize: 12,
    color: '#8A8A8E',
    fontWeight: '600',
    marginTop: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 5,
  },
  hoursText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF4B4B',
  },
  darkActionPill: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  darkActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
    marginLeft: 5,
  },
  metricsContainer: {
    gap: 15,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  pillTitle: {
    fontSize: 13,
    color: '#8A8A8E',
    fontWeight: '600',
    marginTop: 2,
  },
  chevronBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 24,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.05,
    shadowRadius: 25,
    elevation: 6,
  },
  chartTag: {
    backgroundColor: '#E8F1FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  chartTagText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '700',
  },
  chartPlaceholder: {
    height: 180,
    backgroundColor: '#F8F8FA',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  }
});
