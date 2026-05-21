# Fortuna demo video — plan para grabar hoy

Objetivo: tener un video de 60-90 segundos listo para X antes del domingo para la entrega del Fun Basic Hedera Agent challenge.

## Estado verificado hoy

- `pnpm typecheck` pasa.
- `pnpm build` pasa.
- `pnpm demo --scenario A` falla porque falta `.env` con `HEDERA_OPERATOR_ID` y `HEDERA_OPERATOR_KEY`.
- No hay remote de git configurado todavía.
- `docs/SUBMISSION.md` todavía no tiene URLs de repo, transacciones, X post ni feedback.

## Bloqueador real

Para grabar el video de verdad necesitamos una cuenta Hedera testnet fondeada y un `.env` real.

Archivo a crear:

```bash
cp .env.example .env
```

Campos mínimos:

```env
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.xxxxxxx
HEDERA_OPERATOR_KEY=302e020100300506032b657004220420...
AI_BACKEND=api
ANTHROPIC_API_KEY=...
FORTUNA_TIP_TINYBARS=10000000
FORTUNA_TIP_RECEIVER=
```

Luego:

```bash
pnpm setup:testnet
pnpm setup:topic
pnpm demo --scenario A
pnpm chat
```

## Tomas del video

Duración ideal: 75 segundos.

### 0-5s — Title card

Pantalla:

```text
Fortuna
A fun Hedera agent
AI fortune cookies + HCS + HBAR tips
```

Voz:

> Meet Fortuna, a tiny fortune-cookie agent built on Hedera Agent Kit.

### 5-18s — Terminal: iniciar chat

Comando:

```bash
pnpm chat
```

Prompt sugerido:

```text
first PR jitters
```

Voz:

> I give Fortuna a mood or topic.

### 18-32s — Fortuna responde

Mostrar en terminal:

- emoji
- fortune
- vibe
- links `tip`, `hcs`, `prov`

Voz:

> She writes a short AI fortune, checks the policy, and executes on Hedera testnet.

### 32-50s — Hashscan: transferencia HBAR

Abrir el link `tip:`.

Voz:

> This is the HBAR tip. A real testnet transfer, produced through Hedera Agent Kit.

### 50-67s — Hashscan: HCS message

Abrir el link `hcs:` o el topic:

```text
https://hashscan.io/testnet/topic/<HEDERA_FORTUNE_TOPIC_ID>
```

Voz:

> And the fortune itself is pinned to HCS as a public message.

### 67-80s — Segunda fortuna rápida

Volver a terminal y usar:

```text
launch day nerves
```

Voz:

> Every fortune creates two receipts: the message and the tip.

### 80-90s — End card

Pantalla:

```text
Fortuna
github.com/luisfermendoza/fiducia-hedera
Submission for Fun Basic Hedera Agent
```

Voz:

> Code is open. Have fun.

## Caption para X

```text
🥠 Fortuna — a fun Hedera agent built with Hedera Agent Kit.

Ask a topic, get an AI fortune, pin it to HCS, and send a tiny HBAR tip, all on Hedera testnet.

Every fortune creates two receipts: an HCS message and an HBAR transfer.

Submission for the Fun Basic Hedera Agent challenge.

Code: https://github.com/luisfermendoza/fiducia-hedera
```

## Checklist de entrega

1. Crear `.env` real.
2. Correr `pnpm setup:testnet`.
3. Correr `pnpm setup:topic`.
4. Grabar demo con `pnpm chat`.
5. Guardar links de Hashscan en `docs/SUBMISSION.md`.
6. Crear repo público y push.
7. Postear video en X.
8. Guardar X URL en `docs/SUBMISSION.md`.
9. Enviar feedback de AI Studio tools.
10. Hacer hand-in final donde indique el challenge.
