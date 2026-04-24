# 6-maktab sayt — bo'limlarga ajratilgan loyiha

Tuzilma:

```text
/project
├── index.html
├── style.css
├── firebase.js
├── app.js
├── firestore-collections-example.json
└── sections/
    ├── home.html
    ├── school.html
    ├── staff.html
    ├── news.html
    ├── announcements.html
    ├── gallery.html
    ├── schedule.html
    └── ...
```

## Ishlatish
1. Papkani VS Code bilan oching.
2. `firebase.js` ichidagi `firebaseConfig` ni o'z Firebase loyihangiz config'i bilan almashtiring.
3. VS Code `Live Server` orqali `index.html` ni oching.
4. Firestore collectionlar: `news`, `announcements`, `messages`, `staff`, `circles`, `gallery`, `documents`, `site/settings`.

`sections/*.html` fayllar `fetch()` orqali yuklanadi, shuning uchun oddiy ikki marta bosib ochmang — Live Server kerak.
