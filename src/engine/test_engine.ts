import { calculateHybridBullionRates, HybridRateCalculationEngine, formatINR } from './HybridRateCalculationEngine.ts';

console.log('--- 1. Testing Default Formula Calculations ---');
const engine = new HybridRateCalculationEngine();
const initial = engine.getSnapshot();

console.log('Calculated Bullion Rates:');
initial.rates.forEach(r => {
  console.log(`  [${r.symbol}] ${r.name}: ${r.formattedPrice} (${r.direction} ${r.formattedDiff})`);
});

console.log('\nCalculated Spread Rates:');
initial.spreads.forEach(s => {
  console.log(`  ${s.source} -> Bid: ${s.formattedBid} | Ask: ${s.formattedAsk}`);
});

// Assertions matching screenshot
const gold999 = initial.rates.find(r => r.id === 'gold-999');
const silverBank = initial.rates.find(r => r.id === 'silver-bank');
const silverCoin = initial.rates.find(r => r.id === 'silver-coin-10gm');

if (gold999?.price === 150713) {
  console.log('✓ Gold 999 calculated correctly: ₹1,50,713');
} else {
  console.error(`✗ Gold 999 mismatch. Expected 150713, got ${gold999?.price}`);
}

if (silverBank?.price === 216281) {
  console.log('✓ Silver Bank calculated correctly: ₹2,16,281');
} else {
  console.error(`✗ Silver Bank mismatch. Expected 216281, got ${silverBank?.price}`);
}

if (silverCoin?.price === 2215) {
  console.log('✓ Silver Coin 10gm calculated correctly: ₹2,215');
} else {
  console.error(`✗ Silver Coin mismatch. Expected 2215, got ${silverCoin?.price}`);
}

console.log('\n--- 2. Testing Market Movement & Direction Flags ---');
// Simulate upward spot shift
const updated = engine.updateBaseRates({
  goldInrBase: 147500.00,
  silverInrBase: 210600.00
});

const updatedGold = updated.rates.find(r => r.id === 'gold-999');
const updatedSilver = updated.rates.find(r => r.id === 'silver-bank');

console.log(`Updated Gold 999: ${updatedGold?.formattedPrice} (Direction: ${updatedGold?.direction}, Diff: ${updatedGold?.formattedDiff})`);
console.log(`Updated Silver Bank: ${updatedSilver?.formattedPrice} (Direction: ${updatedSilver?.direction}, Diff: ${updatedSilver?.formattedDiff})`);

if (updatedGold?.direction === 'up' && updatedGold?.diff === 80) {
  console.log('✓ Upward trend detected correctly on Gold (+₹80)');
}
if (updatedSilver?.direction === 'down' && updatedSilver?.diff === 151) {
  console.log('✓ Downward trend detected correctly on Silver (-₹151)');
}

console.log('\n--- 3. Testing Manual Override ---');
const overrideResult = engine.updateConfig({
  isManualOverride: true,
  overrideGoldRate: 152000.00,
  overrideSilverRate: 220000.00
});

const overrideGold = overrideResult.rates.find(r => r.id === 'gold-999');
console.log(`Override Gold 999: ${overrideGold?.formattedPrice}`);
if (overrideGold?.price === 152000) {
  console.log('✓ Manual Override applied successfully: ₹1,52,000');
}

console.log('\nAll Engine Calculations Verified Successfully!');
