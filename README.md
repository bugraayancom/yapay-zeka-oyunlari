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
