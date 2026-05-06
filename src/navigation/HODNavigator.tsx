import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';
import { HODDashboardScreen } from '../screens/dashboards/HODDashboardScreen';
import { ProjectListScreen } from '../screens/projects/ProjectListScreen';
import { TeamScreen } from '../screens/team/TeamScreen';
import { AttendanceScreen } from '../screens/attendance/AttendanceScreen';
import { HODMapScreen } from '../screens/map/HODMapScreen';
import { SiteLocationsScreen } from '../screens/map/SiteLocationsScreen';
import { ApprovalsScreen } from '../screens/attendance/ApprovalsScreen';
import { SignOut, House, Users, FolderOpen, CalendarBlank, CheckSquare, Bell, Gear, MapTrifold, MapPin, CaretRight } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, SlideInLeft } from 'react-native-reanimated';
import { NotificationBell } from '../components/NotificationBell';

const Drawer = createDrawerNavigator();
const { width } = Dimensions.get('window');

const CustomDrawerContent = (props: any) => {
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const currentRoute = props.state.routes[props.state.index].name;

  const handleLogout = () => {
    logout();
    props.navigation.replace('Login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: House, route: 'Dashboard' },
    { label: 'My Team', icon: Users, route: 'Team' },
    { label: 'Live Map', icon: MapTrifold, route: 'Map' },
    { label: 'Site Locations', icon: MapPin, route: 'SiteLocations' },
    { label: 'Projects', icon: FolderOpen, route: 'Projects' },
    { label: 'Team Attendance', icon: CalendarBlank, route: 'Attendance' },
    { label: 'Approvals', icon: CheckSquare, route: 'Approvals' },
    { label: 'Notifications', icon: Bell, route: 'Notifications' },
    { label: 'Settings', icon: Gear, route: 'Settings' },
  ];

  return (
    <View style={styles.drawerContainer}>
      {/* Premium Header */}
      <LinearGradient 
        colors={[colors.primary, colors.secondary]} 
        style={styles.drawerHeader}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarGlow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.avatar || 'DH'}</Text>
            </View>
          </View>
          <View style={styles.userInfoText}>
            <Text style={styles.userName}>{user?.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user?.role || 'HOD'}</Text>
            </View>
            <Text style={styles.deptName}>{user?.department}</Text>
          </View>
        </View>
      </LinearGradient>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            
            return (
              <Animated.View 
                key={index} 
                entering={FadeInDown.delay(index * 50).springify()}
              >
                <TouchableOpacity 
                  style={[styles.menuItem, isActive && styles.activeMenuItem]}
                  onPress={() => props.navigation.navigate(item.route)}
                >
                  <View style={[styles.iconBox, isActive && styles.activeIconBox]}>
                    <Icon 
                      size={20} 
                      color={isActive ? colors.primary : colors.textSecondary} 
                      weight={isActive ? "fill" : "duotone"} 
                    />
                  </View>
                  <Text style={[styles.menuText, isActive && styles.activeMenuText]}>
                    {item.label}
                  </Text>
                  {isActive && (
                    <Animated.View entering={SlideInLeft} style={styles.activeIndicator} />
                  )}
                  {!isActive && <CaretRight size={14} color={colors.border} weight="bold" />}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <View style={styles.logoutIconBox}>
            <SignOut size={20} color={colors.error} weight="bold" />
          </View>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>v1.2.4 Premium</Text>
      </View>
    </View>
  );
};

export const HODNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerRight: () => <NotificationBell />,
        drawerStyle: {
          backgroundColor: colors.background,
          width: Math.min(width * 0.75, 300),
        },
        sceneStyle: { backgroundColor: colors.background }
      }}
    >
      <Drawer.Screen name="Dashboard" component={HODDashboardScreen} />
      <Drawer.Screen name="Team" component={TeamScreen} />
      <Drawer.Screen name="Map" component={HODMapScreen} />
      <Drawer.Screen name="SiteLocations" component={SiteLocationsScreen} />
      <Drawer.Screen name="Projects" component={ProjectListScreen} />
      <Drawer.Screen name="Attendance" component={AttendanceScreen} />
      {/* Placeholders for others */}
      <Drawer.Screen name="Approvals" component={ApprovalsScreen} />
      <Drawer.Screen name="Notifications" component={HODDashboardScreen} />
      <Drawer.Screen name="Settings" component={HODDashboardScreen} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  drawerHeader: {
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGlow: {
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  userInfoText: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    marginTop: 4,
  },
  roleBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  deptName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
  scrollContent: {
    paddingTop: 10,
  },
  menuContainer: {
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 4,
    borderRadius: 16,
  },
  activeMenuItem: {
    backgroundColor: colors.primary + '10',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeIconBox: {
    backgroundColor: '#FFF',
    borderColor: colors.primary + '20',
  },
  menuText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginLeft: 12,
    fontWeight: '600',
    flex: 1,
  },
  activeMenuText: {
    color: colors.primary,
    fontWeight: '800',
  },
  activeIndicator: {
    width: 4,
    height: 20,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginLeft: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.error + '08',
  },
  logoutIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    color: colors.error,
    marginLeft: 12,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 15,
    opacity: 0.5,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
