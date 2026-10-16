import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalculatedSpreadItem } from '../engine/HybridRateCalculationEngine';

interface BidAskTableProps {
  spreads: CalculatedSpreadItem[];
}

export const BidAskTable: React.FC<BidAskTableProps> = ({ spreads }) => {
  return (
    <View style={styles.cardWrapper}>
      {/* Table Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.sourceCol]}>Source</Text>
        <Text style={[styles.headerCell, styles.centerCol]}>Bid</Text>
        <Text style={[styles.headerCell, styles.centerCol]}>Ask</Text>
      </View>

      {/* Table Rows */}
      {spreads.map((row) => (
        <View key={row.id} style={styles.dataRow}>
          {/* Source Column */}
          <Text style={[styles.sourceText, styles.sourceCol]}>{row.source}</Text>

          {/* Bid Column */}
          <View style={styles.centerCol}>
            {row.isCurrency ? (
              <Text style={styles.plainCurrencyText}>{row.formattedBid}</Text>
            ) : (
              <View
                style={[
                  styles.badgePill,
                  row.bidStatus === 'soft-green' ? styles.badgeGreen : styles.badgeRed
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    row.bidStatus === 'soft-green' ? styles.textGreen : styles.textRed
                  ]}
                >
                  {row.formattedBid}
                </Text>
              </View>
            )}
          </View>

          {/* Ask Column */}
          <View style={styles.centerCol}>
            {row.isCurrency ? (
              <Text style={styles.plainCurrencyText}>{row.formattedAsk}</Text>
            ) : (
              <View
                style={[
                  styles.badgePill,
                  row.askStatus === 'soft-green' ? styles.badgeGreen : styles.badgeRed
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    row.askStatus === 'soft-green' ? styles.textGreen : styles.textRed
                  ]}
                >
                  {row.formattedAsk}
                </Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#EFECE6',
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 4
  },
  headerCell: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8C867F'
  },
  sourceCol: {
    width: '34%'
  },
  centerCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  sourceText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#27231F'
  },
  badgePill: {
    width: 96,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeGreen: {
    backgroundColor: '#EAF6ED'
  },
  badgeRed: {
    backgroundColor: '#FCEAE9'
  },
  badgeText: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.2
  },
  textGreen: {
    color: '#1E7E34'
  },
  textRed: {
    color: '#C93333'
  },
  plainCurrencyText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1F1B17'
  }
});
