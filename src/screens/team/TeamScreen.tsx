import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Dimensions, ScrollView, Alert } from 'react-native';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { mockUsers } from '../../mock/users';
import { useAuthStore } from '../../store/authStore';
import { MagnifyingGlass, CaretDown, CaretUp, MapPin, EnvelopeSimple, Phone, PencilSimple, X, IdentificationCard, Briefcase, UserCircle, CalendarBlank } from 'phosphor-react-native';

const { width } = Dimensions.get('window');

const EmployeeCard = ({ user, index, onSelectUser }: any) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'On-Site': return '#50E3C2';
      case 'Office': return '#4A90E2';
      case 'Leave': return '#F5A623';
      case 'Absent': return '#FF4B4B';
      default: return '#8E2DE2';
    }
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 50).springify()} style={styles.card}>
      <TouchableOpacity 
        style={styles.cardHeader} 
        activeOpacity={0.7} 
        onPress={() => onSelectUser(user)}
      >
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.avatar}</Text>
          </View>
          <View>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.role}>{user.id} • {user.role}</Text>
          </View>
        </View>
        <View style={styles.statusBox}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(user.status) }]} />
          <Text style={{fontSize: 12, fontWeight: '600', color: '#8A8A8E'}}>{user.status}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const TeamScreen = () => {
  const currentUser = useAuthStore(state => state.user);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const teamMembers = useMemo(() => {
    return mockUsers.filter(u => u.department === currentUser?.department && u.id !== currentUser?.id);
  }, [currentUser]);

  const filtered = useMemo(() => {
    if (!search.trim()) return teamMembers;
    return teamMembers.filter(u => 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, teamMembers]);

  const handleEditClick = () => {
    Alert.alert("Edit Employee", "HOD Edit Interface opened for " + selectedUser?.name);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MagnifyingGlass size={20} color={colors.textSecondary} weight="bold" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${currentUser?.department} team...`}
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X size={20} color={colors.textSecondary} weight="bold" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({item, index}) => <EmployeeCard user={item} index={index} onSelectUser={setSelectedUser} />}
        ListEmptyComponent={
          <View style={{alignItems: 'center', marginTop: 50}}>
            <Text style={{color: '#8A8A8E', fontSize: 16, fontWeight: '500'}}>No team members found.</Text>
          </View>
        }
      />

      {/* Full Screen Profile Modal */}
      <Modal visible={!!selectedUser} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <LinearGradient 
            colors={['rgba(26, 11, 46, 0.95)', 'rgba(142, 45, 226, 0.95)']} 
            style={StyleSheet.absoluteFill} 
          />
          <ScrollView contentContainerStyle={{padding: 20, paddingTop: 60, paddingBottom: 60}}>
            <TouchableOpacity 
              style={styles.closeModalBtn} 
              onPress={() => setSelectedUser(null)}
            >
              <X size={24} color="#FFF" weight="bold" />
            </TouchableOpacity>

            {selectedUser && (
              <Animated.View entering={FadeInDown.springify()} style={styles.profileContainer}>
                
                <View style={styles.profileHeaderCard}>
                  <View style={styles.profileAvatarLarge}>
                    <Text style={styles.profileAvatarText}>{selectedUser.avatar}</Text>
                  </View>
                  <Text style={styles.profileNameLarge}>{selectedUser.name}</Text>
                  <Text style={styles.profileRoleText}>{selectedUser.role} • {selectedUser.department}</Text>
                  
                  <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, {backgroundColor: selectedUser.status === 'Active' || selectedUser.status === 'On-Site' ? '#50E3C2' : '#FF4B4B'}]} />
                    <Text style={styles.statusBadgeText}>{selectedUser.status}</Text>
                  </View>

                  <TouchableOpacity style={styles.editBtn} onPress={handleEditClick}>
                    <PencilSimple size={18} color="#FFF" weight="bold" style={{marginRight: 8}} />
                    <Text style={styles.editBtnText}>Edit Team Member</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.glassInfoCard}>
                  <Text style={styles.glassCardTitle}>Contact Information</Text>
                  <View style={styles.infoRow}>
                    <EnvelopeSimple size={20} color="#8A8A8E" weight="duotone" />
                    <Text style={styles.infoText}>{selectedUser.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Phone size={20} color="#8A8A8E" weight="duotone" />
                    <Text style={styles.infoText}>{selectedUser.phone}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MapPin size={20} color="#8A8A8E" weight="duotone" />
                    <Text style={styles.infoText}>Location: {selectedUser.status}</Text>
                  </View>
                </View>

                <View style={styles.glassInfoCard}>
                  <Text style={styles.glassCardTitle}>Organization Details</Text>
                  <View style={styles.infoRow}>
                    <IdentificationCard size={20} color="#8A8A8E" weight="duotone" />
                    <Text style={styles.infoText}>EMP ID: {selectedUser.id}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Briefcase size={20} color="#8A8A8E" weight="duotone" />
                    <Text style={styles.infoText}>Dept: {selectedUser.department}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <UserCircle size={20} color="#8A8A8E" weight="duotone" />
                    <Text style={styles.infoText}>Reports To: {currentUser?.name || 'Dept Head'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <CalendarBlank size={20} color="#8A8A8E" weight="duotone" />
                    <Text style={styles.infoText}>DOJ: 12 Aug 2023</Text>
                  </View>
                </View>

                <View style={styles.glassInfoCard}>
                  <Text style={styles.glassCardTitle}>Attendance Summary</Text>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                    <View style={styles.statBox}>
                      <Text style={styles.statVal}>92%</Text>
                      <Text style={styles.statLabel}>Present</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statVal}>5%</Text>
                      <Text style={styles.statLabel}>Leaves</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statVal}>3%</Text>
                      <Text style={styles.statLabel}>Absent</Text>
                    </View>
                  </View>
                </View>

              </Animated.View>
            )}
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    margin: 20,
    paddingHorizontal: 15,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: colors.text,
    fontSize: 16,
    fontWeight: '500'
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(142, 45, 226, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#8E2DE2',
    fontSize: 18,
    fontWeight: '700',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  role: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  modalBg: { flex: 1 },
  closeModalBtn: { position: 'absolute', top: 50, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  profileContainer: { flex: 1, marginTop: 40 },
  profileHeaderCard: { alignItems: 'center', marginBottom: 30 },
  profileAvatarLarge: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  profileAvatarText: { fontSize: 36, fontWeight: '800', color: '#8E2DE2' },
  profileNameLarge: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 5 },
  profileRoleText: { fontSize: 15, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 15 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 20 },
  statusBadgeText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20 },
  editBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  
  glassInfoCard: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 24, padding: 24, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8 },
  glassCardTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  infoText: { fontSize: 15, color: '#1A1A1A', fontWeight: '600', marginLeft: 15 },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 24, fontWeight: '800', color: '#8E2DE2' },
  statLabel: { fontSize: 12, color: '#8A8A8E', fontWeight: '600', marginTop: 4 }
});
