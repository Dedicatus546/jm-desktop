import type { ForgeConfig } from '@electron-forge/shared-types';
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { FuseV1Options, FuseVersion } from '@electron/fuses'

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'jm-desktop', // 对应 productName
    executableName: 'jm-desktop',
    icon: './public/win/app-icon', // Windows 图标（不要扩展名）
  },
  outDir: "./release",
  rebuildConfig: {},
  makers: [
    // {
    //   name: '@electron-forge/maker-zip',
    //   platforms: ['linux'],
    //   config: {
    //     arch: ['x64'], // 对应 linux.target.arch
    //   },
    // },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
      config: {
        arch: ['x64']
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      // [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      // [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      // [FuseV1Options.EnableNodeCliInspectArguments]: false,
      // [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      // [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'Dedicatus546', // 对应 owner
          name: 'jm-desktop', // 对应 repo
        },
        draft: true,
        prerelease: false,
        // releaseType: 'release'   // 对应 releaseType（默认就是 release）
      },
    },
  ],
}

export default config;