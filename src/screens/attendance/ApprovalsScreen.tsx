import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, Modal } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn, SlideInRight, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useAttendanceStore, RegularizationRequest, RegStatus } from '../../store/attendanceStore';
import { CheckCircle, XCircle, Clock, User, CalendarBlank, Notepad, ArrowRight, Funnel, CaretDown, SealCheck, PaperPlaneTilt, X, Trash, MagnifyingGlass, FunnelSimple, Calendar, CaretRight } from 'phosphor-react-native';
import { TextInput as RNTextInput } from 'react-native';

const { width } = Dimensions.get('window');

const STATUS_CONFIG: Record<RegStatus, { color: string; bg: string; icon: any }> = {
  Pending: { color: '#f9d494ff', bg: '#FEF3C7', icon: Clock },
  Approved: { color: '#10B981', bg: '#D1FAE5', icon: CheckCircle },
  Rejected: { color: '#EF4444', bg: '#FEE2E2', icon: XCircle },
};

const StatusBadge = ({ status }: { status: RegStatus }) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
      <Icon size={14} color={config.color} weight="bold" />
      <Text style={[styles.statusBadgeText, { color: config.color }]}>{status}</Text>
    </View>
  );
};

export const ApprovalsScreen = () => {
  const user = useAuthStore(state => state.user);
  const { regularizationRequests, approveRequest, rejectRequest, deleteRequest } = useAttendanceStore();
  const [filter, setFilter] = useState<RegStatus | 'All'>('All');
  const [detailModal, setDetailModal] = useState<RegularizationRequest | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successReq, setSuccessReq] = useState<RegularizationRequest | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | 'All'>('All');

  const department = user?.department || '';
  const allRequests = regularizationRequests.filter(r => r.department === department);

  // Advanced Filtering Logic
  const filteredRequests = allRequests.filter(req => {
    // Search match
    const searchMatch = req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.employeeId.toLowerCase().includes(searchQuery.toLowerCase());

    // Status match
    const statusMatch = filter === 'All' || req.status === filter;

    // Date/Month match
    let monthMatch = true;
    if (selectedMonth !== 'All') {
      const reqMonth = new Date(req.date).toLocaleString('default', { month: 'long' });
      monthMatch = reqMonth === selectedMonth;
    }

    return searchMatch && statusMatch && monthMatch;
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const pendingCount = allRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = allRequests.filter(r => r.status === 'Approved').length;
  const rejectedCount = allRequests.filter(r => r.status === 'Rejected').length;

  const handleApprove = (req: RegularizationRequest) => {
    try {
      approveRequest(req.id);
      setSuccessReq(req);
      setSuccessVisible(true);
      setDetailModal(null);

      // Auto hide success card after 3 seconds
      setTimeout(() => {
        setSuccessVisible(false);
        setSuccessReq(null);
      }, 3500);
    } catch (error) {
      Alert.alert('Error', 'Failed to approve request. Please try again.');
    }
  };

  const handleReject = (req: RegularizationRequest) => {
    Alert.alert(
      'Reject Request',
      `Reject regularization for ${req.employeeName} on ${req.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            rejectRequest(req.id);
            setDetailModal(null);
            Alert.alert('❌ Rejected', `Request from ${req.employeeName} has been rejected.`);
          },
        },
      ]
    );
  };

  const handleDelete = (req: RegularizationRequest) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to remove this regularization record from history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteRequest(req.id);
            setDetailModal(null);
          }
        }
      ]
    );
  };

  const RequestSection = ({ title, requests, icon: Icon, color }: { title: string, requests: RegularizationRequest[], icon: any, color: string }) => {
    if (requests.length === 0) return null;
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Icon size={20} color={color} weight="bold" />
          <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
          <View style={styles.badgeCount}>
            <Text style={styles.badgeCountText}>{requests.length}</Text>
          </View>
        </View>
        {requests.map((req, index) => (
          <Animated.View
            key={req.id}
            entering={SlideInRight.delay(index * 100).springify()}
            layout={Layout.springify()}
          >
            <TouchableOpacity
              style={styles.requestCard}
              activeOpacity={0.7}
              onPress={() => setDetailModal(req)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.employeeInfo}>
                  <View style={styles.empAvatar}>
                    <Text style={styles.empAvatarText}>{req.employeeName.split(' ').map(n => n[0]).join('')}</Text>
                  </View>
                  <View>
                    <Text style={styles.empName}>{req.employeeName}</Text>
                    <Text style={styles.empId}>ID: {req.employeeId}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDelete(req)} style={styles.trashBtn}>
                  <Trash size={20} color={colors.error} weight="light" />
                </TouchableOpacity>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.timingsRow}>
                <View style={styles.timingBlock}>
                  <Text style={styles.timingLabel}>Date</Text>
                  <Text style={styles.timingValue}>{req.date}</Text>
                </View>
                <View style={styles.timingBlock}>
                  <Text style={styles.timingLabel}>Old In/Out</Text>
                  <Text style={styles.timingValue}>{req.oldPunchIn || '--'} / {req.oldPunchOut || '--'}</Text>
                </View>
                <ArrowRight size={16} color={colors.textSecondary} />
                <View style={styles.timingBlock}>
                  <Text style={styles.timingLabel}>Requested</Text>
                  <Text style={[styles.timingValue, { color: colors.secondary }]}>{req.newPunchIn} / {req.newPunchOut}</Text>
                </View>
              </View>

              {req.status === 'Pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(req)}>
                    <CheckCircle size={18} color="#FFF" weight="bold" />
                    <Text style={styles.actionBtnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(req)}>
                    <XCircle size={18} color="#FFF" weight="bold" />
                    <Text style={styles.actionBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search & Filter Header */}
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Approvals Center</Text>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setIsFilterVisible(true)}>
            <FunnelSimple size={22} color="#FFF" weight="bold" />
            {(filter !== 'All' || selectedMonth !== 'All') && <View style={styles.filterIndicator} />}
          </TouchableOpacity>
        </View>

        <View style={styles.searchBarContainer}>
          <MagnifyingGlass size={20} color="rgba(255,255,255,0.6)" weight="bold" />
          <RNTextInput
            style={styles.searchField}
            placeholder="Search employee name or ID..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Quick Filter Pills */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.summaryRow}>
          <TouchableOpacity
            style={[styles.summaryPill, filter === 'Pending' && styles.summaryPillActive]}
            onPress={() => setFilter(filter === 'Pending' ? 'All' : 'Pending')}
          >
            <LinearGradient colors={['#FEF3C7', '#FDE68A']} style={styles.summaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Clock size={20} color="#F59E0B" weight="bold" />
              <Text style={styles.summaryCount}>{allRequests.filter(r => r.status === 'Pending').length}</Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.summaryPill, filter === 'Approved' && styles.summaryPillActive]}
            onPress={() => setFilter(filter === 'Approved' ? 'All' : 'Approved')}
          >
            <LinearGradient colors={['#D1FAE5', '#A7F3D0']} style={styles.summaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <CheckCircle size={20} color="#10B981" weight="bold" />
              <Text style={styles.summaryCount}>{allRequests.filter(r => r.status === 'Approved').length}</Text>
              <Text style={styles.summaryLabel}>Approved</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.summaryPill, filter === 'Rejected' && styles.summaryPillActive]}
            onPress={() => setFilter(filter === 'Rejected' ? 'All' : 'Rejected')}
          >
            <LinearGradient colors={['#FEE2E2', '#FECACA']} style={styles.summaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <XCircle size={20} color="#EF4444" weight="bold" />
              <Text style={styles.summaryCount}>{allRequests.filter(r => r.status === 'Rejected').length}</Text>
              <Text style={styles.summaryLabel}>Rejected</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Sections */}
        {filteredRequests.length === 0 ? (
          <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.emptyState}>
            <Notepad size={48} color={colors.textSecondary} weight="duotone" />
            <Text style={styles.emptyText}>No requests match your criteria.</Text>
            {(searchQuery !== '' || filter !== 'All' || selectedMonth !== 'All') && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setFilter('All'); setSelectedMonth('All'); }}>
                <Text style={styles.resetFilters}>Clear all filters</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        ) : (
          <>
            {(filter === 'All' || filter === 'Pending') && (
              <RequestSection
                title="Pending Approval"
                requests={filteredRequests.filter(r => r.status === 'Pending')}
                icon={Clock}
                color="#F59E0B"
              />
            )}
            {(filter === 'All' || filter === 'Approved') && (
              <RequestSection
                title="Approved History"
                requests={filteredRequests.filter(r => r.status === 'Approved')}
                icon={CheckCircle}
                color="#10B981"
              />
            )}
            {(filter === 'All' || filter === 'Rejected') && (
              <RequestSection
                title="Rejected"
                requests={filteredRequests.filter(r => r.status === 'Rejected')}
                icon={XCircle}
                color="#EF4444"
              />
            )}
          </>
        )}
      </ScrollView>

        {/* Detail Modal */}
        <Modal visible={!!detailModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            {detailModal && (
              <Animated.View entering={ZoomIn.springify().damping(15)} style={styles.modalContent}>
                <LinearGradient colors={['rgba(15,23,42,0.95)', 'rgba(30,41,59,0.95)']} style={styles.modalGradient}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Request Details</Text>
                    <StatusBadge status={detailModal.status} />
                  </View>

                  <View style={styles.modalDivider} />

                  {/* Employee Info */}
                  <View style={styles.modalRow}>
                    <User size={18} color="#94A3B8" weight="bold" />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.modalLabel}>Employee</Text>
                      <Text style={styles.modalValue}>{detailModal.employeeName} ({detailModal.employeeId})</Text>
                    </View>
                  </View>

                  <View style={styles.modalRow}>
                    <CalendarBlank size={18} color="#94A3B8" weight="bold" />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.modalLabel}>Date</Text>
                      <Text style={styles.modalValue}>{detailModal.date}</Text>
                    </View>
                  </View>

                  {/* Old vs New */}
                  <View style={styles.modalTimingsContainer}>
                    <View style={styles.modalTimingCard}>
                      <Text style={styles.modalTimingTitle}>Old Timings</Text>
                      <Text style={styles.modalTimingData}>In: {detailModal.oldPunchIn || 'Missing'}</Text>
                      <Text style={styles.modalTimingData}>Out: {detailModal.oldPunchOut || 'Missing'}</Text>
                    </View>
                    <ArrowRight size={20} color="#64748B" />
                    <View style={[styles.modalTimingCard, { borderColor: colors.secondary + '50' }]}>
                      <Text style={[styles.modalTimingTitle, { color: colors.secondary }]}>Requested</Text>
                      <Text style={styles.modalTimingData}>In: {detailModal.newPunchIn}</Text>
                      <Text style={styles.modalTimingData}>Out: {detailModal.newPunchOut}</Text>
                    </View>
                  </View>

                  {/* Reason */}
                  <View style={styles.modalReasonBox}>
                    <Notepad size={16} color="#94A3B8" weight="bold" />
                    <Text style={styles.modalReasonText}>{detailModal.reason}</Text>
                  </View>

                  {/* Actions */}
                  {detailModal.status === 'Pending' ? (
                    <View style={styles.modalActions}>
                      <TouchableOpacity style={styles.modalApproveBtn} onPress={() => handleApprove(detailModal)}>
                        <CheckCircle size={20} color="#FFF" weight="bold" />
                        <Text style={styles.modalActionText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.modalRejectBtn} onPress={() => handleReject(detailModal)}>
                        <XCircle size={20} color="#FFF" weight="bold" />
                        <Text style={styles.modalActionText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.modalActions}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '500', marginBottom: 10 }}>
                          {detailModal.status === 'Approved' ? '✅ This request has been approved.' : '❌ This request was rejected.'}
                        </Text>
                        <TouchableOpacity
                          style={[styles.modalRejectBtn, { backgroundColor: colors.error + '20', borderWidth: 1, borderColor: colors.error + '40' }]}
                          onPress={() => handleDelete(detailModal)}
                        >
                          <Trash size={18} color={colors.error} weight="bold" />
                          <Text style={[styles.modalActionText, { color: colors.error }]}>Delete Record</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setDetailModal(null)}>
                    <Text style={styles.modalCloseBtnText}>Close</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>
            )}
          </View>
        </Modal>

        {/* Success Animation Overlay */}
        <Modal visible={successVisible} transparent animationType="none">
          <View style={styles.successOverlay}>
            <Animated.View
              entering={ZoomIn.duration(500).springify()}
              style={styles.successCard}
            >
              <LinearGradient colors={['#10B981', '#059669']} style={styles.successGradient}>
                <TouchableOpacity
                  style={styles.closeSuccess}
                  onPress={() => setSuccessVisible(false)}
                >
                  <X size={20} color="#FFF" weight="bold" />
                </TouchableOpacity>

                <Animated.View entering={FadeInDown.delay(200)} style={styles.successIconBox}>
                  <SealCheck size={64} color="#FFF" weight="fill" />
                </Animated.View>

                <Text style={styles.successTitle}>Request Approved!</Text>
                <Text style={styles.successSub}>
                  Attendance for {successReq?.employeeName} on {successReq?.date} has been updated.
                </Text>

                <View style={styles.successDivider} />

                <View style={styles.successInfoRow}>
                  <PaperPlaneTilt size={20} color="#D1FAE5" weight="bold" />
                  <Text style={styles.successNotify}>Notification sent to employee</Text>
                </View>

                <TouchableOpacity
                  style={styles.successActionBtn}
                  onPress={() => setSuccessVisible(false)}
                >
                  <Text style={styles.successActionText}>Done</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </View>
        </Modal>

        {/* Advanced Filter Modal */}
        <Modal visible={isFilterVisible} transparent animationType="slide">
          <View style={styles.filterModalOverlay}>
            <Animated.View entering={FadeInUp.springify()} style={styles.filterModalContent}>
              <View style={styles.filterModalHeader}>
                <Text style={styles.filterModalTitle}>Advanced Filters</Text>
                <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Status Toggle Group */}
                <Text style={styles.filterGroupTitle}>Request Status</Text>
                <View style={styles.toggleGroup}>
                  {['All', 'Pending', 'Approved', 'Rejected'].map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.toggleItem, filter === s && styles.toggleItemActive]}
                      onPress={() => setFilter(s as any)}
                    >
                      <Text style={[styles.toggleText, filter === s && styles.toggleTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Month Selector */}
                <Text style={styles.filterGroupTitle}>Time Period (Month)</Text>
                <View style={styles.monthGrid}>
                  {['All', ...months].map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.monthItem, selectedMonth === m && styles.monthItemActive]}
                      onPress={() => setSelectedMonth(m)}
                    >
                      <Text style={[styles.monthText, selectedMonth === m && styles.monthTextActive]}>{m.slice(0, 3)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.filterSpacer} />
              </ScrollView>

              <View style={styles.filterFooter}>
                <TouchableOpacity
                  style={styles.filterResetBtn}
                  onPress={() => { setFilter('All'); setSelectedMonth('All'); }}
                >
                  <Text style={styles.filterResetText}>Reset All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.filterApplyBtn}
                  onPress={() => setIsFilterVisible(false)}
                >
                  <Text style={styles.filterApplyText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 60 },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  summaryPill: { flex: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  summaryPillActive: { borderColor: colors.primary },
  summaryGradient: { padding: 16, alignItems: 'center', gap: 6 },
  summaryCount: { fontSize: 24, fontWeight: '800', color: colors.text },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },

  sectionContainer: { marginBottom: 32 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  badgeCount: { backgroundColor: colors.border, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeCountText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },

  trashBtn: { padding: 8, borderRadius: 10, backgroundColor: colors.error + '10' },

  clearFilter: { color: colors.secondary, fontWeight: '600', fontSize: 14 },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16, color: colors.textSecondary, fontWeight: '500' },

  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  employeeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  empAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  empAvatarText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  empName: { fontSize: 16, fontWeight: '700', color: colors.text },
  empId: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },

  cardDivider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },

  timingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  timingBlock: { flex: 1 },
  timingLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  timingValue: { fontSize: 13, fontWeight: '700', color: colors.text },

  reasonText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', lineHeight: 19, marginBottom: 14 },

  actionRow: { flexDirection: 'row', gap: 10 },
  approveBtn: {
    flex: 1, flexDirection: 'row', height: 44, borderRadius: 12,
    backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  rejectBtn: {
    flex: 1, flexDirection: 'row', height: 44, borderRadius: 12,
    backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  actionBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modalContent: {
    width: '100%', maxWidth: 420, borderRadius: 24, overflow: 'hidden',
  },
  modalGradient: { padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#F1F5F9' },
  modalDivider: { height: 1, backgroundColor: 'rgba(148,163,184,0.2)', marginBottom: 20 },
  modalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  modalLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginBottom: 2 },
  modalValue: { fontSize: 15, color: '#F1F5F9', fontWeight: '600' },
  modalTimingsContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginVertical: 16, gap: 10,
  },
  modalTimingCard: {
    flex: 1, padding: 14, borderRadius: 14,
    backgroundColor: 'rgba(148,163,184,0.1)', borderWidth: 1, borderColor: 'rgba(148,163,184,0.15)',
  },
  modalTimingTitle: { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginBottom: 8 },
  modalTimingData: { fontSize: 14, color: '#E2E8F0', fontWeight: '600', marginBottom: 3 },
  modalReasonBox: {
    flexDirection: 'row', padding: 14, borderRadius: 12,
    backgroundColor: 'rgba(148,163,184,0.08)', gap: 10, alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalReasonText: { flex: 1, fontSize: 14, color: '#CBD5E1', fontWeight: '500', lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'center', justifyContent: 'center' },
  modalApproveBtn: {
    flex: 1, flexDirection: 'row', height: 48, borderRadius: 14,
    backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  modalRejectBtn: {
    flex: 1, flexDirection: 'row', height: 48, borderRadius: 14,
    backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  modalActionText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  modalCloseBtn: {
    alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 30,
  },
  modalCloseBtnText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },

  // Header & Search
  headerGradient: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 54,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchField: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  scrollView: { flex: 1 },
  resetFilters: { color: colors.secondary, fontWeight: '700', marginTop: 10, fontSize: 15 },

  // Filter Modal
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '80%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  filterGroupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginTop: 8,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
  },
  toggleItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleItemActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  monthItem: {
    width: (width - 88) / 4,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthItemActive: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  monthText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  monthTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  filterSpacer: { height: 40 },
  filterFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 20,
  },
  filterResetBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  filterResetText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterApplyBtn: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  filterApplyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },

  // Success Card
  successOverlay: {
    flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  successCard: {
    width: '100%', maxWidth: 340, borderRadius: 32, overflow: 'hidden',
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4, shadowRadius: 30, elevation: 20,
  },
  successGradient: { padding: 30, alignItems: 'center' },
  closeSuccess: { position: 'absolute', top: 20, right: 20 },
  successIconBox: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 12 },
  successSub: {
    fontSize: 15, color: '#D1FAE5', textAlign: 'center',
    lineHeight: 22, marginBottom: 24, fontWeight: '500'
  },
  successDivider: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 20 },
  successInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 30 },
  successNotify: { fontSize: 14, color: '#FFF', fontWeight: '600' },
  successActionBtn: {
    width: '100%', height: 56, borderRadius: 16,
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8,
  },
  successActionText: { color: '#059669', fontSize: 18, fontWeight: '800' },
});
