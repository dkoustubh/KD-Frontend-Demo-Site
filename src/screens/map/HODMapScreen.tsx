import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { mockProjects } from '../../mock/projects';
import { mockUsers } from '../../mock/users';
import { MapView, Marker, Circle } from '../../components/MapWrapper';
import { NavigationArrow, Users, Crosshair, Faders } from 'phosphor-react-native';

const { width } = Dimensions.get('window');

export const HODMapScreen = () => {
  const mapRef = useRef<any>(null);
  const [selectedSite, setSelectedSite] = useState<any>(null);

  const activeEngineers = mockUsers.filter(u => u.latitude && u.longitude);

  const focusSite = (site: any) => {
    setSelectedSite(site);
    if (mapRef.current && Platform.OS !== 'web') {
      mapRef.current.animateToRegion({
        latitude: site.latitude,
        longitude: site.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 20.5937,
            longitude: 78.9629,
            latitudeDelta: 15,
            longitudeDelta: 15,
          }}
        >
          {/* Sites and Radiuses */}
          {mockProjects.filter(p => p.latitude && p.longitude).map(site => (
            <React.Fragment key={`site-${site.id}`}>
              <Marker
                coordinate={{ latitude: site.latitude!, longitude: site.longitude! }}
                title={site.name}
                description="Project Site"
                pinColor={colors.primary}
                onPress={() => setSelectedSite(site)}
              />
              <Circle
                center={{ latitude: site.latitude!, longitude: site.longitude! }}
                radius={site.radius || 100}
                fillColor="rgba(0, 150, 255, 0.15)"
                strokeColor="rgba(0, 150, 255, 0.4)"
                strokeWidth={2}
              />
            </React.Fragment>
          ))}

          {/* Engineers */}
          {activeEngineers.map(eng => (
            <Marker
              key={`eng-${eng.id}`}
              coordinate={{ latitude: eng.latitude!, longitude: eng.longitude! }}
              title={eng.name}
              description={`Status: ${eng.status}`}
              pinColor={eng.status === 'On-Site' ? colors.accent : colors.warning}
            />
          ))}
        </MapView>
        
        <View style={styles.mapOverlayControls}>
          <TouchableOpacity style={styles.controlBtn}>
            <Faders size={20} color={colors.text} weight="bold" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn}>
            <Crosshair size={20} color={colors.text} weight="bold" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.bottomSheet}>
        <Text style={styles.sheetTitle}>Active Sites</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.siteList}>
          {mockProjects.filter(p => p.latitude).map(site => (
            <TouchableOpacity 
              key={site.id} 
              style={[styles.siteCard, selectedSite?.id === site.id && styles.siteCardActive]}
              onPress={() => focusSite(site)}
            >
              <Text style={[styles.siteName, selectedSite?.id === site.id && styles.siteNameActive]}>{site.name}</Text>
              <View style={styles.siteRow}>
                <NavigationArrow size={12} color={selectedSite?.id === site.id ? '#FFF' : colors.textSecondary} weight="bold" />
                <Text style={[styles.siteLoc, selectedSite?.id === site.id && styles.siteLocActive]}>{site.location}</Text>
              </View>
              <View style={styles.siteRow}>
                <Users size={12} color={selectedSite?.id === site.id ? '#FFF' : colors.textSecondary} weight="bold" />
                <Text style={[styles.siteLoc, selectedSite?.id === site.id && styles.siteLocActive]}>{site.members.length} Engineers</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlayControls: {
    position: 'absolute',
    right: 20,
    top: 20,
    gap: 10,
  },
  controlBtn: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 15,
  },
  siteList: {
    flexDirection: 'row',
  },
  siteCard: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 16,
    marginRight: 15,
    width: 200,
    borderWidth: 1,
    borderColor: colors.border,
  },
  siteCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  siteName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  siteNameActive: {
    color: '#FFF',
  },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  siteLoc: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  siteLocActive: {
    color: '#FFF',
  }
});
