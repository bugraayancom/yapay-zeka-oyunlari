# 🧠 Yapay Zeka Oyun Atölyesi

Klasik yapay zeka ve algoritma problemlerini interaktif oyunlarla öğreten, statik bir web sitesi. Kariyer Koleji AIB (Yapay Zeka) dersi için hazırlanmış [oyun.aibteacher.com](https://oyun.aibteacher.com/) sitesindeki oyunlardan **farklı**, ama aynı eğitsel ruhta tasarlanmış yeni bir oyun setidir.

## 🎮 Oyunlar

| Oyun | Konu | YZ Kavramı |
|------|------|------------|
| 🧭 **Labirent Kaçışı** | En kısa yolu bul | Arama algoritması (BFS) |
| 🔢 **Sudoku** | 9×9 tabloyu doldur | Kısıt sağlama (CSP) + geri izleme |
| 🎨 **Harita Boyama** | Komşular farklı renk | Graf boyama / Dört Renk Teoremi |
| ❌⭕ **XOX: Yapay Zekaya Karşı** | Yenilmez rakip | Minimax / oyun ağacı |
| 💡 **Işıklar Sön** | Tüm ışıkları kapat | Durum uzayı arama + GF(2) doğrusal cebir |
| 📦 **Sokoban: Kutu İtme** | Kutuları hedefe it | Otomatik planlama |
| 🎯 **Mastermind: Renk Avı** | Gizli diziyi çöz | Çıkarım / tümdengelim |

## 🎮 101 Algoritma Oyunu (ayrı bölüm)

`algoritma/` klasöründe, ilkokul öğrencilerine yönelik **12 kategoride 101 mini oyun** bulunur. Amaç, ileride karşılaşabilecekleri klasik algoritma (Silikon Vadisi mülakat) problemlerine eğlenceli bir zihinsel temel kazandırmaktır. Ana sayfadan "101 Algoritma Oyunu" kartıyla erişilir.

| Kategori | Oyun | Kategori | Oyun |
|---|---|---|---|
| 🎨 Diziler | 9 | ⛰️ Heap | 4 |
| 🔲 Matrisler | 3 | 🌳 Ağaç Oyunları | 12 |
| 📝 Kelimeler | 7 | 🗺️ Harita Oyunları | 12 |
| 🔢 Sıralama | 9 | 💎 Dynamic Programming | 20 |
| 🗂️ Hashing | 5 | 💾 Bit İşlemleri | 3 |
| 🔗 Bağlı Listeler | 8 | 📚 Yığın ve Kuyruk | 9 |

**Mimari:** veri-güdümlü + zengin modüller. `algoritma/games.js` 101 oyunun temel verisini (başlık, açıklama, mülakat bağlantısı) tutar. `algoritma/rich/*.js` her kategoriyi, kendine özgü zengin/etkileşimli oyunlarla (animasyonlu bar/kart/zincir/ağaç-SVG/ızgara, 3 artan zorlukta tur, puan/seri, canlı geri bildirim, "İpucu/Çözüm") `custom` render'a yükseltir. `rich/kit.js` paylaşılan bileşen kitidir. `algoritma/engine.js` hub/kategori/oyun sayfalarını çizer ve oyun motorunu (pick/order/grid/number/choice/tree/custom) çalıştırır. İlerleme `localStorage`'da tutulur. Tasarım: Baloo 2 + Nunito fontları, rafine renk paleti.

```
algoritma/
├── index.html / category.html / game.html
├── algoritma.css   # tasarım sistemi
├── games.js        # 101 oyun temel verisi
├── engine.js       # hub + arketip/custom motoru
└── rich/
    ├── kit.js      # paylaşılan bileşenler (kart, bar, zincir, ağaç, ızgara, tur yöneticisi)
    └── arrays.js … matrix.js  # 12 kategoriye özel zengin oyunlar
```

**Yayın:** https://algoritmalarim.vercel.app (101 oyun: `/algoritma/`)

## 🚀 Teknoloji

Tamamen **statik** (HTML + CSS + saf JavaScript). Build adımı, bağımlılık ve framework yoktur. Her oyun kendi içinde bağımsız tek bir HTML dosyasıdır.

## 💻 Yerel Çalıştırma

```bash
# Basit bir HTTP sunucusu yeterli
python3 -m http.server 8000
# Tarayıcıda aç: http://localhost:8000
```

## 🌐 Yayın

Bu proje [Vercel](https://vercel.com/) üzerinde statik site olarak yayınlanmıştır. `main` dalına yapılan her push otomatik olarak deploy edilir.

## 📁 Yapı

```
.
├── index.html            # Ana sayfa (oyun listesi)
├── assets/css/style.css  # Ortak tasarım
└── games/
    ├── labirent.html
    ├── sudoku.html
    ├── harita.html
    ├── xox.html
    ├── isiklar.html
    ├── sokoban.html
    └── mastermind.html
```

## 📚 Lisans

Eğitim amaçlıdır ve ücretsiz kullanıma açıktır.
