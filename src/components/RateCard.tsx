import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalculatedRateItem } from '../engine/HybridRateCalculationEngine';

interface RateCardProps {
  rate: CalculatedRateItem;
  isLast?: boolean;
}

export const RateCard: React.FC<RateCardProps> = ({ rate, isLast = false }) => {
  const isUp = rate.direction === 'up';
  const arrowSymbol = isUp ? '↑' : '↓';
  const arrowColor = isUp ? '#1E7E34' : '#D32F2F';

  return (
    <View style={[styles.rowContainer, isLast && styles.noBorder]}>
      {/* Rate Name */}
      <Text style={styles.rateName}>{rate.name}</Text>

      {/* Right Value & Badges Group */}
      <View style={styles.valueGroup}>
        {/* Style A: Accent Price + Plain Delta (Gold 999) */}
        {rate.badgeStyle === 'accent' && (
          <>
            <Text style={[styles.priceText, styles.accentPrice]}>
              ₹{rate.formattedPrice}
            </Text>
            <View style={styles.plainDeltaContainer}>
              <Text style={[styles.arrowText, { color: arrowColor }]}>{arrowSymbol}</Text>
              <Text style={[styles.deltaText, { color: arrowColor }]}>₹{rate.formattedDiff}</Text>
            </View>
          </>
        )}

        {/* Style B: Full Soft Green Pill (Silver Bank & Kasganj Mohar) */}
        {rate.badgeStyle === 'green' && (
          <View style={styles.softGreenPill}>
            <Text style={styles.pillPriceText}>₹{rate.formattedPrice}</Text>
            <Text style={styles.pillArrowText}>{arrowSymbol}</Text>
            <Text style={styles.pillDeltaText}>₹{rate.formattedDiff}</Text>
          </View>
        )}

        {/* Style C: Standard Price + Plain Delta (Silver Coin 10gm) */}
        {rate.badgeStyle === 'plain' && (
          <>
            <Text style={styles.priceText}>
              ₹{rate.formattedPrice}
            </Text>
            <View style={styles.plainDeltaContainer}>
              <Text style={[styles.arrowText, { color: arrowColor }]}>{arrowSymbol}</Text>
              <Text style={[styles.deltaText, { color: arrowColor }]}>₹{rate.formattedDiff}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

interface RatesListCardProps {
  rates: CalculatedRateItem[];
}

export const RatesListCard: React.FC<RatesListCardProps> = ({ rates }) => {
  return (
    <View style={styles.cardWrapper}>
      {rates.map((rate, index) => (
        <RateCard
          key={rate.id}
          rate={rate}
          isLast={index === rates.length - 1}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#EFECE6',
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF7F2'
  },
  noBorder: {
    borderBottomWidth: 0,
    paddingBottom: 4
  },
  rateName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#27231F',
    letterSpacing: -0.1
  },
  valueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  priceText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#1F1B17',
    letterSpacing: -0.2
  },
  accentPrice: {
    color: '#B42318' // Exact warm red accent for Gold 999
  },
  plainDeltaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  arrowText: {
    fontSize: 14,
    fontWeight: '700'
  },
  deltaText: {
    fontSize: 13,
    fontWeight: '700'
  },
  softGreenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAF6ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  pillPriceText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E7E34'
  },
  pillArrowText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E7E34'
  },
  pillDeltaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E7E34'
  }
});
