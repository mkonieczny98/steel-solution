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

## 🔐 Konto administratora

Lokalnie `npm run db:seed` zakłada konto testowe (dane w `prisma/seed.ts`). Hasło ustawisz lub zmienisz poleceniem:

```bash
npm run admin:password -- twoj@email.pl
```

> Na serwerze ustaw własne hasło tym samym poleceniem i własny `NEXTAUTH_SECRET` (`openssl rand -base64 32`).

## ✉️ Zapytania z formularza

Zapytania trafiają do panelu: **/admin/wiadomosci**. Po uzupełnieniu zmiennych `SMTP_*` i `CONTACT_TO`
w `.env` każde nowe zapytanie jest też wysyłane mailem.

## 🧾 Dane firmy i zdjęcia

- Telefon, e-mail, adres, godziny i linki do social mediów: `src/lib/site.ts`
- Zdjęcia poglądowe (Unsplash, licencja darmowa do użytku komercyjnego): `src/lib/images.ts` –
  podmień je w panelu admina na zdjęcia własnych realizacji

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
- [x] Powiadomienia email
- [x] SEO sitemap
- [ ] Optymalizacja obrazów
- [ ] Wersja wielojęzyczna

## 📄 Licencja

Prywatna - wszelkie prawa zastrzeżone.


## Ulepszenia strony — 20.10.2026

- Kontakt jest dostępny od razu pod krótkim nagłówkiem. Przyciski wyceny prowadzą do `#formularz` i zachowują produkt, pojazd oraz wskazaną realizację.
- Formularz przyjmuje do 3 plików JPG/PNG/WebP/PDF (5 MB każdy, 10 MB łącznie). Załączniki zapisują się w PostgreSQL i można pobrać je tylko po zalogowaniu do panelu. Nie są publikowane w katalogu uploads. Kopia bazy musi obejmować załączniki.
- Wiadomości mają status obsługi, notatkę, termin kontaktu i status powiadomienia e-mail. Nieudane powiadomienie można ponowić w panelu. Wysłanie wiadomości nie zależy od działania SMTP; powiadomienie jest wykonywane po odpowiedzi HTTP. Niedostarczone wiadomości pozostają oznaczone do ponowienia.
- Dzienne liczniki zdarzeń są w zakładce Wiadomości. Sukces formularza liczy serwer dopiero po zapisie. Nie zapisujemy treści formularzy ani identyfikatorów użytkowników w statystykach. Ochrona antyspamowa przechowuje krótkotrwałe skróty IP w bazie. Reverse proxy powinno nadpisywać `X-Forwarded-For`, nie przekazywać dowolnej wartości klienta.
- Edytor stron rozdziela „Zapisz szkic” i „Opublikuj zmiany”; podgląd `/podglad/[id]` wymaga sesji. Historia przechowuje poprzednie publikacje. Przywrócenie trafia do szkicu. Edytor wykrywa równoległe zmiany i nie nadpisuje ich po cichu.
- Zmiana sluga strony tworzy przekierowanie 308. Dla stron własnych przełącznik widoczności określa, czy zastosowane zmiany mają być publiczne.
- Upload zdjęć dekoduje plik, usuwa metadane i zapisuje WebP do 2400 px. `SmartImage` pobiera warianty 320–2400 px przez `/api/media/[filename]`. Katalog `public/uploads`, w tym wygenerowane warianty, wymaga trwałego zapisu na hostingu. Na hostingu bez trwałego dysku należy podłączyć magazyn obiektowy przed publikacją.
- Opisy realizacji obsługują śródtytuły rozpoczynające się od `##`; pola opisu i roku są w edytorze realizacji.

### Aktualizacja istniejącej bazy

Lokalna baza tego projektu została już zaktualizowana. Na innym środowisku najpierw wykonaj kopię bazy. Dla bazy sprzed tej zmiany uruchom **jednorazowo**:

```sh
npx prisma db execute --schema prisma/schema.prisma --file scripts/2026-10-20-upgrade.sql
npx prisma generate
npm run build
```

SQL dodaje kolumny i tabele, nie usuwa istniejących danych. Nie uruchamiaj go ponownie na zaktualizowanej bazie. Dla nowej instalacji `npm run db:push` tworzy kompletny aktualny schemat.

Lokalna zmiana układu głównej zachowała wcześniejszą wersję w historii publikacji i nie nadpisała pól zmienionych względem starego szablonu. Na innych instalacjach własne układy z CMS pozostają nadrzędne względem domyślnych bloków z kodu.

### Weryfikacja

```sh
npm test
# W drugim terminalu uruchom lokalną wersję testową bez wysyłania poczty:
SMTP_HOST= NEXT_PUBLIC_SITE_URL=http://localhost:3010 npm run start -- --port 3010
npm run test:integration
```

Test integracyjny tworzy własne oznaczone dane lokalne, sprawdza formularz, uprawnienia do załączników, brak duplikatów, obsługę zapytań, szkice, wersje, przekierowanie i obrazy; sprząta własne rekordy. Odmawia testu poczty, jeśli serwer ma skonfigurowany SMTP. Testy nie potwierdzają dostarczenia prawdziwego e-maila.

Do uzupełnienia przed publikacją: własne fotografie, potwierdzenie referencji i deklarowanych parametrów, docelowa domena i SMTP, trwały magazyn zdjęć oraz kopie bazy. Fotografie z Unsplash w banerach są oznaczone jako poglądowe.

## Układ stron kategorii i marek — 21.10.2026

- Strony kategorii produktów i marek pojazdów składają się z sekcji: **Kategorie / Marki pojazdów → Układ strony**.
- Sekcje „z danych” (nagłówek, cechy i korzyści, opis, specyfikacja, galeria, pojazdy / produkty, realizacje) pokazują treść z formularza kategorii lub marki. Można je przestawiać i ukrywać, a między nie wstawiać dowolne sekcje z biblioteki (tekst, FAQ, galeria, wideo, opinia, CTA…).
- W tekstach sekcji działają `{nazwa}`, `{nazwa_male}` i `{slug}`. Bez zapisanego układu strona używa układu domyślnego.
- Na istniejącej bazie: `npx prisma db execute --schema prisma/schema.prisma --file scripts/2026-10-21-entity-blocks.sql` (bezpieczne przy powtórzeniu; robi to też `scripts/deploy-steel.sh`).

## Wdrożenie na serwer testowy

- `bash scripts/deploy-steel.sh` robi kopię bazy, wysyła kod, uruchamia `npm ci` tylko wtedy, gdy zmienił się `package-lock.json`, i buduje do `.next-build` obok działającej wersji. Dopiero udany build zastępuje `.next` (poprzedni trafia do `.next-prev`), potem restart i sprawdzenie stron. Nieudany build nie rusza działającej strony.
- Powrót do poprzedniego buildu: `bash scripts/deploy-steel.sh --rollback` – bez wysyłania kodu i bez zmian w bazie zamienia `.next` z `.next-prev`, restartuje usługę i sprawdza strony. Ponowne `--rollback` wraca do nowszego buildu. Cofa się tylko zbudowana aplikacja: kod źródłowy, `node_modules` i schemat bazy zostają z ostatniego wdrożenia.
