## 1.0.0

Fork of `@nativescript/secure-storage` 4.0.2 for the Nostradamus apps.

### 🔒 Security

- **android:** replace the Hawk/Conceal backend — which stored the AES key in plaintext in `crypto.KEY_256.xml` next to the data — with `EncryptedSharedPreferences` and an Android Keystore-backed key (`secure_prefs.xml`, alias `nostradamus_secure_prefs_key`).

### 🩹 Changes

- **android:** delete the legacy `Hawk2.xml` / `crypto.KEY_256.xml` on first run; existing secrets are not migrated, so the user re-authenticates.
- **android:** rebuild the store if the Keystore keyset is invalidated instead of crashing.
- Package renamed to `@nostradamus/ns-secure-storage`; standalone `tsc` build replacing the nx monorepo setup. iOS backend unchanged.
