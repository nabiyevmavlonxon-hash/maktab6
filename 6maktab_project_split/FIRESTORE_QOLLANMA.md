# Firestorega ma'lumotlarni o'tkazish

## 1. Firestore Database yoqing
Firebase Console → Firestore Database → Create database → Start in production mode.

## 2. Rules joylang
`firestore-rules.txt` ichidagi kodni Firestore → Rules bo'limiga qo'ying va Publish bosing.

## 3. Boshlang'ich ma'lumotlarni yuklang
`seedFirestore.html` faylini VS Code Live Server orqali oching va "Firestorega yuklash" tugmasini bosing.

## 4. Collectionlar
- `site/settings` — maktab nomi, telefon, manzil
- `news` — yangiliklar
- `announcements` — e'lonlar
- `staff` — o'qituvchilar
- `gallery` — rasmlar
- `circles` — to'garaklar
- `messages` — murojaatlar

## 5. Muhim
Ma'lumot ikki marta tushmasligi uchun `seedFirestore.html` tugmasini qayta-qayta bosmang.
