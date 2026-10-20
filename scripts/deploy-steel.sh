#!/usr/bin/env bash
# Wdrożenie Steel Solution na 37.27.6.71 (steel.37.27.6.71.sslip.io).
# Uruchom z katalogu projektu: bash scripts/deploy-steel.sh
# Jednorazowo (aktualizacja z 20.10.2026): bash scripts/deploy-steel.sh --upgrade-2026-10-20
# Powrót do poprzedniego buildu (bez wysyłania kodu i bez bazy): bash scripts/deploy-steel.sh --rollback
#
# Build idzie do .next-build obok działającej wersji; dopiero po udanym buildzie .next -> .next-prev, .next-build -> .next.
# Nieudany build nie rusza .next ani usługi.
set -euo pipefail

SERVER=root@37.27.6.71
APP=/opt/steel-solution
SITE=https://steel.37.27.6.71.sslip.io
MODE=${1:-}
UPGRADE=""

case "$MODE" in
  "" | --rollback) ;;
  --upgrade-2026-10-20) UPGRADE=$MODE ;;
  *) echo "Nieznana opcja: $MODE (dostępne: --upgrade-2026-10-20, --rollback)" >&2; exit 1 ;;
esac

cd "$(dirname "$0")/.."

restart_and_check() {
  echo "==> Restart"
  ssh "$SERVER" "systemctl restart steel-solution && sleep 6 && systemctl is-active steel-solution"

  echo "==> Sprawdzenie"
  local failed=0 code
  for p in / /oferta /realizacje /kontakt /o-nas /admin/login; do
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 60 "$SITE$p" || true)
    printf '%s %s\n' "$p" "$code"
    [ "$code" = "200" ] || failed=1
  done
  if [ "$failed" != "0" ]; then
    echo "Uwaga: nie wszystkie strony odpowiadają 200. Powrót do poprzedniego buildu: bash scripts/deploy-steel.sh --rollback" >&2
    exit 1
  fi
}

if [ "$MODE" = "--rollback" ]; then
  echo "==> Powrót do poprzedniego buildu (.next <-> .next-prev)"
  # Zamiana w obie strony: ponowne --rollback wraca do nowszego buildu
  ssh "$SERVER" "cd $APP && set -e && test -d .next-prev || { echo 'Brak .next-prev – nie ma do czego wrócić' >&2; exit 1; }
    rm -rf .next-swap
    if [ -d .next ]; then mv .next .next-swap; fi
    mv .next-prev .next
    if [ -d .next-swap ]; then mv .next-swap .next-prev; fi"
  restart_and_check
  echo "Gotowe (poprzedni build): $SITE"
  exit 0
fi

echo "==> Kopia bazy na serwerze"
ssh "$SERVER" "cd $APP && URL=\$(grep ^DATABASE_URL .env | cut -d'\"' -f2 | sed 's/?schema=public//') && mkdir -p /root/backups && pg_dump \"\$URL\" > /root/backups/steel-\$(date +%Y%m%d-%H%M).sql && chmod 600 /root/backups/steel-*.sql"

# Skrót package-lock.json na serwerze (pusty, gdy pliku albo node_modules jeszcze nie ma)
lock_hash() {
  ssh "$SERVER" "cd $APP && if [ -f package-lock.json ] && [ -d node_modules ]; then sha256sum package-lock.json | cut -d' ' -f1; fi"
}
LOCK_BEFORE=$(lock_hash)

echo "==> Wysyłanie kodu"
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .next-build --exclude .next-prev --exclude .next-swap \
  --exclude .env --exclude .env.local --exclude .git \
  --exclude 'public/uploads/*' --exclude tsconfig.tsbuildinfo \
  ./ "$SERVER:$APP/"
ssh "$SERVER" "chown -R miko:miko $APP"

LOCK_AFTER=$(lock_hash)
if [ -n "$LOCK_BEFORE" ] && [ "$LOCK_BEFORE" = "$LOCK_AFTER" ]; then
  echo "==> Zależności bez zmian (package-lock.json ten sam) – pomijam npm ci"
else
  echo "==> Instalacja zależności"
  ssh "$SERVER" "sudo -u miko bash -lc 'cd $APP && npm ci --no-audit --no-fund'"
fi

# Czy jednorazowa aktualizacja z 20.10.2026 jest już na serwerze (kolumna ContactMessage.requestId)?
DONE_20261020=$(ssh "$SERVER" "cd $APP && URL=\$(grep ^DATABASE_URL .env | cut -d'\"' -f2 | sed 's/?schema=public//') && psql \"\$URL\" -Atc \"select count(*) from information_schema.columns where table_name='ContactMessage' and column_name='requestId'\"")
if [ "$UPGRADE" = "--upgrade-2026-10-20" ] && [ "$DONE_20261020" != "0" ]; then
  echo "==> Aktualizacja z 20.10.2026 jest już na serwerze – pomijam (układ stron też nie jest nadpisywany)"
  UPGRADE=""
fi

if [ "$UPGRADE" = "--upgrade-2026-10-20" ]; then
  echo "==> Jednorazowa aktualizacja schematu bazy (tylko dodaje kolumny i tabele)"
  ssh "$SERVER" "sudo -u miko bash -lc 'cd $APP && set -a && . ./.env && set +a && npx prisma db execute --schema prisma/schema.prisma --file scripts/2026-10-20-upgrade.sql'"

  echo "==> Nowy układ strony głównej i O nas z lokalnej bazy (+ historia wersji)"
  docker exec zabudowy-db pg_dump -U postgres -d zabudowy --data-only --no-owner --column-inserts -t '"Page"' -t '"PageRevision"' \
    | ssh "$SERVER" "cd $APP && URL=\$(grep ^DATABASE_URL .env | cut -d'\"' -f2 | sed 's/?schema=public//') && { echo 'BEGIN; DELETE FROM \"PageRevision\"; DELETE FROM \"Page\";'; grep -v '^SET\|^SELECT pg_catalog' ; echo 'COMMIT;'; } | psql \"\$URL\" -v ON_ERROR_STOP=1 -q"
fi

echo "==> Aktualizacja schematu: układ stron kategorii i marek (bezpieczna przy powtórzeniu)"
ssh "$SERVER" "sudo -u miko bash -lc 'cd $APP && set -a && . ./.env && set +a && npx prisma db execute --schema prisma/schema.prisma --file scripts/2026-10-21-entity-blocks.sql'"

echo "==> Build do .next-build (działająca wersja zostaje w .next)"
# Resztki nieudanego buildu są usuwane; cache webpacka z działającej wersji przyspiesza build
ssh "$SERVER" "sudo -u miko bash -lc 'cd $APP && rm -rf .next-build && if [ -d .next/cache/webpack ]; then mkdir -p .next-build/cache && cp -a .next/cache/webpack .next-build/cache/; fi && set -a && . ./.env && set +a && NEXT_DIST_DIR=.next-build npm run build'"

echo "==> Podmiana buildu (.next -> .next-prev, .next-build -> .next)"
ssh "$SERVER" "cd $APP && test -f .next-build/BUILD_ID && rm -rf .next-prev && if [ -d .next ]; then mv .next .next-prev; fi && mv .next-build .next"

restart_and_check
echo "Gotowe: $SITE"
