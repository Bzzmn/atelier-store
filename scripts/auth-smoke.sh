#!/usr/bin/env bash
# Auth smoke test against a running app (default http://localhost:3000).
# Usage: scripts/auth-smoke.sh [base-url]
# Optional: ADMIN_EMAIL / ADMIN_PASSWORD (an account made with `pnpm auth:create-admin`)
# to also check that an admin can open /admin.
set -uo pipefail

BASE="${1:-http://localhost:3000}"
JAR="$(mktemp)"
trap 'rm -f "$JAR" "$JAR.admin"' EXIT
EMAIL="smoke+$(date +%s)$RANDOM@example.com"
PASSWORD="smoke-password-123"
FAILED=0

check() { # name expected actual
  if [[ "$2" == "$3" ]]; then printf 'ok    %s\n' "$1"
  else printf 'FAIL  %s (expected %s, got %s)\n' "$1" "$2" "$3"; FAILED=1; fi
}
status() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
location() { curl -s -o /dev/null -w '%{redirect_url}' "$@"; }
api() { # path json [jar]
  curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/auth/$1" \
    -H 'Content-Type: application/json' -H "Origin: $BASE" \
    -b "${3:-$JAR}" -c "${3:-$JAR}" --data "$2"
}

check "auth handler is up" 200 "$(status "$BASE/api/auth/ok")"

# Signed out
check "signed out: /account redirects" 307 "$(status "$BASE/account")"
check "signed out: redirect keeps next" "$BASE/sign-in?next=%2Faccount" "$(location "$BASE/account")"
check "signed out: /admin redirects" 307 "$(status "$BASE/admin")"
check "forged cookie: /account → sign-in" "$BASE/sign-in?next=%2Faccount" \
  "$(location -b 'better-auth.session_token=forged.value' "$BASE/account")"

# Sign up (trying to self-assign admin)
code=$(api sign-up/email "{\"name\":\"\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"role\":\"admin\"}")
if [[ "$code" == 200 ]]; then
  role=$(curl -s -b "$JAR" "$BASE/api/auth/get-session" | grep -o '"role":"[a-z]*"')
  check "sign-up can't set role" '"role":"user"' "$role"
else
  check "sign-up with role field rejected" 400 "$code"
  code=$(api sign-up/email "{\"name\":\"\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
  check "sign-up" 200 "$code"
fi
check "duplicate sign-up rejected" 422 \
  "$(api sign-up/email "{\"name\":\"\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" /dev/null)"

# Signed in as a customer
check "customer: /account" 200 "$(status -b "$JAR" "$BASE/account")"
curl -s -b "$JAR" "$BASE/account" | grep -q "$EMAIL" && check "account shows email" yes yes \
  || check "account shows email" yes no
check "customer: /admin is 404" 404 "$(status -b "$JAR" "$BASE/admin")"
check "signed in: /sign-in redirects" 307 "$(status -b "$JAR" "$BASE/sign-in")"
expires=$(curl -s -b "$JAR" "$BASE/api/auth/get-session" | grep -o '"expiresAt":"[^"]*"' | head -1 | cut -d'"' -f4)
days=$(( ($(date -d "$expires" +%s) - $(date +%s)) / 86400 ))
check "session lasts ~30 days" 29 "$days"

# Sign out
check "sign-out" 200 "$(api sign-out '{}')"
check "signed out again: /account redirects" 307 "$(status -b "$JAR" "$BASE/account")"

# Sign in
check "wrong password rejected" 401 \
  "$(api sign-in/email "{\"email\":\"$EMAIL\",\"password\":\"wrong-password\"}" /dev/null)"
check "sign-in" 200 "$(api sign-in/email "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")"
check "signed in again: /account" 200 "$(status -b "$JAR" "$BASE/account")"

# Admin
if [[ -n "${ADMIN_EMAIL:-}" && -n "${ADMIN_PASSWORD:-}" ]]; then
  check "admin sign-in" 200 \
    "$(api sign-in/email "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" "$JAR.admin")"
  check "admin: /admin" 200 "$(status -b "$JAR.admin" "$BASE/admin")"
else
  echo "skip  admin checks (set ADMIN_EMAIL and ADMIN_PASSWORD)"
fi

echo "test user: $EMAIL"
exit $FAILED
