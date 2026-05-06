import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { Bell, X, CheckCircle, Info, Warning, Prohibit, Trash } from 'phosphor-react-native';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';
import { BlurView } from 'expo-blur';
import Animated, { FadeInRight, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const NotificationBell = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const user = useAuthStore(state => state.user);
  const { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  
  const notifications = user ? getUserNotifications(user.id) : [];
  const unreadCount = user ? getUnreadCount(user.id) : 0;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={24} color="#10B981" weight="fill" />;
      case 'warning': return <Warning size={24} color="#F59E0B" weight="fill" />;
      case 'error': return <Prohibit size={24} color="#EF4444" weight="fill" />;
      default: return <Info size={24} color="#3B82F6" weight="fill" />;
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.bellContainer} 
        onPress={() => setModalVisible(true)}
      >
        <Bell size={24} color={colors.primary} weight="duotone" />
        {unreadCount > 0 && (
          <Animated.View entering={ZoomIn} style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </Animated.View>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.dismissOverlay} 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)} 
          />
          
          <Animated.View entering={FadeInRight} style={styles.modalContent}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.modalHeader} start={{x:0,y:0}} end={{x:1,y:0}}>
              <View style={styles.headerTop}>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={() => user && markAllAsRead(user.id)}>
                  <Text style={styles.markAll}>Mark all as read</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>

            <ScrollView style={styles.notifList} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Bell size={48} color={colors.border} weight="light" />
                  <Text style={styles.emptyText}>No notifications yet</Text>
                </View>
              ) : (
                notifications.map((item, index) => (
                  <Animated.View 
                    key={item.id} 
                    entering={FadeInUp.delay(index * 100)}
                  >
                    <TouchableOpacity 
                      style={[styles.notifItem, !item.isRead && styles.unreadNotif]}
                      onPress={() => markAsRead(item.id)}
                    >
                      <View style={styles.notifIcon}>
                        {getIcon(item.type)}
                      </View>
                      <View style={styles.notifBody}>
                        <Text style={[styles.notifTitle, !item.isRead && styles.unreadText]}>{item.title}</Text>
                        <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
                        <Text style={styles.notifTime}>{formatTime(item.timestamp)}</Text>
                      </View>
                      {!item.isRead && <View style={styles.unreadDot} />}
                    </TouchableOpacity>
                  </Animated.View>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bellContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 10,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    flexDirection: 'row',
  },
  dismissOverlay: {
    flex: 1,
  },
  modalContent: {
    width: width * 0.85,
    maxWidth: 360,
    height: height,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  modalHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  markAll: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  notifList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  notifItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  unreadNotif: {
    backgroundColor: colors.primary + '05',
  },
  notifIcon: {
    marginRight: 15,
    justifyContent: 'center',
  },
  notifBody: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: '800',
  },
  notifMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    marginLeft: 10,
  },
});
