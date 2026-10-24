#!/bin/sh
# PreToolUse guard: blocks any agent file write that would put a secret into a
# tracked file. Reads the tool call JSON on stdin. Exit 2 = block.
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
INPUT="$(cat)"

# Writes to gitignored secret files are allowed.
echo "$INPUT" | grep -qE '\.(secret|local\.sql)"' && exit 0
echo "$INPUT" | grep -qE '\.env(\.local)?"' && exit 0

TOKEN="$(cat "$ROOT/freshcast-app/admin-token.secret" 2>/dev/null)"
if [ -n "$TOKEN" ] && echo "$INPUT" | grep -qF "$TOKEN"; then
  echo "Blocked: this write contains the FreshCast admin token. Keep it in admin-token.secret or security.local.sql (both gitignored)." >&2
  exit 2
fi
if echo "$INPUT" | grep -qE 'sb_secret_[A-Za-z0-9_-]{10,}|"role":"service_role"|SUPABASE_SERVICE_ROLE_KEY=[^ "]+'; then
  echo "Blocked: this write contains a Supabase secret/service-role key. Server secrets never go in the repo." >&2
  exit 2
fi
exit 0
