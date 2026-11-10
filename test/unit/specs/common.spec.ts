import { beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import type { GetOptions, RemoveOptions, SetOptions } from '@/common';

const getBoolean = mock((): boolean => false);
const setBoolean = mock((): void => undefined);

mock.module('@nativescript/core', () => ({
	ApplicationSettings: { getBoolean, setBoolean },
}));

const { SecureStorageCommon } = await import('@/common');

class MemoryStorage extends SecureStorageCommon {
	public readonly values: Map<string, string> = new Map<string, string>();
	public failOnRemoveAll: boolean = false;

	public get(arg: GetOptions): Promise<string | null> {
		return Promise.resolve(this.getSync(arg));
	}

	public getSync(arg: GetOptions): string | null {
		return this.values.get(arg.key) ?? null;
	}

	public set(arg: SetOptions): Promise<boolean> {
		return Promise.resolve(this.setSync(arg));
	}

	public setSync(arg: SetOptions): boolean {
		this.values.set(arg.key, arg.value);

		return true;
	}

	public remove(arg: RemoveOptions): Promise<boolean> {
		return Promise.resolve(this.removeSync(arg));
	}

	public removeSync(arg: RemoveOptions): boolean {
		return this.values.delete(arg.key);
	}

	public removeAll(): Promise<boolean> {
		return Promise.resolve(this.removeAllSync());
	}

	public removeAllSync(): boolean {
		if (this.failOnRemoveAll === true) {
			throw new Error('REMOVE_ALL_FAILED');
		}

		this.values.clear();

		return true;
	}
}

const createStorage = (isFirstRun: boolean): MemoryStorage => {
	getBoolean.mockImplementation((): boolean => isFirstRun);

	const storage: MemoryStorage = new MemoryStorage();
	storage.setSync({ key: 'ApiToken', value: 'token-1' });

	return storage;
};

describe('@/common', () => {
	beforeEach(() => {
		getBoolean.mockReset();
		setBoolean.mockReset();
	});

	it('should report a first run and remember that it happened', async () => {
		const storage: MemoryStorage = createStorage(true);

		expect(storage.isFirstRunSync()).toBe(true);
		expect(await storage.isFirstRun()).toBe(true);
		expect(setBoolean).toHaveBeenCalledWith('__IS_FIRST_RUN__', false);
	});

	it('should not report a first run on a later start', async () => {
		const storage: MemoryStorage = createStorage(false);

		expect(storage.isFirstRunSync()).toBe(false);
		expect(await storage.isFirstRun()).toBe(false);
		expect(setBoolean).not.toHaveBeenCalled();
	});

	it('should clear the stored values on a first run', () => {
		const storage: MemoryStorage = createStorage(true);

		expect(storage.clearAllOnFirstRunSync()).toBe(true);
		expect(storage.getSync({ key: 'ApiToken' })).toBeNull();
	});

	it('should keep the stored values on a later start', () => {
		const storage: MemoryStorage = createStorage(false);

		expect(storage.clearAllOnFirstRunSync()).toBe(false);
		expect(storage.getSync({ key: 'ApiToken' })).toBe('token-1');
	});

	it('should clear the stored values on a first run through the async method', async () => {
		const storage: MemoryStorage = createStorage(true);

		expect(await storage.clearAllOnFirstRun()).toBe(true);
		expect(storage.getSync({ key: 'ApiToken' })).toBeNull();
	});

	it('should keep the stored values on a later start through the async method', async () => {
		const storage: MemoryStorage = createStorage(false);

		expect(await storage.clearAllOnFirstRun()).toBe(false);
		expect(storage.getSync({ key: 'ApiToken' })).toBe('token-1');
	});

	it('should return false when clearing on a first run fails', () => {
		// Arrange
		const log = spyOn(console, 'log').mockImplementation((): void => undefined);
		const storage: MemoryStorage = createStorage(true);
		storage.failOnRemoveAll = true;

		// Act
		const isCleared: boolean = storage.clearAllOnFirstRunSync();

		// Assert
		expect(isCleared).toBe(false);
		expect(storage.getSync({ key: 'ApiToken' })).toBe('token-1');

		log.mockRestore();
	});
});
