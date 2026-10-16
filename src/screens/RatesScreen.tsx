import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useLiveRates } from '../hooks/useLiveRates';
import { RatesHeader } from '../components/RatesHeader';
import { RatesListCard } from '../components/RateCard';
import { BidAskTable } from '../components/BidAskTable';
import { StoreNoticeCard } from '../components/StoreNoticeCard';

interface RatesScreenProps {
  onNavigateToSettings?: () => void;
  onOpenAdmin?: () => void;
}

export const RatesScreen: React.FC<RatesScreenProps> = ({
  onNavigateToSettings,
  onOpenAdmin
}) => {
  const {
    rates,
    spreads,
    lastUpdated,
    isConnected,
    isOverrideActive,
    storeNotice,
    refreshRates
  } = useLiveRates();

  const [refreshing, setRefreshing] = React.useState(false);

  const handlePullToRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshRates();
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, [refreshRates]);

  // Format timestamp for bottom indicator
  const formattedTime = React.useMemo(() => {
    try {
      const d = new Date(lastUpdated);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Just now';
    }
  }, [lastUpdated]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />

      {/* Top Header Bar */}
      <RatesHeader
        isLive={isConnected}
        onRefresh={refreshRates}
        onOpenSettings={onNavigateToSettings}
      />

      {/* Scrollable Rates Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handlePullToRefresh}
            tintColor="#C18B27"
            colors={['#C18B27']}
          />
        }
      >
        {/* Manual Override Alert Badge if Active */}
        {isOverrideActive && (
          <View style={styles.overrideBanner}>
            <Text style={styles.overrideText}>⚠️ Manual Rate Override Active</Text>
          </View>
        )}

        {/* 1. Live Bullion Rate Cards List */}
        <RatesListCard rates={rates} />

        {/* 2. Bid / Ask Spread Table */}
        <BidAskTable spreads={spreads} />

        {/* 3. Store Notice / Disclaimer Container */}
        <StoreNoticeCard noticeText={storeNotice} />

        {/* 4. Real-time Status / Refresh Bar */}
        <View style={styles.metaRow}>
          <Text style={styles.metaTimestamp}>
            Rates refreshed: {formattedTime}
          </Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={refreshRates}
            activeOpacity={0.6}
          >
            <Text style={styles.refreshBtnText}>🔄 Tap to sync</Text>
          </TouchableOpacity>
        </View>

        {/* Optional Admin Shortcut for testing */}
        {onOpenAdmin && (
          <TouchableOpacity style={styles.adminShortcut} onPress={onOpenAdmin}>
            <Text style={styles.adminShortcutText}>⚙️ Store Manager / Admin Offsets</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2'
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FAF7F2'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 28
  },
  overrideBanner: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    alignItems: 'center'
  },
  overrideText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8D6E63'
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 2,
    marginBottom: 12
  },
  metaTimestamp: {
    fontSize: 12,
    color: '#8E877E',
    fontWeight: '500'
  },
  refreshBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  refreshBtnText: {
    fontSize: 12,
    color: '#B8860B',
    fontWeight: '700'
  },
  adminShortcut: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 8
  },
  adminShortcutText: {
    fontSize: 12,
    color: '#9C948B',
    fontWeight: '600'
  }
});
