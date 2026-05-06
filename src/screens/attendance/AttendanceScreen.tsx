import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { mockProjects } from '../../mock/projects';
import { MapView, Marker, Circle } from '../../components/MapWrapper';
import { Clock, CheckCircle, CaretLeft, CaretRight, ChartLineUp, MapPin, CaretDown, CaretUp, X, Notepad, ArrowRight } from 'phosphor-react-native';
import { useAttendanceStore, PunchRecord } from '../../store/attendanceStore';
import { Modal, TextInput, KeyboardAvoidingView } from 'react-native';

const { width } = Dimensions.get('window');

// Haversine distance in meters
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; 
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
};

// Simple Calendar
const CalendarComponent = ({ isHOD, onDateClick }: { isHOD: boolean, onDateClick: (day: number) => void }) => {
  const { punchRecords } = useAttendanceStore();
  const daysInMonth = 31;
  const startOffset = 5; 
  const today = 6;
  
  const renderDays = () => {
    let days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const headers = weekDays.map((d, i) => (
      <View key={`h-${i}`} style={styles.calDayHeader}>
        <Text style={styles.calDayHeaderText}>{d}</Text>
      </View>
    ));

    for (let i = 0; i < startOffset; i++) {
      days.push(<View key={`b-${i}`} style={styles.calDayCell} />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `2026-05-${i.toString().padStart(2, '0')}`;
      const punch = punchRecords.find(r => r.date === dateStr);

      if (isHOD) {
        const presentCount = i <= today ? Math.floor(Math.random() * 5) + 10 : 0;
        const absentCount = i <= today ? Math.floor(Math.random() * 3) : 0;
        
        const isToday = i === today;
        const cellContent = (
          <TouchableOpacity 
            style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => onDateClick(i)}
          >
            <Text style={[styles.calDayText, { color: isToday ? '#FFF' : colors.text, fontSize: 13, marginBottom: 4 }]}>{i}</Text>
            {i <= today && (
              <View style={{flexDirection: 'row', gap: 6}}>
                <Text style={{color: isToday ? '#FFF' : colors.accent, fontSize: 11, fontWeight: '800'}}>{presentCount}</Text>
                <Text style={{color: isToday ? '#FFE6E6' : colors.error, fontSize: 11, fontWeight: '800'}}>{absentCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        );

        days.push(
          <View key={`d-${i}`} style={[styles.calDayCell, { backgroundColor: isToday ? 'transparent' : colors.surface, borderWidth: isToday ? 0 : 1, borderColor: colors.border }]}>
            {isToday ? (
              <LinearGradient colors={['#FF7E5F', '#FEB47B']} style={styles.gradientCell} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                {cellContent}
              </LinearGradient>
            ) : cellContent}
          </View>
        );
      } else {
        let statusColor = 'transparent';
        let dotColor = 'transparent';
        
        if (punch) {
           if (punch.punchIn && punch.punchOut) {
             statusColor = colors.accent + '20';
             dotColor = colors.accent;
           } else if (punch.punchIn) {
             statusColor = colors.warning + '20';
             dotColor = colors.warning;
           }
        } else if (i < today) {
          if (i % 7 === 0 || i % 7 === 6) statusColor = 'transparent';
          else { statusColor = colors.error + '20'; dotColor = colors.error; }
        }

        const isToday = i === today;
        if (isToday) {
          statusColor = colors.accent;
          dotColor = '#FFF';
        }

        const cellContent = (
          <TouchableOpacity 
            style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => onDateClick(i)}
          >
            <Text style={[styles.calDayText, { color: isToday ? '#FFF' : colors.text }]}>{i}</Text>
            {dotColor !== 'transparent' && <View style={[styles.calDotIndicator, { backgroundColor: dotColor }]} />}
          </TouchableOpacity>
        );

        days.push(
          <View key={`d-${i}`} style={[styles.calDayCell, { backgroundColor: 'transparent' }]}>
            {isToday ? (
              <LinearGradient colors={['#FF7E5F', '#FEB47B']} style={styles.gradientCell} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                {cellContent}
              </LinearGradient>
            ) : (
              <View style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                {statusColor !== 'transparent' && (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: statusColor, borderRadius: 16, opacity: 0.5 }]} />
                )}
                {cellContent}
              </View>
            )}
          </View>
        );
      }
    }

    return (
      <View>
        <View style={styles.calRow}>{headers}</View>
        <View style={styles.calGrid}>{days}</View>
      </View>
    );
  };

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calHeader}>
        <TouchableOpacity><CaretLeft color={colors.textSecondary} weight="bold" /></TouchableOpacity>
        <Text style={styles.calMonthYear}>May 2026</Text>
        <TouchableOpacity><CaretRight color={colors.textSecondary} weight="bold" /></TouchableOpacity>
      </View>
      {renderDays()}
    </View>
  );
};

export const AttendanceScreen = () => {
  const user = useAuthStore(state => state.user);
  const isHOD = user?.role === 'HOD';
  const [punchedIn, setPunchedIn] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const { getPunchForDate, submitRegularization } = useAttendanceStore();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isRegModalVisible, setIsRegModalVisible] = useState(false);
  const [newIn, setNewIn] = useState('09:00 AM');
  const [newOut, setNewOut] = useState('06:00 PM');
  const [reason, setReason] = useState('');

  const assignedProjects = mockProjects.filter(p => p.members.includes(user?.id || ''));
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(assignedProjects.length > 0 ? assignedProjects[0]?.id : null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const assignedProject = assignedProjects.find(p => p.id === selectedProjectId) || assignedProjects[0] || null;

  useEffect(() => {
    if (!isHOD) {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission to access location was denied');
          return;
        }

        // Continually track location
        Location.watchPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        }, (loc) => {
          setLocation(loc);
          if (assignedProject && assignedProject.latitude && assignedProject.longitude) {
            const dist = getDistance(
              loc.coords.latitude, loc.coords.longitude,
              assignedProject.latitude, assignedProject.longitude
            );
            setDistance(dist);
          }
        });
      })();
    }
  }, [isHOD, assignedProject]);

  useEffect(() => {
    // Check for pending queue when component mounts or network comes back
    const syncOfflineQueue = async () => {
      try {
        const existingQueue = await AsyncStorage.getItem('PUNCH_QUEUE');
        if (existingQueue) {
          const queue = JSON.parse(existingQueue);
          if (queue.length > 0) {
            // Simulate sending to backend
            console.log(`Syncing ${queue.length} offline punches to backend...`);
            setTimeout(async () => {
              await AsyncStorage.removeItem('PUNCH_QUEUE');
              if (Platform.OS !== 'web') {
                Alert.alert("Synced", `${queue.length} offline attendance logs have been synced to the server.`);
              }
            }, 2000);
          }
        }
      } catch (error) {
        console.error("Failed to sync offline queue:", error);
      }
    };
    syncOfflineQueue();
  }, []);

  const canPunch = assignedProject ? (Platform.OS === 'web' ? true : (distance !== null && distance <= (assignedProject.radius || 100))) : false;

  const handlePunch = async () => {
    if (!assignedProject) {
      Alert.alert("Error", "No site assigned.");
      return;
    }
    
    if (!canPunch) {
      Alert.alert("Error", "You are outside the designated site radius.");
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      siteId: assignedProject.id,
      employeeId: user?.id,
      coords: location ? location.coords : null,
      type: punchedIn ? 'OUT' : 'IN'
    };

    try {
      // Offline support logic
      const existingQueue = await AsyncStorage.getItem('PUNCH_QUEUE');
      let queue = existingQueue ? JSON.parse(existingQueue) : [];
      queue.push(payload);
      await AsyncStorage.setItem('PUNCH_QUEUE', JSON.stringify(queue));
      
      setPunchedIn(!punchedIn);
      Alert.alert("Success", punchedIn ? "Punched Out Successfully! Logged to queue." : "Punched In Successfully! Coordinates matched.");
    } catch (e) {
      Alert.alert("Error", "Failed to save attendance data locally.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isHOD && (
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.hodAlert}>
          <ChartLineUp color={colors.primary} size={24} weight="bold" />
          <View style={styles.hodAlertTextContainer}>
            <Text style={styles.hodAlertTitle}>Manager View</Text>
            <Text style={styles.hodAlertSub}>You are viewing the department attendance analytics.</Text>
          </View>
        </Animated.View>
      )}

      {!isHOD && (
        <>
          <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.mapContainer}>
            {assignedProject && assignedProject.latitude && assignedProject.longitude ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: assignedProject.latitude,
                  longitude: assignedProject.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker
                  coordinate={{ latitude: assignedProject.latitude, longitude: assignedProject.longitude }}
                  title={assignedProject.name}
                  description="Designated Site Location"
                />
                <Circle
                  center={{ latitude: assignedProject.latitude, longitude: assignedProject.longitude }}
                  radius={assignedProject.radius || 100}
                  fillColor="rgba(0, 150, 255, 0.2)"
                  strokeColor="rgba(0, 150, 255, 0.5)"
                  strokeWidth={2}
                />
                {location && (
                  <Marker
                    coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
                    pinColor={canPunch ? colors.accent : colors.error}
                    title="You"
                    description="Current Position"
                  />
                )}
              </MapView>
            ) : (
              <View style={[styles.map, {justifyContent: 'center', alignItems:'center'}]}><Text>Map Data Unavailable</Text></View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.actionCard}>
            <View style={styles.dropdownContainer}>
              <Text style={styles.timeLabel}>Assigned Site</Text>
              <TouchableOpacity 
                style={styles.dropdownToggle}
                onPress={() => setDropdownOpen(!dropdownOpen)}
              >
                <Text style={styles.dropdownToggleText}>{assignedProject ? assignedProject.name : 'No assigned project'}</Text>
                {dropdownOpen ? <CaretUp size={16} color={colors.textSecondary} /> : <CaretDown size={16} color={colors.textSecondary} />}
              </TouchableOpacity>
              
              {dropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {assignedProjects.length > 0 ? (
                    assignedProjects.map(proj => (
                      <TouchableOpacity 
                        key={proj.id} 
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedProjectId(proj.id);
                          setDropdownOpen(false);
                          setPunchedIn(false); // Reset punch status when switching sites
                        }}
                      >
                        <Text style={[styles.dropdownItemText, proj.id === selectedProjectId && styles.dropdownItemTextActive]}>{proj.name}</Text>
                        {proj.id === selectedProjectId && <CheckCircle size={16} color={colors.accent} weight="fill" />}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={{padding: 15, color: colors.error}}>No sites assigned to you.</Text>
                  )}
                </View>
              )}
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Status</Text>
              {Platform.OS === 'web' ? (
                <Text style={[styles.siteValue, {color: colors.accent}]}>Web Simulated Location</Text>
              ) : distance === null ? (
                <Text style={styles.timeLabel}>Locating...</Text>
              ) : canPunch ? (
                <Text style={[styles.siteValue, {color: colors.accent}]}>At Site ({Math.round(distance)}m)</Text>
              ) : (
                <Text style={[styles.siteValue, {color: colors.error}]}>Outside Radius ({Math.round(distance)}m)</Text>
              )}
            </View>
            
            <TouchableOpacity 
              style={[
                styles.punchBtn, 
                { backgroundColor: !canPunch ? colors.border : punchedIn ? colors.warning : colors.accent }
              ]}
              onPress={handlePunch}
              activeOpacity={canPunch ? 0.8 : 1}
            >
              {punchedIn ? <Clock color="#FFF" size={24} weight="bold" /> : <CheckCircle color="#FFF" size={24} weight="bold" />}
              <Text style={styles.punchBtnText}>{!canPunch ? 'Outside Site Radius' : punchedIn ? 'Punch Out' : 'Punch In'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.regularizeBtn}
              onPress={() => {
                if (Platform.OS === 'web') {
                  const reason = window.prompt("Enter reason for regularization:");
                  if (reason) Alert.alert("Success", "Regularization request sent to HOD for approval.");
                } else {
                  Alert.prompt(
                    "Regularize Attendance", 
                    "Enter reason for regularization (e.g., Forgot to punch, Network issue):", 
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Submit", onPress: (reason?: string) => Alert.alert("Success", "Regularization request sent to HOD for approval.") }
                    ]
                  );
                }
              }}
            >
              <Text style={styles.regularizeBtnText}>Regularize Attendance</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}

      <Animated.View entering={FadeInUp.delay(isHOD ? 200 : 400).springify()} style={styles.historyCard}>
        <Text style={styles.historyTitle}>{isHOD ? 'Department Attendance Calendar' : 'My Attendance Calendar'}</Text>
        <CalendarComponent 
          isHOD={isHOD} 
          onDateClick={(day) => {
            if (!isHOD) {
              setSelectedDay(day);
              const dateStr = `2026-05-${day.toString().padStart(2, '0')}`;
              const punch = getPunchForDate(dateStr);
              if (punch) {
                setNewIn(punch.punchIn || '09:00 AM');
                setNewOut(punch.punchOut || '06:00 PM');
              }
              setIsRegModalVisible(true);
            }
          }}
        />
      </Animated.View>

      {/* Regularization Modal */}
      <Modal visible={isRegModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={ZoomIn.springify()} style={styles.regModalContent}>
            <LinearGradient colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.98)']} style={styles.regModalGradient}>
              <View style={styles.regModalHeader}>
                <View>
                  <Text style={styles.regModalTitle}>Regularize Attendance</Text>
                  <Text style={styles.regModalSubtitle}>May {selectedDay}, 2026</Text>
                </View>
                <TouchableOpacity onPress={() => setIsRegModalVisible(false)}>
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.regModalBody}>
                {/* Left: Existing Data */}
                <View style={styles.regModalSide}>
                  <Text style={styles.sideTitle}>Current Record</Text>
                  {selectedDay && (
                    (() => {
                      const punch = getPunchForDate(`2026-05-${selectedDay.toString().padStart(2, '0')}`);
                      return punch ? (
                        <View style={styles.recordBox}>
                          <View style={styles.recordItem}>
                            <Clock size={16} color={colors.textSecondary} />
                            <Text style={styles.recordText}>In: {punch.punchIn || '--'}</Text>
                          </View>
                          <View style={styles.recordItem}>
                            <Clock size={16} color={colors.textSecondary} />
                            <Text style={styles.recordText}>Out: {punch.punchOut || '--'}</Text>
                          </View>
                          <View style={styles.recordItem}>
                            <ChartLineUp size={16} color={colors.textSecondary} />
                            <Text style={styles.recordText}>Total: {punch.workHours || '--'}</Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.emptyRecord}>
                          <Notepad size={32} color={colors.textSecondary} opacity={0.3} />
                          <Text style={styles.emptyRecordText}>No logs found</Text>
                        </View>
                      );
                    })()
                  )}
                </View>

                {/* Right: New Entry */}
                <View style={styles.regModalSide}>
                  <Text style={styles.sideTitle}>New Timings</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Punch In</Text>
                    <TextInput 
                      style={styles.textInput} 
                      value={newIn} 
                      onChangeText={setNewIn} 
                      placeholder="09:00 AM"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Punch Out</Text>
                    <TextInput 
                      style={styles.textInput} 
                      value={newOut} 
                      onChangeText={setNewOut} 
                      placeholder="06:00 PM"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.reasonContainer}>
                <Text style={styles.inputLabel}>Reason for Regularization</Text>
                <TextInput 
                  style={[styles.textInput, styles.textArea]} 
                  value={reason} 
                  onChangeText={setReason} 
                  placeholder="Describe why you need to regularize..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.regModalActions}>
                <TouchableOpacity 
                  style={styles.cancelBtn} 
                  onPress={() => setIsRegModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.submitBtn}
                  onPress={() => {
                    if (!reason) {
                      Alert.alert("Required", "Please provide a reason.");
                      return;
                    }
                    const dateStr = `2026-05-${selectedDay?.toString().padStart(2, '0')}`;
                    const oldPunch = getPunchForDate(dateStr);
                    submitRegularization({
                      employeeId: user?.id || '',
                      employeeName: user?.name || '',
                      department: user?.department || '',
                      date: dateStr,
                      oldPunchIn: oldPunch?.punchIn || null,
                      oldPunchOut: oldPunch?.punchOut || null,
                      newPunchIn: newIn,
                      newPunchOut: newOut,
                      reason: reason,
                    });
                    setIsRegModalVisible(false);
                    setReason('');
                    Alert.alert("Success", "Regularization request sent to HOD.");
                  }}
                >
                  <Text style={styles.submitBtnText}>Regularize</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
      
      {isHOD && (
        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>85%</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: colors.error }]}>12%</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: colors.secondary }]}>3%</Text>
            <Text style={styles.statLabel}>Leaves</Text>
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 60 },
  hodAlert: {
    flexDirection: 'row', backgroundColor: colors.primary + '15', padding: 20,
    borderRadius: 20, marginBottom: 20, alignItems: 'center',
    borderWidth: 1, borderColor: colors.primary + '30',
  },
  hodAlertTextContainer: { marginLeft: 15 },
  hodAlertTitle: { fontSize: 16, fontWeight: '700', color: colors.primary },
  hodAlertSub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  mapContainer: {
    height: 250, backgroundColor: colors.surface, borderRadius: 24,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05, shadowRadius: 20, elevation: 4,
    marginBottom: 20, overflow: 'hidden',
  },
  map: { width: '100%', height: '100%' },
  actionCard: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 20,
  },
  timeInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  timeLabel: { fontSize: 16, color: colors.textSecondary, fontWeight: '500' },
  timeValue: { fontSize: 24, fontWeight: '800', color: colors.text },
  siteValue: { fontSize: 16, fontWeight: '600', color: colors.primary },
  punchBtn: {
    flexDirection: 'row', height: 60, borderRadius: 16, justifyContent: 'center',
    alignItems: 'center', marginTop: 10, gap: 10, shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  punchBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  regularizeBtn: { marginTop: 15, alignItems: 'center', paddingVertical: 10 },
  regularizeBtnText: { color: colors.secondary, fontWeight: '600', fontSize: 14 },
  historyCard: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  historyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 20 },
  calendarContainer: { width: '100%' },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  calMonthYear: { fontSize: 16, fontWeight: '700', color: colors.text },
  calRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  calDayHeader: { width: `${100/7}%`, alignItems: 'center' },
  calDayHeaderText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calDayCell: { width: `${100/7}%`, aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 16, marginBottom: 8, overflow: 'hidden' },
  gradientCell: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 16 },
  calDayText: { fontSize: 15, fontWeight: '700' },
  calDotIndicator: { position: 'absolute', bottom: 8, width: 6, height: 6, borderRadius: 3 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  statCard: {
    backgroundColor: colors.surface, flex: 1, marginHorizontal: 5, padding: 15,
    borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  statVal: { fontSize: 20, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 4 },
  dropdownContainer: { marginBottom: 20, zIndex: 100 },
  dropdownToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    marginTop: 8,
  },
  dropdownToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  dropdownMenu: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  regModalContent: {
    width: '95%',
    maxWidth: 600,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  regModalGradient: {
    padding: 24,
  },
  regModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  regModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  regModalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  regModalBody: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  regModalSide: {
    flex: 1,
  },
  sideTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  recordBox: {
    backgroundColor: 'rgba(241, 245, 249, 0.5)',
    borderRadius: 16,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  emptyRecord: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(241, 245, 249, 0.3)',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyRecordText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  reasonContainer: {
    marginBottom: 24,
  },
  regModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  submitBtn: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
