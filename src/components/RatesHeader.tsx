import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface RatesHeaderProps {
  onOpenSettings?: () => void;
  onRefresh?: () => void;
  isLive?: boolean;
}

export const RatesHeader: React.FC<RatesHeaderProps> = ({
  onOpenSettings,
  onRefresh,
  isLive = true
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* Brand Monogram & Name */}
      <View style={styles.brandRow}>
        <View style={styles.monogramBadge}>
          <Text style={styles.monogramText}>RSJ</Text>
        </View>
        <View style={styles.titleColumn}>
          <Text style={styles.brandTitle}>Ramchandra and Sons</Text>
          <Text style={styles.brandSubtitle}>JEWELLERS · KASGANJ</Text>
        </View>
      </View>

      {/* Header Actions: Pulsing Dot & Settings Gear */}
      <View style={styles.actionGroup}>
        <TouchableOpacity
          style={styles.liveStatusBadge}
          onPress={onRefresh}
          activeOpacity={0.7}
          accessibilityLabel="Live status indicator, click to refresh"
        >
          <View style={[styles.pulsingDot, !isLive && styles.dotOffline]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsIconBtn}
          onPress={onOpenSettings}
          activeOpacity={0.7}
          accessibilityLabel="Open settings"
        >
          <Text style={styles.gearIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#FAF7F2'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  monogramBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#C59A27',
    backgroundColor: '#FAF3E6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C59A27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2
  },
  monogramText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B8860B',
    letterSpacing: 0.5
  },
  titleColumn: {
    justifyContent: 'center'
  },
  brandTitle: {
    fontFamily: 'serif',
    fontSize: 17,
    fontWeight: '700',
    color: '#26211C',
    letterSpacing: -0.2
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C18B27',
    letterSpacing: 0.6,
    marginTop: 2
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  liveStatusBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF6ED',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E7E34'
  },
  dotOffline: {
    backgroundColor: '#9E9E9E'
  },
  settingsIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFECE6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  },
  gearIcon: {
    fontSize: 16
  }
});
