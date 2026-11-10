# @nostradamus/ns-secure-storage

Secure storage for the Nostradamus NativeScript apps. A fork of [@nativescript/secure-storage](https://github.com/NativeScript/plugins/tree/main/packages/secure-storage) that keeps the iOS [SAMKeychain](https://github.com/soffes/SAMKeychain) backend and replaces the Android backend: instead of [Hawk](https://github.com/orhanobut/hawk)/[Conceal](https://github.com/facebook/conceal) — which stores the AES key in plaintext next to the data — it uses `EncryptedSharedPreferences` with a key held in the Android Keystore.

```javascript
npm install @nostradamus/ns-secure-storage
```

## Android

The Android backend is `androidx.security:security-crypto` `EncryptedSharedPreferences`. The encryption key lives in the Android Keystore under the alias `nostradamus_secure_prefs_key` and is never written to disk; values are stored in `secure_prefs.xml`.

- **Minimum SDK: 24** (the legacy cleanup and the keyset recovery use `Context.deleteSharedPreferences`).
- The store is opened once per process and shared by every `SecureStorage` instance, so creating instances is cheap.
- **Migration:** on first construction the legacy Hawk files (`Hawk2.xml`, `crypto.KEY_256.xml`) are deleted. Existing secrets are not re-encrypted, so the app starts without them and the user logs in again. See [MIGRATION.md](./MIGRATION.md) for the steps when coming from `@nativescript/secure-storage`.
- If the Keystore keyset is ever invalidated (device-credential change, restore to another device), the store is dropped and rebuilt empty rather than crashing.

## API

### `set` | `setSync`

```ts
// require the plugin
import { SecureStorage } from "@nostradamus/ns-secure-storage";

// instantiate the plugin
const secureStorage = new SecureStorage();

// async
secureStorage.set({
  key: "foo",
  value: "I was set at " + new Date()
}).then(success => console.log("Successfully set a value? " + success));

// sync
const success = secureStorage.setSync({
  key: "foo",
  value: "I was set at " + new Date()
});
```

### `get` | `getSync`
Will return `null` if not found.

```ts
// async
secureStorage.get({
  key: "foo"
}).then(value => console.log("Got value: " + value));

// sync
const value = secureStorage.getSync({
  key: "foo"
});
```

### `remove` | `removeSync`

```ts
// async
secureStorage.remove({
  key: "foo"
}).then(success => console.log("Successfully removed a value? " + success));

// sync
const success = secureStorage.removeSync({
  key: "foo"
});
```

### `removeAll` | `removeAllSync`

```ts
// async
secureStorage.removeAll().then(success => console.log("Successfully removed a value? " + success));

// sync
const success = secureStorage.removeAllSync();
```

### `clearAllOnFirstRun` | `clearAllOnFirstRunSync`
These functions can be used if you want to clear data when your app is reinstalled.

This is only really useful **on iOS** because if you write something (through this plugin) to the Keychain, this data **won't** be removed when the app is uninstalled.
So the next time the same app is installed, it will find the data in the keychain.

So if you want to clear 'lingering' data from a previous install, make sure you run one of these
methods before using other methods this plugin provides.

```ts
// async
secureStorage.clearAllOnFirstRun().then(success => {
    console.log(success ? "Successfully removed all data on the first run" : "Data not removed because this is not the first run");
});

// sync
const success = secureStorage.clearAllOnFirstRunSync();
```

### `isFirstRun` | `isFirstRunSync`
As a bonus, you can piggyback the 'first run' mechanism to do anything you want when the plugin detects
this is the first run (after an install or install-delete-reinstall).

```ts
// sync
if (secureStorage.isFirstRunSync()) {
  // do whatever you want
}

// async
secureStorage.isFirstRun().then(isFirst => {
  // if isFirst is true, do whatever you like
});
```

## iOS Security++
By default the plugin uses `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` access control to the keychain. This means that the keychain value can be accessed while the device is locked, once it has been unlocked after a restart. If you want to enhance security and you do not need background access, or if you want to allow the value to be backed up and migrated to another device, you can use any of keys defined [here](https://developer.apple.com/documentation/security/ksecattraccessiblealwaysthisdeviceonly?language=objc#see-also) and pass it when you create an instance of `SecureStorage`, for example
```ts
declare const kSecAttrAccessibleWhenUnlockedThisDeviceOnly; // This is needed in case you don't have tns-platform-declarations module installed. 
const secureStorage = new SecureStorage(kSecAttrAccessibleWhenUnlockedThisDeviceOnly);
```

## iOS Simulator

The plugin uses the keychain on **iOS Simulators** just like it does on device, so no configuration is needed.

An opt-in fallback to `NSUserDefaults` on the simulator is still available for toolchains old enough that `SecItemAdd` fails there with `-34018` (`errSecMissingEntitlement`), see [issue_10](https://github.com/EddyVerbruggen/nativescript-secure-storage/issues/10). Enable it by passing `disableFallbackToUserDefaults: false` as the second constructor argument:

```ts
const secureStorage = new SecureStorage(kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly, false);
```

Note that the fallback stores values **unencrypted**, under the raw key, in the same `NSUserDefaults` domain that `ApplicationSettings` writes to, so those keys can collide with plain application settings. Only turn it on if the simulator keychain is genuinely unavailable to you.

## iOS Keychain Access/App Groups

You can share secrets between iOS apps/extensions via Keychain access groups, or App Groups, see [here](https://developer.apple.com/documentation/security/keychain_services/keychain_items/sharing_access_to_keychain_items_among_a_collection_of_apps#) for details.

To setup:

* Add a keychain access group entitlement to your app
  by adding an entry in the ```app/App_Resources/iOS/<someName>.entitlements``` file.

  e.g.
  ```xml
  <key>keychain-access-groups</key>
  <array>
    <string>$(AppIdentifierPrefix)com.my.app.sharedgroup</string>
  </array>
  ```
* Then in your app specify the ```accessGroup``` property when getting/setting values.
  e.g. 

  ```typescript
  import { SecureStorage } from "@nostradamus/ns-secure-storage";
  export class MyComponent {
    secureStorage = new SecureStorage();
    // a method that can be called from your view
    setSecureValue() {
      this.secureStorage.set({
        accessGroup:"<TeamID>.com.my.app.sharedgroup",
        key: 'myKey',
        value: 'my value'
      }).then(success => { console.log(success)});
    }
  }
  ```

## Development

```bash
bun install
bun run build
```

- Sources live in `src/`; `bun run build` compiles them to `dist/`.
- `src/index.android.ts` and `src/index.ios.ts` are the platform implementations. `main` in `package.json` is extensionless on purpose: the NativeScript bundler appends `.android.js` or `.ios.js`.
- Types shared between files live in `src/@types/`.
- Only the Android backend differs from upstream, so `dist/common.js` and `dist/index.ios.js` should stay identical to the files published in `@nativescript/secure-storage` 4.0.2.

## Credits
* On __iOS__ we're leveraging the KeyChain using the [SAMKeychain](https://github.com/soffes/SAMKeychain) library,
* On __Android__ we're using [`androidx.security:security-crypto`](https://developer.android.com/reference/androidx/security/crypto/EncryptedSharedPreferences) (`EncryptedSharedPreferences` with an Android Keystore-backed key).
* Based on [@nativescript/secure-storage](https://github.com/NativeScript/plugins/tree/main/packages/secure-storage) by [Eddy Verbruggen](https://github.com/EddyVerbruggen) and the NativeScript team — thank you for the original work.

## License

Apache License Version 2.0 (see [LICENSE](./LICENSE)). This fork modifies the original work; the changes are listed in [CHANGELOG.md](./CHANGELOG.md).
