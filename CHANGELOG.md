## [1.0.0](https://github.com/NostradamusICTBV/ns-secure-storage/releases/tag/v1.0.0) (2026-11-11)

### Features

- **NOS-21989:** bestaande Hawk-waarden migreren naar de Keystore-opslag ([c573ece](https://github.com/NostradamusICTBV/ns-secure-storage/commit/c573ece405835b3540bcd578a36294ec494063ec))

### Bug Fixes

- **NOS-21989:** async-fouten afwijzen en store pas na retry resetten ([218f225](https://github.com/NostradamusICTBV/ns-secure-storage/commit/218f22529f4cc8181eb585adca46bf539eae0148))
- **NOS-21989:** Android-opslag via Android Keystore in plaats van Hawk ([dedbadd](https://github.com/NostradamusICTBV/ns-secure-storage/commit/dedbaddebb29e244e7e6b4abff8bea9addd85bab))

### Code Refactoring

- **NOS-21989:** bronnen naar src en build naar dist ([deb26c9](https://github.com/NostradamusICTBV/ns-secure-storage/commit/deb26c9a03ee35b2122753124acb074681619b8c))
- **NOS-21989:** types verplaatst naar @types ([ff58244](https://github.com/NostradamusICTBV/ns-secure-storage/commit/ff58244b8b6108303d29188a900c2d7b98704611))

### Documentation

- **NOS-21989:** Yarn-eisen voor installatie verduidelijkt ([93e1776](https://github.com/NostradamusICTBV/ns-secure-storage/commit/93e1776d59828e62359769b90eaf8d877d456f90))
- **NOS-21989:** installatie vanuit de repository beschreven ([59149a3](https://github.com/NostradamusICTBV/ns-secure-storage/commit/59149a36352b90639e157102f71e5f0b05979fe4))
- **NOS-21989:** upstream-historie uit de changelog verwijderd ([f7d9998](https://github.com/NostradamusICTBV/ns-secure-storage/commit/f7d999854e278846325c338e2d3188267f34ee51))
- **NOS-21989:** migratiegids vanaf @nativescript/secure-storage toegevoegd ([d9374b6](https://github.com/NostradamusICTBV/ns-secure-storage/commit/d9374b6a7852c21522a7b79933f7a1c3f0f1b315))

### Tests

- **NOS-21989:** coverage via istanbun met een drempel van 100% ([973f2e2](https://github.com/NostradamusICTBV/ns-secure-storage/commit/973f2e2d67ed4b3a63b53fb71e8ae02326b18929))
- **NOS-21989:** unittests voor de Android-backend ([d20ff82](https://github.com/NostradamusICTBV/ns-secure-storage/commit/d20ff823449707425bb9bd52a735d79a225a68fc))

### Build System

- **NOS-21989:** node_modules-linker voor de bouw als git-dependency ([9845455](https://github.com/NostradamusICTBV/ns-secure-storage/commit/984545595943847c63e61881a28db543aa77aa43))
- **NOS-21989:** build en prepack werken ook zonder Unix-shell ([d934844](https://github.com/NostradamusICTBV/ns-secure-storage/commit/d93484427888ec69c5f6e41229c07ffff8dc229f))
- **NOS-21989:** pakket installeerbaar als git-dependency zonder bun ([f85b9aa](https://github.com/NostradamusICTBV/ns-secure-storage/commit/f85b9aaa13c9006ce7ee887297f8023505f5adc9))
- **NOS-21989:** Prettier toegevoegd met de instellingen van upstream ([565874a](https://github.com/NostradamusICTBV/ns-secure-storage/commit/565874ab00461eb75f152c61c7d3987dc1f84734))
- **NOS-21989:** ESM-build gelijk aan upstream met TypeScript 6 ([1499a70](https://github.com/NostradamusICTBV/ns-secure-storage/commit/1499a707a314d3f30e75795cce66a732772fb45f))

### Continuous Integration

- release met vooraf gebouwde tarball bij een versietag ([f5531f2](https://github.com/NostradamusICTBV/ns-secure-storage/commit/f5531f2890a821a9286b52ac4fb87ddc302d5941))
- **NOS-21989:** GitHub Actions en Dependabot toegevoegd ([953ac26](https://github.com/NostradamusICTBV/ns-secure-storage/commit/953ac26095724496dac4703f84101d9394dfbf3d))

### Chores

- **deps-dev:** bump typescript from 6.0.3 to 7.0.2 ([bb620a7](https://github.com/NostradamusICTBV/ns-secure-storage/commit/bb620a7936547293eaad7389f6c01939d4aceed3))
- **NOS-21989:** secure-storage fork standalone maken als @nostradamus/ns-secure-storage ([3343bc9](https://github.com/NostradamusICTBV/ns-secure-storage/commit/3343bc93b8ba61604dc5113a5920ade7c3c06f77))
- fork @nativescript/secure-storage v4.0.2 (upstream baseline) ([281a59b](https://github.com/NostradamusICTBV/ns-secure-storage/commit/281a59b5cc85c95abcb6d90b57e73be907a8b326))
