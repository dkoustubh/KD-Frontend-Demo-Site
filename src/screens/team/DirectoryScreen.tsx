import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, TextInput, Modal, Image } from 'react-native';
import Animated, { FadeInDown, Layout, ZoomIn, FadeInRight, SlideInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { mockUsers } from '../../mock/users';
import { 
  Buildings, CaretDown, CaretRight, MagnifyingGlass, UserCircle, 
  X, PencilSimple, EnvelopeSimple, Phone, IdentificationCard, 
  Briefcase, CalendarBlank, TreeStructure, UsersThree, 
  ShieldCheck, UserGear, GraduationCap, MapPin
} from 'phosphor-react-native';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

// --- Helper Components ---

const TreeNode = ({ label, icon: Icon, children, isRoot, isOpen, onToggle, level = 0 }: any) => {
  return (
    <View style={[styles.treeNode, { marginLeft: level > 0 ? 20 : 0 }]}>
      {level > 0 && <View style={styles.treeLineVertical} />}
      {level > 0 && <View style={styles.treeLineHorizontal} />}
      
      <TouchableOpacity 
        style={[
          styles.nodeHeader, 
          isRoot && styles.rootNode,
          level === 1 && styles.deptNode,
          level === 2 && styles.roleNode
        ]} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.nodeIconContainer}>
          <Icon size={isRoot ? 24 : 20} color={isRoot ? '#FFF' : colors.primary} weight="duotone" />
        </View>
        <Text style={[styles.nodeLabel, isRoot && styles.rootLabel]}>{label}</Text>
        {children && children.length > 0 && (
          <View style={styles.nodeChevron}>
            {isOpen ? <CaretDown size={16} color={isRoot ? '#FFF' : colors.textSecondary} /> : <CaretRight size={16} color={isRoot ? '#FFF' : colors.textSecondary} />}
          </View>
        )}
      </TouchableOpacity>

      {isOpen && children && (
        <Animated.View entering={FadeInDown.duration(200)} style={styles.nodeChildren}>
          {children}
        </Animated.View>
      )}
    </View>
  );
};

const UserLeaf = ({ user, onSelect, level }: any) => (
  <TouchableOpacity 
    style={[styles.userLeaf, { marginLeft: 20 }]} 
    onPress={() => onSelect(user)}
    activeOpacity={0.6}
  >
    <View style={styles.treeLineVerticalSmall} />
    <View style={styles.treeLineHorizontalSmall} />
    
    <View style={styles.leafAvatar}>
      <Text style={styles.leafAvatarText}>{user.avatar}</Text>
    </View>
    <View style={styles.leafInfo}>
      <Text style={styles.leafName}>{user.name}</Text>
      <View style={styles.leafBadge}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(user.status) }]} />
        <Text style={styles.leafRole}>{user.role} • {user.id}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
    case 'On-Site':
    case 'Office': return '#10B981';
    case 'Leave': return '#F59E0B';
    default: return '#EF4444';
  }
};

// --- Main Component ---

export const DirectoryScreen = () => {
  const currentUser = useAuthStore(state => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ 'root': true });

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Grouping Logic for Tree
  const treeData = useMemo(() => {
    const admin = mockUsers.find(u => u.role === 'Admin');
    const departments = Array.from(new Set(mockUsers.map(u => u.department))).sort();
    
    return {
      id: 'root',
      label: 'ATS Organizational Structure',
      icon: TreeStructure,
      admin: admin,
      departments: departments.map(dept => {
        const deptUsers = mockUsers.filter(u => u.department === dept);
        const hod = deptUsers.find(u => u.role === 'HOD');
        const engineers = deptUsers.filter(u => u.role === 'Engineer');
        
        return {
          id: dept,
          label: dept,
          icon: Buildings,
          hod: hod,
          engineers: engineers
        };
      })
    };
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return [];
    return mockUsers.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8);
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Directory</Text>
          <Text style={styles.headerSubtitle}>Official Enterprise Hierarchy</Text>
        </View>
        <View style={styles.statsBadge}>
          <Text style={styles.statsText}>{mockUsers.length} Total Members</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MagnifyingGlass size={18} color="#94A3B8" weight="bold" />
          <TextInput 
            placeholder="Search team members..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{padding: 4}}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
        
        {searchQuery && filteredUsers.length > 0 && (
          <Animated.View entering={FadeInDown} style={styles.searchResults}>
            {filteredUsers.map(user => (
              <TouchableOpacity key={user.id} style={styles.searchItem} onPress={() => {setSelectedUser(user); setSearchQuery('');}}>
                <View style={styles.searchAvatar}><Text style={styles.searchAvatarText}>{user.avatar}</Text></View>
                <View>
                  <Text style={styles.searchName}>{user.name}</Text>
                  <Text style={styles.searchMeta}>{user.id} • {user.department}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TreeNode 
          label={treeData.label} 
          icon={treeData.icon} 
          isRoot 
          isOpen={expandedNodes['root']} 
          onToggle={() => toggleNode('root')}
        >
          {/* Admin Level */}
          {treeData.admin && (
            <UserLeaf 
              user={treeData.admin} 
              onSelect={setSelectedUser} 
              level={1}
            />
          )}

          {/* Departments */}
          {treeData.departments.map(dept => (
            <TreeNode 
              key={dept.id}
              label={dept.label}
              icon={dept.icon}
              isOpen={expandedNodes[dept.id]}
              onToggle={() => toggleNode(dept.id)}
              level={1}
            >
              {/* HOD Level */}
              {dept.hod && (
                <UserLeaf 
                  user={dept.hod} 
                  onSelect={setSelectedUser} 
                  level={2}
                />
              )}

              {/* Engineer List (Grouped) */}
              {dept.engineers.length > 0 && (
                <TreeNode 
                  label={`Engineers (${dept.engineers.length})`}
                  icon={GraduationCap}
                  isOpen={expandedNodes[`${dept.id}-eng`]}
                  onToggle={() => toggleNode(`${dept.id}-eng`)}
                  level={2}
                >
                  {dept.engineers.map(eng => (
                    <UserLeaf 
                      key={eng.id}
                      user={eng}
                      onSelect={setSelectedUser}
                      level={3}
                    />
                  ))}
                </TreeNode>
              )}
            </TreeNode>
          ))}
        </TreeNode>
      </ScrollView>

      {/* Profile Modal */}
      <Modal visible={!!selectedUser} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismiss} onPress={() => setSelectedUser(null)} />
          <Animated.View entering={SlideInUp} style={styles.modalContent}>
            {selectedUser && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.profileAvatar, { backgroundColor: getStatusColor(selectedUser.status) }]}>
                    <Text style={styles.profileAvatarText}>{selectedUser.avatar}</Text>
                  </View>
                  <View style={styles.profileHeaderInfo}>
                    <Text style={styles.profileName}>{selectedUser.name}</Text>
                    <Text style={styles.profileId}>{selectedUser.id} • {selectedUser.role}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedUser(null)} style={styles.closeBtn}>
                    <X size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.profileDetails}>
                  <DetailRow icon={Briefcase} label="Department" value={selectedUser.department} />
                  <DetailRow icon={EnvelopeSimple} label="Email Address" value={selectedUser.email} />
                  <DetailRow icon={Phone} label="Contact Number" value={selectedUser.phone} />
                  <DetailRow icon={MapPin} label="Current Status" value={selectedUser.status} statusColor={getStatusColor(selectedUser.status)} />
                </View>

                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionText}>View Performance Report</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const DetailRow = ({ icon: Icon, label, value, statusColor }: any) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIconBox}>
      <Icon size={20} color={colors.textSecondary} weight="duotone" />
    </View>
    <View style={styles.detailTextContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {statusColor && <View style={[styles.statusDotSmall, { backgroundColor: statusColor }]} />}
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A', letterSpacing: -1 },
  headerSubtitle: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 2 },
  statsBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  statsText: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  searchContainer: { paddingHorizontal: 24, marginBottom: 20, zIndex: 100 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '500', color: '#1E293B' },
  searchResults: { backgroundColor: '#FFF', borderRadius: 12, marginTop: 8, padding: 8, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  searchItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
  searchAvatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  searchAvatarText: { color: '#64748B', fontWeight: '700', fontSize: 12 },
  searchName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  searchMeta: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  
  // Minimal Tree Styles
  treeNode: { marginBottom: 8 },
  treeLineVertical: { position: 'absolute', left: -12, top: 0, bottom: 0, width: 1, backgroundColor: '#CBD5E1' },
  treeLineHorizontal: { position: 'absolute', left: -12, top: 24, width: 12, height: 1, backgroundColor: '#CBD5E1' },
  treeLineVerticalSmall: { position: 'absolute', left: -12, top: 0, height: 24, width: 1, backgroundColor: '#CBD5E1' },
  treeLineHorizontalSmall: { position: 'absolute', left: -12, top: 24, width: 12, height: 1, backgroundColor: '#CBD5E1' },
  
  nodeHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 14, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
  },
  rootNode: { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' },
  deptNode: { backgroundColor: '#FFF', borderLeftWidth: 3, borderLeftColor: '#64748B' },
  roleNode: { backgroundColor: 'transparent', borderWidth: 0, paddingVertical: 10 },
  
  nodeIconContainer: { marginRight: 12, opacity: 0.7 },
  nodeLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#334155' },
  rootLabel: { color: '#0F172A', fontWeight: '800' },
  nodeChevron: { marginLeft: 8, opacity: 0.5 },
  nodeChildren: { marginTop: 4 },
  
  userLeaf: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  leafAvatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  leafAvatarText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  leafInfo: { marginLeft: 16, flex: 1 },
  leafName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  leafBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  leafRole: { fontSize: 11, color: '#64748B', fontWeight: '500' },

  // Modal (Muted Profile)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.3)', justifyContent: 'flex-end' },
  modalDismiss: { flex: 1 },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  profileAvatar: { width: 60, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  profileAvatarText: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  profileHeaderInfo: { flex: 1, marginLeft: 16 },
  profileName: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  profileId: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 1 },
  closeBtn: { padding: 8, borderRadius: 8, backgroundColor: '#F1F5F9' },
  
  profileDetails: { marginBottom: 30 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  detailIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  detailTextContent: { marginLeft: 15, flex: 1 },
  detailLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  detailValue: { fontSize: 15, color: '#334155', fontWeight: '600' },
  statusDotSmall: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  
  actionBtn: { height: 52, borderRadius: 12, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
