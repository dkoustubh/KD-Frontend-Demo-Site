import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Modal, TextInput, Platform, Alert } from 'react-native';
import Animated, { FadeInUp, ZoomIn, FadeInDown } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { mockProjects } from '../../mock/projects';
import { MapView, Marker, Circle } from '../../components/MapWrapper';
import { Search, MapPin, Navigation, Edit2, CheckCircle, X, Users, Activity } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const SiteLocationsScreen = () => {
  const [search, setSearch] = useState('');
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [mapLocation, setMapLocation] = useState<any>(null);
  const [radius, setRadius] = useState('100');
  const mapRef = useRef<any>(null);

  const filteredProjects = mockProjects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const openSiteMap = (site: any) => {
    setSelectedSite(site);
    setMapLocation(site.latitude && site.longitude ? { latitude: site.latitude, longitude: site.longitude } : { latitude: 20.5937, longitude: 78.9629 });
    setRadius((site.radius || 100).toString());
  };

  const saveGeofence = () => {
    // Mock save logic
    Alert.alert("Success", "Geofence location and radius updated successfully.");
    setSelectedSite(null);
  };

  const handleMapPress = (e: any) => {
    // MapLibre onPress gives coordinates in feature.geometry.coordinates -> [longitude, latitude]
    if (Platform.OS !== 'web' && e?.geometry?.coordinates) {
      setMapLocation({
        longitude: e.geometry.coordinates[0],
        latitude: e.geometry.coordinates[1]
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sites..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }) => (
          <AnimatedTouchable 
            entering={FadeInUp.delay(index * 100).springify()}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => openSiteMap(item)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>{item.logo}</Text>
              </View>
              {item.latitude ? (
                <View style={[styles.statusBadge, { backgroundColor: colors.accent + '20' }]}>
                  <CheckCircle size={12} color={colors.accent} style={{marginRight: 4}} />
                  <Text style={[styles.statusText, { color: colors.accent }]}>Pinned</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: colors.warning + '20' }]}>
                  <Activity size={12} color={colors.warning} style={{marginRight: 4}} />
                  <Text style={[styles.statusText, { color: colors.warning }]}>Unpinned</Text>
                </View>
              )}
            </View>

            <Text style={styles.projectName}>{item.name}</Text>
            <Text style={styles.projectId}>ID: {item.id}</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MapPin size={14} color={colors.textSecondary} />
                <Text style={styles.infoText}>{item.location}</Text>
              </View>
              <View style={styles.infoItem}>
                <Users size={14} color={colors.textSecondary} />
                <Text style={styles.infoText}>{item.members.length} Engineers</Text>
              </View>
            </View>
            
            <View style={styles.editBtn}>
              <Edit2 size={16} color={colors.primary} />
              <Text style={styles.editBtnText}>Set Geofence</Text>
            </View>
          </AnimatedTouchable>
        )}
      />

      <Modal visible={!!selectedSite} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          {selectedSite && (
            <>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Set Site Geofence</Text>
                  <Text style={styles.modalSubtitle}>{selectedSite.name} • Tap map to pinpoint</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedSite(null)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.mapContainer}>
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  initialRegion={{
                    latitude: mapLocation.latitude,
                    longitude: mapLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                  onPress={handleMapPress}
                >
                  <Marker
                    coordinate={{ latitude: mapLocation.latitude, longitude: mapLocation.longitude }}
                    title="Pinned Site"
                    pinColor={colors.primary}
                  />
                  <Circle
                    center={{ latitude: mapLocation.latitude, longitude: mapLocation.longitude }}
                    radius={parseInt(radius) || 100}
                    fillColor="rgba(0, 150, 255, 0.2)"
                    strokeColor="rgba(0, 150, 255, 0.5)"
                    strokeWidth={2}
                  />
                </MapView>
              </View>

              <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.controlsOverlay}>
                <View style={styles.controlGroup}>
                  <Text style={styles.controlLabel}>Geofence Radius (meters)</Text>
                  <TextInput 
                    style={styles.radiusInput}
                    value={radius}
                    onChangeText={setRadius}
                    keyboardType="numeric"
                    placeholder="e.g. 100"
                  />
                </View>
                
                <View style={styles.liveStatsRow}>
                  <Text style={styles.liveStatsLabel}>Current Engineers Near Site:</Text>
                  <Text style={styles.liveStatsValue}>{Math.floor(Math.random() * 5)}</Text>
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={saveGeofence}>
                  <Text style={styles.saveBtnText}>Save Configuration</Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
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
  },
  listContent: {
    padding: 10,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  projectName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  projectId: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 12,
  },
  infoRow: {
    gap: 8,
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    gap: 8,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  closeBtn: {
    padding: 10,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  controlGroup: {
    marginBottom: 20,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  radiusInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  liveStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  liveStatsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  liveStatsValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
