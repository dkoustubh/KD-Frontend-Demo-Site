import React, { useMemo } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { MapPin } from 'lucide-react-native';

let MapLibreGL: any = null;
let turfCircle: any = null;
let turfHelpers: any = null;

if (Platform.OS !== 'web') {
  MapLibreGL = require('@maplibre/maplibre-react-native').default;
  MapLibreGL.setAccessToken(null); // No paid API token needed for OSM
  
  turfCircle = require('@turf/circle').default;
  turfHelpers = require('@turf/helpers');
}

export const MapView = React.forwardRef((props: any, ref: any) => {
  if (Platform.OS === 'web') {
    return (
      <View style={[props.style, styles.webFallback]}>
        <MapPin size={40} color={colors.primary} style={{marginBottom: 10}} />
        <Text style={styles.webFallbackText}>MapLibre OSM is visible on iOS/Android</Text>
        <Text style={styles.webFallbackSub}>Live GPS data is simulated for Web testing.</Text>
        {props.children}
      </View>
    );
  }

  return (
    <MapLibreGL.MapView 
      ref={ref}
      style={props.style} 
      logoEnabled={false}
      attributionEnabled={false}
      styleURL={MapLibreGL.StyleURL.Default}
    >
      <MapLibreGL.RasterSource
        id="osmSource"
        tileUrlTemplates={['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png']}
        tileSize={256}
      >
        <MapLibreGL.RasterLayer id="osmLayer" sourceID="osmSource" />
      </MapLibreGL.RasterSource>
      
      {props.initialRegion && (
        <MapLibreGL.Camera
          zoomLevel={15}
          centerCoordinate={[props.initialRegion.longitude, props.initialRegion.latitude]}
          animationDuration={props.animationDuration || 1000}
        />
      )}
      {props.children}
    </MapLibreGL.MapView>
  );
});

export const Marker = ({ coordinate, title, pinColor, id, onPress }: any) => {
  if (Platform.OS === 'web') return null;
  const markerId = id || `marker-${coordinate.latitude}-${coordinate.longitude}`;
  
  return (
    <MapLibreGL.PointAnnotation
      id={markerId}
      coordinate={[coordinate.longitude, coordinate.latitude]}
      onSelected={onPress}
    >
      <View style={[styles.markerContainer, { backgroundColor: pinColor || colors.primary }]}>
        <View style={styles.markerInner} />
      </View>
    </MapLibreGL.PointAnnotation>
  );
};

export const Circle = ({ center, radius, fillColor, strokeColor, strokeWidth, id }: any) => {
  if (Platform.OS === 'web' || !turfCircle) return null;
  const circleId = id || `circle-${center.latitude}-${center.longitude}`;

  const polygon = useMemo(() => {
    return turfCircle(
      [center.longitude, center.latitude], 
      radius / 1000, 
      { steps: 64, units: 'kilometers' }
    );
  }, [center.latitude, center.longitude, radius]);

  return (
    <MapLibreGL.ShapeSource id={`${circleId}-source`} shape={polygon}>
      <MapLibreGL.FillLayer
        id={`${circleId}-fill`}
        style={{ fillColor: fillColor || 'rgba(0, 150, 255, 0.2)' }}
      />
      <MapLibreGL.LineLayer
        id={`${circleId}-stroke`}
        style={{
          lineColor: strokeColor || 'rgba(0, 150, 255, 0.5)',
          lineWidth: strokeWidth || 2,
        }}
      />
    </MapLibreGL.ShapeSource>
  );
};

const styles = StyleSheet.create({
  webFallback: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  webFallbackText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  webFallbackSub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 5,
  },
  markerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  }
});
