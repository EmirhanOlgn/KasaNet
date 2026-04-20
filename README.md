<p align="center"><img src=".github/assets/app_icon_rounded.png" width="200px" alt="logo"/></p>

<h1 align="center">KasaNet</h1>
<p align="center"><strong>Küçük işletmeler için günlük gelir/gider takibi yapan mobil uygulama</strong></p>


<p align="center">
  <a href="https://www.apache.org/licenses/">
    <img alt="License" src="https://img.shields.io/github/license/emirhanolgn/KasaNet?color=success&style=for-the-badge">
  </a>

  <a href="https://github.com/emirhanolgn/KasaNet/issues">
    <img alt="GitHub Issues" src="https://img.shields.io/github/issues/emirhanolgn/KasaNet?style=for-the-badge">
  </a>

  <a href="https://github.com/emirhanolgn/KasaNet/stargazers">
    <img alt="GitHub Stars" src="https://img.shields.io/github/stars/emirhanolgn/KasaNet?style=for-the-badge">
  </a>
</p>


## ✨ Özellikler

- Birden fazla işletme (dükkân) yönetimi
- Takvim üzerinden günlük işlem girişi (gelir/gider ayrı ayrı)
- Her işlem için kategori, tutar ve açıklama
- Günlük, aylık ve özel tarih aralığı raporları
- Grafikler (çizgi ve sütun grafik) ile görsel analiz
- İşletme bazlı özelleştirilebilir kategoriler
- Tüm veriler cihazda lokal saklanır — sunucu gerektirmez
- Tam Türkçe arayüz, Nunito yazı tipi

## 🛠️ Teknolojiler

- Expo SDK 54 / React Native 0.81
- TypeScript (strict mode)
- Expo Router v6 (dosya tabanlı routing)
- Zustand (state management)
- expo-file-system v19 (yeni File/Directory API)
- react-native-reanimated (animasyonlar)
- react-native-chart-kit (grafikler)
- date-fns (Türkçe locale)

## 💡 Kurulum

```bash
npm install --legacy-peer-deps
```

## 🚀 Çalıştırma

Aynı Wi-Fi ağındaysanız:

```bash
npx expo start
```

Farklı ağdaysanız

```bash
npx expo start --tunnel
```

## 📁 Proje Yapısı

```
app/            # Expo Router sayfaları
components/     # Paylaşılan UI bileşenleri
services/       # Dosya yönetimi, hesaplama, storage
store/          # Zustand store
types/          # TypeScript tip tanımları
utils/          # Formatlayıcılar, validatörler
assets/         # Fontlar, ikonlar
```

## 📄 Lisans

Bu projenin lisansı [LICENSE](./LICENSE) dosyasında belirtilmiştir.
