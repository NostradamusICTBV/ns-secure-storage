import { GetOptions, SetOptions, RemoveOptions, RemoveAllOptions, SecureStorageCommon } from './common';
import { Utils } from '@nativescript/core';

declare const androidx: any;

const PREFERENCES_FILE = 'secure_prefs';
const MASTER_KEY_ALIAS = 'nostradamus_secure_prefs_key';
const LEGACY_PREFERENCES = ['Hawk2', 'crypto.KEY_256'];

export class SecureStorage extends SecureStorageCommon {
	// Opened once per process: consumers create an instance per read and Keystore operations are too slow to repeat.
	private static preferences: any; // androidx.security.crypto.EncryptedSharedPreferences

	constructor() {
		super();

		if (SecureStorage.preferences === undefined) {
			const context = Utils.android.getApplicationContext();
			SecureStorage.preferences = SecureStorage.openPreferences(context);
			SecureStorage.deleteLegacyStorage(context);
		}
	}

	get(arg: GetOptions): Promise<any> {
		return Promise.resolve(this.getSync(arg));
	}

	getSync(arg: GetOptions): any {
		return SecureStorage.preferences.getString(arg.key, null);
	}

	set(arg: SetOptions): Promise<boolean> {
		return Promise.resolve(this.setSync(arg));
	}

	setSync(arg: SetOptions): boolean {
		return SecureStorage.preferences.edit().putString(arg.key, arg.value).commit();
	}

	remove(arg: RemoveOptions): Promise<boolean> {
		return Promise.resolve(this.removeSync(arg));
	}

	removeSync(arg: RemoveOptions): boolean {
		return SecureStorage.preferences.edit().remove(arg.key).commit();
	}

	removeAll(arg?: RemoveAllOptions): Promise<boolean> {
		return Promise.resolve(this.removeAllSync(arg));
	}

	removeAllSync(arg?: RemoveAllOptions): boolean {
		return SecureStorage.preferences.edit().clear().commit();
	}

	private static openPreferences(context: any): any {
		try {
			return SecureStorage.buildPreferences(context);
		} catch (error) {
			// Recover from an invalidated Keystore keyset (device-credential change or restore to another device): drop the corrupted store and rebuild empty so the app re-logs in instead of crashing on every launch.
			context.deleteSharedPreferences(PREFERENCES_FILE);
			return SecureStorage.buildPreferences(context);
		}
	}

	private static buildPreferences(context: any): any {
		const masterKey = new androidx.security.crypto.MasterKey.Builder(context, MASTER_KEY_ALIAS).setKeyScheme(androidx.security.crypto.MasterKey.KeyScheme.AES256_GCM).build();

		return androidx.security.crypto.EncryptedSharedPreferences.create(context, PREFERENCES_FILE, masterKey, androidx.security.crypto.EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV, androidx.security.crypto.EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM);
	}

	private static deleteLegacyStorage(context: any): void {
		for (const name of LEGACY_PREFERENCES) {
			context.deleteSharedPreferences(name);
		}
	}
}
