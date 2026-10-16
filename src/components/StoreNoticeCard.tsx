import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StoreNoticeCardProps {
  noticeText?: string;
}

export const StoreNoticeCard: React.FC<StoreNoticeCardProps> = ({
  noticeText = 'Indicative rates only. Confirm at store. We don’t sell bullion.'
}) => {
  // If notice has standard sentence + bold line
  const hasBullionNote = noticeText.includes('We don’t sell bullion.') || noticeText.includes("We don't sell bullion.");

  return (
    <View style={styles.cardContainer}>
      {/* Circular info insignia icon */}
      <View style={styles.iconCircle}>
        <Text style={styles.iconLetter}>i</Text>
      </View>

      {/* Notice text */}
      <View style={styles.textContainer}>
        {hasBullionNote ? (
          <>
            <Text style={styles.noticeBody}>
              {noticeText.replace(/We don[’']t sell bullion\./, '').trim()}
            </Text>
            <Text style={styles.noticeBold}>We don’t sell bullion.</Text>
          </>
        ) : (
          <Text style={styles.noticeBody}>{noticeText}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#EFECE6',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#A87A2B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  iconLetter: {
    fontFamily: 'serif',
    fontSize: 15,
    fontWeight: '700',
    color: '#A87A2B'
  },
  textContainer: {
    flex: 1
  },
  noticeBody: {
    fontSize: 13.5,
    lineHeight: 19,
    color: '#4A443E',
    fontWeight: '500'
  },
  noticeBold: {
    fontSize: 13.5,
    lineHeight: 19,
    color: '#1A1714',
    fontWeight: '700',
    marginTop: 2
  }
});
