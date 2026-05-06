import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { Clock, Check, DotsThree, MapPin } from 'phosphor-react-native';

const { width } = Dimensions.get('window');

const TaskCard = ({ title, project, deadline, delay }: any) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.taskCard}>
    <View style={styles.taskTag}>
      <Text style={styles.taskTagText}>{project}</Text>
    </View>
    <Text style={styles.taskTitle}>{title}</Text>
    <View style={styles.taskRow}>
      <Clock size={14} color="#8A8A8E" weight="bold" />
      <Text style={styles.taskDeadline}>{deadline}</Text>
    </View>
    
    <View style={styles.taskActions}>
      <TouchableOpacity style={styles.darkBtn}>
        <Check size={16} color="#FFF" weight="bold" style={{marginRight: 6}} />
        <Text style={styles.darkBtnText}>Complete</Text>
      </TouchableOpacity>
      <View style={{flexDirection: 'row', gap: 10}}>
        <TouchableOpacity style={styles.circleBtn}>
          <MapPin size={18} color="#1A1A1A" weight="bold" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleBtn}>
          <DotsThree size={24} color="#1A1A1A" weight="bold" />
        </TouchableOpacity>
      </View>
    </View>
  </Animated.View>
);

export const EngineerDashboardScreen = () => {
  const user = useAuthStore(state => state.user);

  return (
    <View style={styles.container}>
      <View style={styles.heroBg}>
        <LinearGradient 
          colors={['#FF7E5F', '#FEB47B']} 
          style={StyleSheet.absoluteFill} 
          start={{x: 0, y: 0}} 
          end={{x: 1, y: 1}} 
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInRight.duration(800).springify()} style={styles.header}>
          <Text style={styles.greeting}>Welcome Back</Text>
          <Text style={styles.name}>{user?.name || 'Engineer'}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.floatingCardContainer}>
          <View style={styles.statusPill}>
            <View style={styles.statusDotWrapper}>
              <View style={[styles.statusDot, { backgroundColor: user?.status === 'On-Site' ? '#FF7E5F' : '#FFB200' }]} />
            </View>
            <Text style={styles.statusText}>{user?.status} • {user?.department}</Text>
          </View>

          <View style={styles.whiteCard}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>Today's Attendance</Text>
              <Text style={styles.cardSub}>VECV Plant, Pithampur</Text>
            </View>
            
            <View style={styles.cardMiddle}>
              <View>
                <Text style={styles.timeLabel}>Punch In</Text>
                <Text style={styles.timeValue}>09:05 AM</Text>
              </View>
              <View>
                <Text style={styles.timeLabel}>Punch Out</Text>
                <Text style={styles.timeValue}>--:--</Text>
              </View>
            </View>

            <View style={styles.cardBottom}>
              <Text style={styles.hoursText}>Active: 4h 25m</Text>
              <TouchableOpacity style={styles.darkActionPill}>
                <Text style={styles.darkActionText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text style={styles.sectionTitle}>My Tasks</Text>
          <View style={styles.tasksContainer}>
            <TaskCard title="Install Conveyor Belts" project="VECV Operations" deadline="Today, 5:00 PM" delay={500} />
            <TaskCard title="Safety Inspection & Audit" project="VECV Assembly" deadline="Tomorrow, 10:00 AM" delay={600} />
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
    shadowColor: '#FF7E5F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: -20, // Overlap the card below
    zIndex: 10,
  },
  statusDotWrapper: {
    backgroundColor: '#FFF0ED',
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
  timeLabel: {
    fontSize: 13,
    color: '#8A8A8E',
    fontWeight: '600',
    marginBottom: 6,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
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
    color: '#FF7E5F',
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
  tasksContainer: {
    gap: 20,
  },
  taskCard: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.05,
    shadowRadius: 25,
    elevation: 6,
  },
  taskTag: {
    backgroundColor: '#FFF0ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  taskTagText: {
    color: '#FF7E5F',
    fontSize: 12,
    fontWeight: '700',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  taskDeadline: {
    fontSize: 13,
    color: '#8A8A8E',
    marginLeft: 6,
    fontWeight: '600',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  darkBtn: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  darkBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
