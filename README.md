# KasaNet

Küçük işletmeler için günlük gelir/gider takibi yapan Türkçe mobil uygulama. React Native + Expo ile geliştirilmiştir.

## Özellikler

- Birden fazla işletme (dükkân) yönetimi
- Takvim üzerinden günlük işlem girişi (gelir/gider ayrı ayrı)
- Her işlem için kategori, tutar ve açıklama
- Günlük, aylık ve özel tarih aralığı raporları
- Grafikler (çizgi ve sütun grafik) ile görsel analiz
- İşletme bazlı özelleştirilebilir kategoriler
- Tüm veriler cihazda lokal saklanır — sunucu gerektirmez
- Tam Türkçe arayüz, Nunito yazı tipi

## Teknolojiler

- Expo SDK 54 / React Native 0.81
- TypeScript (strict mode)
- Expo Router v6 (dosya tabanlı routing)
- Zustand (state management)
- expo-file-system v19 (yeni File/Directory API)
- react-native-reanimated (animasyonlar)
- react-native-chart-kit (grafikler)
- date-fns (Türkçe locale)

## Kurulum

```bash
npm install --legacy-peer-deps
```

## Çalıştırma

Aynı Wi-Fi ağındaysanız:

```bash
npx expo start
```

Farklı ağdaysanız (telefon ↔ PC):

```bash
npx expo start --tunnel
```

Telefonunuzdan **Expo Go** uygulamasıyla QR kodu okutun.

## Proje Yapısı

```
app/            # Expo Router sayfaları
components/     # Paylaşılan UI bileşenleri
services/       # Dosya yönetimi, hesaplama, storage
store/          # Zustand store
types/          # TypeScript tip tanımları
utils/          # Formatlayıcılar, validatörler
assets/         # Fontlar, ikonlar
```

## Lisans

Bu projenin lisansı [LICENSE](./LICENSE) dosyasında belirtilmiştir.
