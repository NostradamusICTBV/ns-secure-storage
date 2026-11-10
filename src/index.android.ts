import { GetOptions, SetOptions, RemoveOptions, RemoveAllOptions, SecureStorageCommon } from './common';
import { Utils } from '@nativescript/core';

declare const androidx: any;

const PREFERENCES_FILE = 'secure_prefs';
const MASTER_KEY_ALIAS = 'nostradamus_secure_prefs_key';
const LEGACY_PREFERENCES = ['Hawk2', 'crypto.KEY_256'];
const OPEN_ATTEMPTS = 2;

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

	async get(arg: GetOptions): Promise<any> {
		return this.getSync(arg);
	}

	getSync(arg: GetOptions): any {
		return SecureStorage.preferences.getString(arg.key, null);
	}

	async set(arg: SetOptions): Promise<boolean> {
		return this.setSync(arg);
	}

	setSync(arg: SetOptions): boolean {
		return SecureStorage.preferences.edit().putString(arg.key, arg.value).commit();
	}

	async remove(arg: RemoveOptions): Promise<boolean> {
		return this.removeSync(arg);
	}

	removeSync(arg: RemoveOptions): boolean {
		return SecureStorage.preferences.edit().remove(arg.key).commit();
	}

	async removeAll(arg?: RemoveAllOptions): Promise<boolean> {
		return this.removeAllSync(arg);
	}

	removeAllSync(arg?: RemoveAllOptions): boolean {
		return SecureStorage.preferences.edit().clear().commit();
	}

	private static openPreferences(context: any): any {
		for (let attempt = 1; attempt <= OPEN_ATTEMPTS; attempt++) {
			try {
				return SecureStorage.buildPreferences(context);
			} catch (error) {
				// A Keystore or I/O hiccup can fail a single attempt, so the store is only reset once every attempt has failed.
			}
		}

		// Still unreadable: the Keystore key was invalidated or the data was restored on another device. Drop the store and rebuild it empty so the app re-logs in instead of crashing on every launch.
		context.deleteSharedPreferences(PREFERENCES_FILE);

		return SecureStorage.buildPreferences(context);
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
