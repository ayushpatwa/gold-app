import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Linking,
  Modal,
  TextInput,
  Share,
  Dimensions,
  Platform
} from 'react-native';

const { width } = Dimensions.get('window');

// Data Types
interface BullionRate {
  id: string;
  name: string;
  price: number;
  change: number;
  direction: 'up' | 'down';
  badgeType: 'accent' | 'green' | 'plain';
}

interface SpreadItem {
  source: string;
  bid: string;
  ask: string;
  bidStatus?: 'red' | 'green';
  askStatus?: 'red' | 'green';
  isCurrency?: boolean;
}

interface JewelleryProduct {
  id: string;
  sku: string;
  title: string;
  category: string;
  collection: string;
  gender: string;
  goldPurity: string;
  grossWeight: string;
  netGoldWeight: string;
  diamondWeight: string;
  colouredStoneWeight: string;
  description: string;
  availability: string;
  images: string[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'rates' | 'gallery' | 'settings' | 'admin'>('rates');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<JewelleryProduct | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxVisible, setIsLightboxVisible] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);

  // Bullion Rates State
  const [rates, setRates] = useState<BullionRate[]>([
    { id: 'gold-999', name: 'Gold 999', price: 150713, change: 1630, direction: 'up', badgeType: 'accent' },
    { id: 'silver-bank', name: 'Silver Bank', price: 216281, change: 3732, direction: 'up', badgeType: 'green' },
    { id: 'kasganj-mohar', name: 'Kasganj Mohar', price: 214118, change: 3694, direction: 'up', badgeType: 'green' },
    { id: 'silver-coin-10gm', name: 'Silver Coin 10gm', price: 2215, change: 40, direction: 'up', badgeType: 'plain' }
  ]);

  const [spreads, setSpreads] = useState<SpreadItem[]>([
    { source: 'Silver', bid: '2,10,751', ask: '2,10,831', bidStatus: 'red', askStatus: 'green' },
    { source: 'Gold', bid: '1,47,420', ask: '1,47,472', bidStatus: 'green', askStatus: 'red' },
    { source: 'Gold ($)', bid: '4,153.99', ask: '4,154.31', bidStatus: 'red', askStatus: 'red' },
    { source: 'Silver ($)', bid: '57.08', ask: '57.10', bidStatus: 'red', askStatus: 'red' },
    { source: 'INR', bid: '95.05', ask: '95.09', isCurrency: true }
  ]);

  const [disclaimerText, setDisclaimerText] = useState('Indicative rates only. Confirm at store. We don’t sell bullion.');

  // Jewellery Catalog
  const [products, setProducts] = useState<JewelleryProduct[]>([
    {
      id: 'rsj-nk-033',
      sku: 'RSJ-NK-033',
      title: 'Violet Collar Necklace Set with Pink Floral Accent',
      category: 'Necklaces',
      collection: 'Gold',
      gender: 'Female',
      goldPurity: '14K',
      grossWeight: '103.840 g',
      netGoldWeight: '83.620 g',
      diamondWeight: '15.03 ct',
      colouredStoneWeight: '86.07 ct',
      description: 'Violet multi-row collar necklace with clear leaf-like center links, an asymmetric pink focal motif and warm-gold branch accents, with matching drop earrings.',
      availability: 'Contact the showroom to confirm availability.',
      images: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85'
      ]
    },
    {
      id: 'rsj-nk-034',
      sku: 'RSJ-NK-034',
      title: 'Teal Asymmetric Chevron Necklace Set',
      category: 'Necklaces',
      collection: 'Gold',
      gender: 'Female',
      goldPurity: '18K',
      grossWeight: '92.450 g',
      netGoldWeight: '74.200 g',
      diamondWeight: '11.80 ct',
      colouredStoneWeight: '62.15 ct',
      description: 'Bespoke collar crafted in 18K yellow gold with cascading natural teal tourmalines and brilliant cut VVS diamonds.',
      availability: 'Available in Showroom',
      images: [
        'https://images.unsplash.com/photo-1611591475155-426462615557?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85'
      ]
    },
    {
      id: 'rsj-sl-009',
      sku: 'RSJ-SL-009',
      title: 'Heritage Embossed Silver Mayur Bowl',
      category: 'Silver',
      collection: 'Silver',
      gender: 'Unisex',
      goldPurity: '925 Silver',
      grossWeight: '425.600 g',
      netGoldWeight: '0 g',
      diamondWeight: 'None',
      colouredStoneWeight: 'None',
      description: 'Solid 92.5 Sterling Silver ornamental centerpiece handcrafted by master silversmiths with embossed peacock motifs.',
      availability: 'Available in Showroom',
      images: [
        'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=85'
      ]
    }
  ]);

  // Live Rates WebSocket Simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setRates(prev =>
        prev.map(item => {
          if (item.id === 'gold-999' || item.id === 'silver-bank') {
            const delta = (Math.random() > 0.45 ? 1 : -1) * Math.floor(Math.random() * 60 + 10);
            return {
              ...item,
              price: item.price + delta,
              change: Math.abs(delta),
              direction: delta >= 0 ? 'up' : 'down'
            };
          }
          return item;
        })
      );
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const formatINR = (val: number) => Number(val).toLocaleString('en-IN');

  const openWhatsApp = (product?: JewelleryProduct) => {
    const phone = '919837012345';
    let text = 'Namaste Ramchandra and Sons Jewellers! I would like to inquire about your fine jewellery collections.';
    if (product) {
      text = `Hello Ramchandra and Sons Jewellers! I am interested in *${product.title}* (SKU: ${product.sku}). Please share availability and current pricing.`;
    }
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`);
  };

  const callStore = () => Linking.openURL('tel:+915744245980');
  const openMaps = () => Linking.openURL('https://maps.google.com/?q=Main+Market+Near+Ghanta+Ghar+Kasganj');

  const shareProduct = (product: JewelleryProduct) => {
    Share.share({
      title: product.title,
      message: `${product.title} (${product.sku}) - Ramchandra and Sons Jewellers, Main Market, Kasganj.`
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.brandRow}>
          <View style={styles.monogram}>
            <Text style={styles.monogramText}>RSJ</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>Ramchandra and Sons</Text>
            <Text style={styles.brandSub}>JEWELLERS · KASGANJ</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.pulseBadge}>
            <View style={styles.pulseDot} />
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => setActiveTab('settings')}>
            <Text style={{ fontSize: 16 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Body */}
      <ScrollView style={styles.contentScroll} contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
        
        {/* 1. RATES TAB */}
        {activeTab === 'rates' && (
          <View>
            {/* Bullion Rates Card */}
            <View style={styles.card}>
              {rates.map((item, idx) => (
                <View key={item.id} style={[styles.rateRow, idx === rates.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={styles.rateName}>{item.name}</Text>
                  <View style={styles.rateValueGroup}>
                    {item.badgeType === 'accent' && (
                      <>
                        <Text style={[styles.ratePrice, { color: '#B42318' }]}>₹{formatINR(item.price)}</Text>
                        <Text style={styles.rateChangePlain}>
                          {item.direction === 'up' ? '▲' : '▼'} ₹{formatINR(item.change)}
                        </Text>
                      </>
                    )}
                    {item.badgeType === 'green' && (
                      <View style={styles.greenPillBadge}>
                        <Text style={styles.greenPillText}>₹{formatINR(item.price)}</Text>
                        <Text style={styles.greenPillText}>{item.direction === 'up' ? '▲' : '▼'}</Text>
                        <Text style={styles.greenPillText}>₹{formatINR(item.change)}</Text>
                      </View>
                    )}
                    {item.badgeType === 'plain' && (
                      <>
                        <Text style={styles.ratePrice}>₹{formatINR(item.price)}</Text>
                        <Text style={styles.rateChangePlain}>
                          {item.direction === 'up' ? '▲' : '▼'} ₹{formatINR(item.change)}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Spread Table */}
            <View style={styles.card}>
              <View style={styles.spreadHeaderRow}>
                <Text style={[styles.spreadColHeader, { width: '36%' }]}>Source</Text>
                <Text style={[styles.spreadColHeader, { textAlign: 'center', flex: 1 }]}>Bid</Text>
                <Text style={[styles.spreadColHeader, { textAlign: 'center', flex: 1 }]}>Ask</Text>
              </View>
              {spreads.map((row, idx) => (
                <View key={idx} style={styles.spreadRow}>
                  <Text style={[styles.spreadSource, { width: '36%' }]}>{row.source}</Text>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={[styles.spreadPill, row.bidStatus === 'red' ? styles.pillRed : row.bidStatus === 'green' ? styles.pillGreen : null]}>
                      <Text style={[styles.spreadPillText, row.bidStatus === 'red' ? styles.textRed : row.bidStatus === 'green' ? styles.textGreen : null]}>
                        {row.bid}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={[styles.spreadPill, row.askStatus === 'red' ? styles.pillRed : row.askStatus === 'green' ? styles.pillGreen : null]}>
                      <Text style={[styles.spreadPillText, row.askStatus === 'red' ? styles.textRed : row.askStatus === 'green' ? styles.textGreen : null]}>
                        {row.ask}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimerCard}>
              <View style={styles.disclaimerIconCircle}>
                <Text style={styles.disclaimerIconText}>i</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.disclaimerText}>Indicative rates only. Confirm at store.</Text>
                <Text style={[styles.disclaimerText, { fontWeight: '700', color: '#1F1B17' }]}>We don’t sell bullion.</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.adminEntryBtn} onPress={() => setActiveTab('admin')}>
              <Text style={styles.adminEntryText}>Store Admin / Rates CMS ⚙️</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 2. GALLERY TAB */}
        {activeTab === 'gallery' && !selectedProduct && (
          <View>
            {!activeCategory ? (
              <View>
                <Text style={styles.galleryHeading}>Gallery</Text>
                <View style={styles.goldLine} />
                <Text style={styles.gallerySubHeading}>Explore our exquisite collections</Text>

                {/* Category Cards */}
                <TouchableOpacity
                  style={styles.categoryCard}
                  activeOpacity={0.88}
                  onPress={() => setActiveCategory('Gold')}
                >
                  <View style={styles.categoryTextSide}>
                    <Text style={styles.categoryTitleGold}>Gold</Text>
                    <Text style={styles.categorySub}>Browse the Ramchandra and Sons Gold collection</Text>
                    <View style={styles.exploreBtnGold}>
                      <Text style={styles.exploreBtnText}>Explore Gold ›</Text>
                    </View>
                  </View>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=85' }}
                    style={styles.categoryImageCutout}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.categoryCard, { borderColor: '#E2DFD8' }]}
                  activeOpacity={0.88}
                  onPress={() => setActiveCategory('Silver')}
                >
                  <View style={styles.categoryTextSide}>
                    <Text style={[styles.categoryTitleGold, { color: '#2E2A25' }]}>Silver</Text>
                    <Text style={styles.categorySub}>Browse the Ramchandra and Sons Silver collection</Text>
                    <View style={[styles.exploreBtnGold, { backgroundColor: '#807B75' }]}>
                      <Text style={styles.exploreBtnText}>Explore Silver ›</Text>
                    </View>
                  </View>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=85' }}
                    style={styles.categoryImageCutout}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TouchableOpacity style={styles.backBtnRow} onPress={() => setActiveCategory(null)}>
                  <Text style={styles.backBtnText}>‹ Back to Categories</Text>
                </TouchableOpacity>
                <Text style={styles.galleryHeading}>{activeCategory} Collection</Text>

                <View style={styles.productsGrid}>
                  {products.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.productGridCard}
                      activeOpacity={0.85}
                      onPress={() => {
                        setSelectedProduct(p);
                        setActiveImageIndex(0);
                      }}
                    >
                      <Image source={{ uri: p.images[0] }} style={styles.gridImage} />
                      <View style={styles.gridInfo}>
                        <Text style={styles.gridSku}>{p.sku}</Text>
                        <Text style={styles.gridTitle} numberOfLines={2}>{p.title}</Text>
                        <Text style={styles.gridWeight}>{p.grossWeight}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* PRODUCT DETAIL VIEW */}
        {activeTab === 'gallery' && selectedProduct && (
          <View>
            <View style={styles.detailNav}>
              <TouchableOpacity onPress={() => setSelectedProduct(null)} style={{ flex: 1 }}>
                <Text style={styles.detailNavBack} numberOfLines={1}>‹ {selectedProduct.title}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => shareProduct(selectedProduct)}>
                <Text style={{ fontSize: 18 }}>📤</Text>
              </TouchableOpacity>
            </View>

            {/* Media Carousel */}
            <View style={styles.heroMediaWrap}>
              <Image source={{ uri: selectedProduct.images[activeImageIndex] }} style={styles.heroImage} />
              <TouchableOpacity style={styles.tapToZoomPill} onPress={() => setIsLightboxVisible(true)}>
                <Text style={styles.tapToZoomText}>🔍 TAP TO ZOOM</Text>
              </TouchableOpacity>
            </View>

            {/* Thumbnails */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {selectedProduct.images.map((img, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setActiveImageIndex(i)}
                  style={[styles.thumbnailWrap, i === activeImageIndex && styles.thumbnailActive]}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImg} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.itemIndexText}>Item 1 of {products.length}</Text>
            <Text style={styles.itemCategoryBadge}>{selectedProduct.category.toUpperCase()}</Text>
            <Text style={styles.detailTitle}>{selectedProduct.title}</Text>
            <Text style={styles.detailDesc}>{selectedProduct.description}</Text>

            {/* Specifications Grid */}
            <View style={styles.specsGrid}>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>REFERENCE</Text>
                <Text style={styles.specVal}>{selectedProduct.sku}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>CATEGORY</Text>
                <Text style={styles.specVal}>{selectedProduct.category}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>COLLECTION</Text>
                <Text style={styles.specVal}>{selectedProduct.collection}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>GENDER</Text>
                <Text style={styles.specVal}>{selectedProduct.gender}</Text>
              </View>
              <View style={[styles.specBox, { width: '100%' }]}>
                <Text style={styles.specLabel}>DETAILS</Text>
                <Text style={styles.specVal}>{selectedProduct.title}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>GOLD PURITY</Text>
                <Text style={styles.specVal}>{selectedProduct.goldPurity}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>GROSS WEIGHT</Text>
                <Text style={styles.specVal}>{selectedProduct.grossWeight}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>NET GOLD WEIGHT</Text>
                <Text style={styles.specVal}>{selectedProduct.netGoldWeight}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>DIAMOND WEIGHT</Text>
                <Text style={styles.specVal}>{selectedProduct.diamondWeight}</Text>
              </View>
            </View>

            {/* Availability */}
            <View style={styles.availCard}>
              <Text style={styles.availLabel}>AVAILABILITY</Text>
              <Text style={styles.availText}>{selectedProduct.availability}</Text>
            </View>

            <Text style={styles.pricingNote}>Contact the showroom for current pricing and customized specifications.</Text>

            {/* Action Bar */}
            <View style={styles.actionBarRow}>
              <TouchableOpacity style={styles.whatsappBtn} onPress={() => openWhatsApp(selectedProduct)}>
                <Text style={styles.whatsappBtnText}>💬 Ask on WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.callStoreBtn} onPress={callStore}>
                <Text style={{ fontSize: 20 }}>📞</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 3. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <View>
            <View style={styles.settingsHeader}>
              <View style={[styles.monogram, { width: 44, height: 44 }]}>
                <Text style={[styles.monogramText, { fontSize: 16 }]}>RSJ</Text>
              </View>
              <View>
                <Text style={styles.settingsBrandTitle}>Ramchandra and Sons Jewellers</Text>
                <Text style={styles.settingsBrandSub}>Heritage Bullion & Fine Jewellery Since 1952</Text>
              </View>
            </View>

            {/* VIP Sign In Banner */}
            <TouchableOpacity style={styles.signinBanner} activeOpacity={0.8}>
              <View style={styles.avatarCircle}>
                <Text style={{ fontSize: 18 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.signinTitle}>Sign in to Ramchandra & Sons</Text>
                <Text style={styles.signinSub}>View your personalised rates</Text>
              </View>
              <Text style={{ fontSize: 18, color: '#B0A89F' }}>›</Text>
            </TouchableOpacity>

            <Text style={styles.sectionHeader}>Quick Actions</Text>
            <View style={styles.quickGrid}>
              <TouchableOpacity style={styles.quickCard} onPress={callStore}>
                <Text style={{ fontSize: 22, marginBottom: 4 }}>📞</Text>
                <Text style={styles.quickCardTitle}>Call Store</Text>
                <Text style={styles.quickCardSub}>05744-245980</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCard} onPress={() => openWhatsApp()}>
                <Text style={{ fontSize: 22, marginBottom: 4 }}>💬</Text>
                <Text style={styles.quickCardTitle}>WhatsApp</Text>
                <Text style={styles.quickCardSub}>Open chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCard} onPress={openMaps}>
                <Text style={{ fontSize: 22, marginBottom: 4 }}>📍</Text>
                <Text style={styles.quickCardTitle}>Directions</Text>
                <Text style={styles.quickCardSub}>Main Market</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialCard} onPress={() => Linking.openURL('https://instagram.com')}>
                <Text style={{ fontSize: 20, marginBottom: 2 }}>📸</Text>
                <Text style={styles.quickCardTitle}>Instagram</Text>
                <Text style={styles.quickCardSub}>@ramchandra_sons</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialCard} onPress={() => Linking.openURL('https://instagram.com')}>
                <Text style={{ fontSize: 20, marginBottom: 2 }}>📸</Text>
                <Text style={styles.quickCardTitle}>Instagram</Text>
                <Text style={styles.quickCardSub}>@rsj_heritage</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeader}>Notifications</Text>
            <View style={styles.menuCard}>
              <View style={styles.menuRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuTitle}>New stock alerts</Text>
                  <Text style={styles.menuSub}>{pushAlerts ? 'Active · Push notifications enabled' : 'Disabled'}</Text>
                </View>
                <TouchableOpacity onPress={() => setPushAlerts(!pushAlerts)}>
                  <Text style={{ fontSize: 22 }}>{pushAlerts ? '🟢' : '⚪'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionHeader}>Store / Visit</Text>
            <View style={styles.menuCard}>
              <TouchableOpacity style={styles.menuRow} onPress={openMaps}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuTitle}>Address</Text>
                  <Text style={styles.menuSub}>Main Market, Near Ghanta Ghar, Kasganj</Text>
                </View>
                <Text style={{ color: '#888' }}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuRow} onPress={() => Linking.openURL('https://ramchandraandsons.com')}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuTitle}>Website</Text>
                  <Text style={styles.menuSub}>ramchandraandsons.com</Text>
                </View>
                <Text style={{ color: '#888' }}>›</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.taglineBottom}>Crafted with care · Main Market, Kasganj</Text>
          </View>
        )}

        {/* 4. ADMIN TAB */}
        {activeTab === 'admin' && (
          <View>
            <TouchableOpacity style={styles.backBtnRow} onPress={() => setActiveTab('rates')}>
              <Text style={styles.backBtnText}>‹ Return to Rates</Text>
            </TouchableOpacity>
            <Text style={styles.galleryHeading}>Store Admin CMS</Text>
            <Text style={styles.gallerySubHeading}>Adjust live bullion rates and disclaimers.</Text>

            <View style={styles.card}>
              <Text style={styles.specLabel}>Gold 999 (₹ / 10gm)</Text>
              <TextInput
                style={styles.adminInput}
                keyboardType="numeric"
                defaultValue={rates[0].price.toString()}
                onChangeText={t => {
                  const n = parseInt(t, 10);
                  if (n) setRates(r => r.map((item, i) => (i === 0 ? { ...item, price: n } : item)));
                }}
              />
              <Text style={styles.specLabel}>Silver Bank (₹ / 1kg)</Text>
              <TextInput
                style={styles.adminInput}
                keyboardType="numeric"
                defaultValue={rates[1].price.toString()}
                onChangeText={t => {
                  const n = parseInt(t, 10);
                  if (n) setRates(r => r.map((item, i) => (i === 1 ? { ...item, price: n } : item)));
                }}
              />
              <TouchableOpacity
                style={[styles.whatsappBtn, { backgroundColor: '#C18B27', marginTop: 10 }]}
                onPress={() => setActiveTab('rates')}
              >
                <Text style={styles.whatsappBtnText}>Save & Broadcast Rates</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Fixed Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            setActiveTab('rates');
            setSelectedProduct(null);
          }}
        >
          <Text style={[styles.navIcon, activeTab === 'rates' && styles.navActive]}>📈</Text>
          <Text style={[styles.navLabel, activeTab === 'rates' && styles.navActive]}>Rates</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            setActiveTab('gallery');
            setSelectedProduct(null);
          }}
        >
          <Text style={[styles.navIcon, activeTab === 'gallery' && styles.navActive]}>🖼️</Text>
          <Text style={[styles.navLabel, activeTab === 'gallery' && styles.navActive]}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            setActiveTab('settings');
            setSelectedProduct(null);
          }}
        >
          <Text style={[styles.navIcon, activeTab === 'settings' && styles.navActive]}>⚙️</Text>
          <Text style={[styles.navLabel, activeTab === 'settings' && styles.navActive]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Lightbox Zoom Modal */}
      <Modal visible={isLightboxVisible} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.lightboxModal}
          activeOpacity={1}
          onPress={() => setIsLightboxVisible(false)}
        >
          {selectedProduct && (
            <Image
              source={{ uri: selectedProduct.images[activeImageIndex] }}
              style={styles.lightboxImg}
              resizeMode="contain"
            />
          )}
          <Text style={styles.lightboxCloseTip}>Tap anywhere to close lightbox</Text>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2'
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAF7F2'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  monogram: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#C59A27',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF3E6'
  },
  monogramText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B8860B'
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B3530'
  },
  brandSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C18B27',
    letterSpacing: 0.6
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  pulseBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF6ED',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22A048'
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFECE6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 16
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFECE6',
    marginBottom: 14
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF7F2'
  },
  rateName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#27231F'
  },
  rateValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  ratePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1B17'
  },
  rateChangePlain: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E7E34'
  },
  greenPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAF6ED',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  greenPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E7E34'
  },
  spreadHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF7F2'
  },
  spreadColHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8C867F'
  },
  spreadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  spreadSource: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27231F'
  },
  spreadPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6
  },
  pillRed: {
    backgroundColor: '#FCEAE9'
  },
  pillGreen: {
    backgroundColor: '#EAF6ED'
  },
  spreadPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F1B17'
  },
  textRed: {
    color: '#C93333'
  },
  textGreen: {
    color: '#1E7E34'
  },
  disclaimerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFECE6',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14
  },
  disclaimerIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#C18B27',
    alignItems: 'center',
    justifyContent: 'center'
  },
  disclaimerIconText: {
    color: '#C18B27',
    fontWeight: '700',
    fontSize: 14
  },
  disclaimerText: {
    fontSize: 13,
    color: '#4A443E',
    lineHeight: 18
  },
  adminEntryBtn: {
    alignItems: 'center',
    paddingVertical: 8
  },
  adminEntryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B47C1C'
  },
  galleryHeading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1C1917',
    marginTop: 6
  },
  goldLine: {
    width: 48,
    height: 2,
    backgroundColor: '#C18B27',
    marginVertical: 8
  },
  gallerySubHeading: {
    fontSize: 14,
    color: '#5E5750',
    marginBottom: 16
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E6CE9F',
    height: 190,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 16
  },
  categoryTextSide: {
    width: '52%',
    padding: 18,
    justifyContent: 'center'
  },
  categoryTitleGold: {
    fontSize: 26,
    fontWeight: '700',
    color: '#A36F1C',
    marginBottom: 4
  },
  categorySub: {
    fontSize: 12,
    color: '#5C554D',
    marginBottom: 14,
    lineHeight: 16
  },
  exploreBtnGold: {
    backgroundColor: '#C18B27',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignSelf: 'flex-start'
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  },
  categoryImageCutout: {
    width: '48%',
    height: '100%'
  },
  backBtnRow: {
    paddingVertical: 8
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B47C1C'
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10
  },
  productGridCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFECE6'
  },
  gridImage: {
    width: '100%',
    height: 130
  },
  gridInfo: {
    padding: 10
  },
  gridSku: {
    fontSize: 10,
    color: '#9C948B',
    fontWeight: '700'
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#24201D',
    marginVertical: 4
  },
  gridWeight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#55504A'
  },
  detailNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  detailNavBack: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7A5B1D'
  },
  heroMediaWrap: {
    width: '100%',
    height: 340,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative'
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  tapToZoomPill: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(25, 22, 19, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14
  },
  tapToZoomText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700'
  },
  thumbnailWrap: {
    width: 54,
    height: 54,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  thumbnailActive: {
    borderColor: '#C18B27'
  },
  thumbnailImg: {
    width: '100%',
    height: '100%'
  },
  itemIndexText: {
    fontSize: 11,
    color: '#8C847B',
    fontWeight: '600'
  },
  itemCategoryBadge: {
    fontSize: 11,
    color: '#A36F1C',
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 6
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#211D19',
    marginBottom: 8
  },
  detailDesc: {
    fontSize: 13,
    color: '#554F48',
    lineHeight: 18,
    marginBottom: 16
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  specBox: {
    width: (width - 40) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFECE6'
  },
  specLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E877E',
    marginBottom: 2
  },
  specVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#24201C'
  },
  availCard: {
    backgroundColor: '#FBF8F2',
    borderWidth: 1,
    borderColor: '#ECE4D4',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8
  },
  availLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E877E',
    marginBottom: 2
  },
  availText: {
    fontSize: 13,
    color: '#38322B',
    fontWeight: '500'
  },
  pricingNote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#8C847B',
    textAlign: 'center',
    marginVertical: 12
  },
  actionBarRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20
  },
  whatsappBtn: {
    flex: 1,
    backgroundColor: '#1F9D55',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  whatsappBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  callStoreBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFECE6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 10
  },
  settingsBrandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B2520'
  },
  settingsBrandSub: {
    fontSize: 11,
    color: '#8E877E'
  },
  signinBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFECE6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 12
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5E8CF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  signinTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26211C'
  },
  signinSub: {
    fontSize: 12,
    color: '#8C847B'
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#332D27',
    marginVertical: 10
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#EFECE6',
    alignItems: 'center'
  },
  quickCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#27221E'
  },
  quickCardSub: {
    fontSize: 10,
    color: '#8C847B'
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14
  },
  socialCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EFECE6',
    alignItems: 'center'
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFECE6',
    overflow: 'hidden',
    marginBottom: 14
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF7F2'
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#26211C'
  },
  menuSub: {
    fontSize: 11,
    color: '#8C847B',
    marginTop: 2
  },
  taglineBottom: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#A39B90',
    fontSize: 13,
    marginVertical: 16
  },
  adminInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#DFD9CF',
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
    fontSize: 14
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#FAF7F2',
    borderTopWidth: 1,
    borderTopColor: '#ECE7DD',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 12 : 0
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  navIcon: {
    fontSize: 18,
    color: '#948C82'
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#948C82',
    marginTop: 2
  },
  navActive: {
    color: '#B47C1C'
  },
  lightboxModal: {
    flex: 1,
    backgroundColor: 'rgba(10, 8, 6, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  lightboxImg: {
    width: '90%',
    height: '75%'
  },
  lightboxCloseTip: {
    color: '#C5BFB5',
    fontSize: 12,
    marginTop: 16
  }
});
