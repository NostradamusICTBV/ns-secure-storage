# Migrating from `@nativescript/secure-storage`

`@nostradamus/ns-secure-storage` is a drop-in replacement for `@nativescript/secure-storage` 4.x. The public API is identical; only the Android storage backend changed.

|               | `@nativescript/secure-storage`                               | `@nostradamus/ns-secure-storage`                              |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| iOS           | Keychain (SAMKeychain)                                       | Keychain (SAMKeychain), unchanged                             |
| Android       | Hawk + Conceal, AES key in plaintext in `crypto.KEY_256.xml` | `EncryptedSharedPreferences`, AES key in the Android Keystore |
| Android files | `Hawk2.xml`, `crypto.KEY_256.xml`                            | `secure_prefs.xml`                                            |

## What happens to stored data

- **iOS: nothing changes.** Values stay in the Keychain under the same service and keys, so users stay logged in.
- **Android: stored values are migrated once.** The first time a `SecureStorage` instance is created, the string values in the legacy Hawk store are copied into the new store. After that the legacy `Hawk2.xml` and `crypto.KEY_256.xml` are deleted. Users stay logged in.

The legacy files are deleted even when the migration fails, so the plaintext key never stays behind. In that case every value returns `null` until it is written again, and the user logs in once. Make sure a missing token leads to the login screen and not to an error state.

Hawk is still bundled, only to read the legacy store during this migration. It can be removed in a later version, once every user has opened an updated app.

## Steps

1. Replace the dependency. The package is installed from its repository, so add that repository to `approvedGitRepositories` in `.yarnrc.yml` first, as described in the [README](./README.md):

   ```bash
   yarn remove @nativescript/secure-storage
   yarn add "@nostradamus/ns-secure-storage@github:NostradamusICTBV/ns-secure-storage#commit=<commit>"
   ```

2. Update the imports. Nothing else in the calling code changes:

   ```ts
   // Before
   import { SecureStorage } from '@nativescript/secure-storage';

   // After
   import { SecureStorage } from '@nostradamus/ns-secure-storage';
   ```

3. Update test mocks that name the old module, for example `jest.mock('@nativescript/secure-storage', ...)`.

4. Check the Android minimum SDK. The plugin needs **API 24** or higher (`minSdkVersion` in `App_Resources/Android/app.gradle`).

5. Rebuild from a clean state, because the native Gradle dependency `androidx.security:security-crypto` was added:

   ```bash
   ns clean
   ns build android
   ```

6. Search the project for remaining references to the old package name in documentation and configuration.

## Behaviour differences on Android

- **Values are strings.** The typed API already only accepted strings; other values that were written to Hawk directly from native code are not migrated.
- **One store per process.** All `SecureStorage` instances share the same opened store, so creating an instance per call is cheap.
- **Keystore invalidation resets the store.** When the Keystore key can no longer decrypt the data, for example after the data was restored on another device, opening the store fails twice in a row and the store is dropped and rebuilt empty. The app sees `null` values and the user logs in again.
- **Backups.** The encrypted file can be included in an Android backup, but the key never leaves the device. A restore on another device therefore ends in the reset described above. Apps with `android:allowBackup="false"` are not affected.

## Verifying the migration

On a debuggable build, or a rooted device, after updating the app and opening it once:

```bash
adb shell run-as <application id> ls shared_prefs
```

- `Hawk2.xml` and `crypto.KEY_256.xml` are gone.
- `secure_prefs.xml` exists and contains only encrypted keys and values.
- A user who was logged in before the update is still logged in.
- Logging in works, and the session survives an app restart.

## Rolling back

Going back to `@nativescript/secure-storage` is possible, but the old plugin starts with an empty Hawk store, so Android users log in once more. The `secure_prefs.xml` file and the Keystore key stay behind unused until the app is uninstalled.
