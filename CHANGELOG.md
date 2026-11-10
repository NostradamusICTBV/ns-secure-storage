## 1.0.0

Fork of `@nativescript/secure-storage` 4.0.2 for the Nostradamus apps.

### 🔒 Security

- **android:** replace the Hawk/Conceal backend — which stored the AES key in plaintext in `crypto.KEY_256.xml` next to the data — with `EncryptedSharedPreferences` and an Android Keystore-backed key (`secure_prefs.xml`, alias `nostradamus_secure_prefs_key`).

### 🩹 Changes

- **android:** delete the legacy `Hawk2.xml` / `crypto.KEY_256.xml` on first run; existing secrets are not migrated, so the user re-authenticates.
- **android:** rebuild the store if the Keystore keyset is invalidated instead of crashing.
- Package renamed to `@nostradamus/ns-secure-storage`; standalone `tsc` build replacing the nx monorepo setup. iOS backend unchanged.

---

Upstream history:

## 4.0.2 (2026-08-04)

### 🩹 Fixes

- **secure-storage:** make the ios simulator NSUserDefaults fallback opt-in ([#670](https://github.com/NativeScript/plugins/pull/670))

### ❤️ Thank You

- Eduardo Speroni @edusperoni

## 4.0.1 (2025-09-17)

### 🩹 Fixes

- **secure-storage:** use conceal v1 ([#650](https://github.com/NativeScript/plugins/pull/650))

### ❤️ Thank You

- Osei Fortune @triniwiz

# 4.0.0 (2025-09-16)

### 🚀 Features

- **secure-store:** enable 16kb page size support ([#648](https://github.com/NativeScript/plugins/pull/648))
- **secure-storage:** Add Support for Access/Application groups on IOS. ([85978a1](https://github.com/NativeScript/plugins/commit/85978a1))
- Migrate secure-storage plugin ([#513](https://github.com/NativeScript/plugins/pull/513))

### 🩹 Fixes

- **secure-storage:** Add Support for Access/Application groups on IOS in the simulator. ([#528](https://github.com/NativeScript/plugins/pull/528))

### ❤️ Thank You

- George Grigalashvili @grigala
- Jason Cassidy @jcassidyav
- Osei Fortune @triniwiz
