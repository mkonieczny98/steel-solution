# Zabudowy Strażackie - Strona internetowa

Profesjonalna strona internetowa dla firmy produkującej zabudowy wozów strażackich.

## 🚀 Technologie

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Baza danych:** PostgreSQL + Prisma ORM
- **Autoryzacja:** NextAuth.js
- **Język:** TypeScript

## 📦 Instalacja

### 1. Zainstaluj zależności

```bash
npm install
```

### 2. Skonfiguruj bazę danych

Skopiuj plik `.env.example` do `.env` i uzupełnij dane:

```bash
cp .env.example .env
```

Uruchom PostgreSQL (np. przez Docker):

```bash
docker run --name zabudowy-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=zabudowy -p 5432:5432 -d postgres:15
```

### 3. Zainicjuj bazę danych

```bash
npm run db:push
npm run db:seed
```

### 4. Uruchom serwer deweloperski

```bash
npm run dev
```

Strona dostępna pod: http://localhost:3000

Panel admina: http://localhost:3000/admin

## 🔐 Dane logowania (testowe)

- **Email:** admin@zabudowy.pl
- **Hasło:** admin123

## 📁 Struktura projektu

```
src/
├── app/
│   ├── admin/          # Panel administracyjny
│   │   ├── realizacje/ # Zarządzanie realizacjami
│   │   ├── kategorie/  # Zarządzanie kategoriami
│   │   └── ...
│   ├── api/            # API Routes
│   ├── realizacje/     # Strona publiczna - realizacje
│   ├── kontakt/        # Formularz kontaktowy
│   └── page.tsx        # Strona główna
├── components/
│   ├── admin/          # Komponenty panelu admina
│   ├── public/         # Komponenty strony publicznej
│   └── ui/             # Komponenty UI (shadcn)
├── lib/
│   ├── prisma.ts       # Klient Prisma
│   ├── auth.ts         # Konfiguracja NextAuth
│   └── utils.ts        # Funkcje pomocnicze
└── types/              # Typy TypeScript
```

## 🛠️ Komendy

```bash
# Uruchom serwer deweloperski
npm run dev

# Zbuduj produkcję
npm run build

# Uruchom produkcję
npm start

# Prisma
npm run db:generate   # Generuj klienta
npm run db:push       # Wypchnij schemat do bazy
npm run db:migrate    # Migracje
npm run db:studio     # Otwórz Prisma Studio
npm run db:seed       # Seed bazy danych
```

## 📝 TODO

- [ ] Upload zdjęć (integracja z S3/Cloudinary)
- [ ] Edytor WYSIWYG dla treści
- [ ] Powiadomienia email
- [ ] SEO sitemap
- [ ] Optymalizacja obrazów
- [ ] Wersja wielojęzyczna

## 📄 Licencja

Prywatna - wszelkie prawa zastrzeżone.
