import { beforeEach, describe, expect, it, mock } from 'bun:test';

class FakeEditor {
	constructor(private readonly values: Map<string, string>) {}

	public putString(key: string, value: string): this {
		this.values.set(key, value);

		return this;
	}

	public remove(key: string): this {
		this.values.delete(key);

		return this;
	}

	public clear(): this {
		this.values.clear();

		return this;
	}

	public commit(): boolean {
		return true;
	}
}

class FakePreferences {
	private readonly values: Map<string, string> = new Map<string, string>();

	public getString(key: string, fallback: string | null): string | null {
		return this.values.get(key) ?? fallback;
	}

	public edit(): FakeEditor {
		return new FakeEditor(this.values);
	}
}

class FakeMasterKeyBuilder {
	constructor(
		private readonly context: unknown,
		private readonly alias: string,
	) {}

	public setKeyScheme(): this {
		return this;
	}

	public build(): string {
		return `master-key:${this.alias}`;
	}
}

const context = { deleteSharedPreferences: mock((): boolean => true) };
const createPreferences = mock((): FakePreferences => new FakePreferences());

(globalThis as Record<string, unknown>).androidx = {
	security: {
		crypto: {
			MasterKey: {
				Builder: FakeMasterKeyBuilder,
				KeyScheme: { AES256_GCM: 'AES256_GCM' },
			},
			EncryptedSharedPreferences: {
				create: createPreferences,
				PrefKeyEncryptionScheme: { AES256_SIV: 'AES256_SIV' },
				PrefValueEncryptionScheme: { AES256_GCM: 'AES256_GCM' },
			},
		},
	},
};

mock.module('@nativescript/core', () => ({
	ApplicationSettings: {
		getBoolean: (): boolean => false,
		setBoolean: (): void => undefined,
	},
	Utils: {
		android: {
			getApplicationContext: (): typeof context => context,
		},
	},
}));

const { SecureStorage } = await import('@/index.android');

describe('@/index.android', () => {
	beforeEach(() => {
		(SecureStorage as unknown as { preferences: unknown }).preferences = undefined;
		context.deleteSharedPreferences.mockClear();
		createPreferences.mockReset();
		createPreferences.mockImplementation((): FakePreferences => new FakePreferences());
	});

	it('should return null for a key that was never set', () => {
		expect(new SecureStorage().getSync({ key: 'ApiToken' })).toBeNull();
	});

	it('should read back a value that was set', () => {
		// Arrange
		const storage = new SecureStorage();

		// Act
		const isStored: boolean = storage.setSync({ key: 'ApiToken', value: 'token-1' });

		// Assert
		expect(isStored).toBe(true);
		expect(storage.getSync({ key: 'ApiToken' })).toBe('token-1');
	});

	it('should share stored values between instances', () => {
		new SecureStorage().setSync({ key: 'ApiToken', value: 'token-1' });

		expect(new SecureStorage().getSync({ key: 'ApiToken' })).toBe('token-1');
	});

	it('should remove a single value', () => {
		// Arrange
		const storage = new SecureStorage();
		storage.setSync({ key: 'ApiToken', value: 'token-1' });
		storage.setSync({ key: 'CurrentUser', value: 'user-1' });

		// Act
		const isRemoved: boolean = storage.removeSync({ key: 'ApiToken' });

		// Assert
		expect(isRemoved).toBe(true);
		expect(storage.getSync({ key: 'ApiToken' })).toBeNull();
		expect(storage.getSync({ key: 'CurrentUser' })).toBe('user-1');
	});

	it('should remove all values', () => {
		// Arrange
		const storage = new SecureStorage();
		storage.setSync({ key: 'ApiToken', value: 'token-1' });
		storage.setSync({ key: 'CurrentUser', value: 'user-1' });

		// Act
		const isCleared: boolean = storage.removeAllSync();

		// Assert
		expect(isCleared).toBe(true);
		expect(storage.getSync({ key: 'ApiToken' })).toBeNull();
		expect(storage.getSync({ key: 'CurrentUser' })).toBeNull();
	});

	it('should resolve the async methods with the stored state', async () => {
		const storage = new SecureStorage();

		expect(await storage.set({ key: 'ApiToken', value: 'token-1' })).toBe(true);
		expect(await storage.get({ key: 'ApiToken' })).toBe('token-1');
		expect(await storage.remove({ key: 'ApiToken' })).toBe(true);
		expect(await storage.get({ key: 'ApiToken' })).toBeNull();
		expect(await storage.removeAll()).toBe(true);
	});

	it('should open the store once for all instances', () => {
		new SecureStorage();
		new SecureStorage();

		expect(createPreferences).toHaveBeenCalledTimes(1);
		expect(createPreferences).toHaveBeenCalledWith(context, 'secure_prefs', 'master-key:nostradamus_secure_prefs_key', 'AES256_SIV', 'AES256_GCM');
	});

	it('should delete the legacy Hawk preferences when the store is opened', () => {
		new SecureStorage();
		new SecureStorage();

		expect(context.deleteSharedPreferences.mock.calls).toEqual([['Hawk2'], ['crypto.KEY_256']]);
	});

	it('should rebuild an empty store when the keyset cannot be read', () => {
		// Arrange
		createPreferences.mockImplementationOnce((): FakePreferences => {
			throw new Error('KEYSET_UNREADABLE');
		});

		// Act
		const storage = new SecureStorage();

		// Assert
		expect(context.deleteSharedPreferences.mock.calls[0]).toEqual(['secure_prefs']);
		expect(createPreferences).toHaveBeenCalledTimes(2);
		expect(storage.getSync({ key: 'ApiToken' })).toBeNull();
	});

	it('should fail when the store cannot be rebuilt', () => {
		createPreferences.mockImplementation((): FakePreferences => {
			throw new Error('KEYSTORE_UNAVAILABLE');
		});

		expect(() => new SecureStorage()).toThrow('KEYSTORE_UNAVAILABLE');
	});
});
