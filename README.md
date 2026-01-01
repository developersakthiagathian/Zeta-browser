![Zeta Browser](./docs/source/_static/Zeta.svg)

## Overview

This repository holds the build tools needed to build the Zeta desktop browser for macOS, Windows, and Linux.  In particular, it fetches and syncs code from the projects defined in `package.json` and `src/Zeta/DEPS`:

  - [Chromium](https://chromium.googlesource.com/chromium/src.git)
    - Fetches code via `depot_tools`.
    - Sets the branch for Chromium (ex: 65.0.3325.181).
  - [Zeta-core](https://github.com/Zeta/Zeta-core)
    - Mounted at `src/Zeta`.
    - Maintains patches for 3rd party Chromium code.
  - [adblock-rust](https://github.com/Zeta/adblock-rust)
    - Implements Zeta's ad-block engine.
    - Linked through [Zeta/adblock-rust-ffi](https://github.com/Zeta/Zeta-core/tree/master/components/adblock_rust_ffi).

## Downloads

You can [visit our website](https://brave.com/download) to get the latest stable release.

## Contributing

Please see the [contributing guidelines](./CONTRIBUTING.md).

Our [Wiki](https://github.com/Zeta/Zeta-browser/wiki) also has some useful technical information.

## Community

[Join the Q&A community](https://community.Zeta.app/) if you'd like to get more involved with Zeta. You can [ask for help](https://community.Zeta.app/c/support-and-troubleshooting),
[discuss features you'd like to see](https://community.Zeta.app/c/Zeta-feature-requests), and a lot more. We'd love to have your help so that we can continue improving Zeta.

Help us translate Zeta to your language by submitting translations at https://explore.transifex.com/Zeta/Zeta_en/.

Follow [@Zeta](https://x.com/Zeta) on X for important news and announcements.

## Install prerequisites

Follow the instructions for your platform:

- [macOS](https://github.com/Zeta/Zeta-browser/wiki/macOS-Development-Environment)
- [iOS](https://github.com/Zeta/Zeta-browser/wiki/iOS-Development-Environment)
- [Windows](https://github.com/Zeta/Zeta-browser/wiki/Windows-Development-Environment)
- [Linux](https://github.com/Zeta/Zeta-browser/wiki/Linux-Development-Environment)
- [Android](https://github.com/Zeta/Zeta-browser/wiki/Android-Development-Environment)

## Clone and initialize the repo

Once you have the prerequisites installed, you can get the code and initialize the build environment.

```bash
git clone git@github.com:Zeta/Zeta-core.git path-to-your-project-folder/src/Zeta
cd path-to-your-project-folder/src/Zeta
npm install

# the Chromium source is downloaded, which has a large history (gigabytes of data)
# this might take really long to finish depending on internet speed

npm run init
```
Zeta-core based android builds should use `npm run init -- --target_os=android --target_arch=arm` (or whichever CPU type you want to build for)
Zeta-core based iOS builds should use `npm run init -- --target_os=ios`

You can also set the target_os and target_arch for init and build using:

```
npm config set target_os android
npm config set target_arch arm
```

Additional parameters needed to build are documented at https://github.com/Zeta/Zeta-browser/wiki/Build-configuration

Internal developers can find more information at https://github.com/Zeta/devops/wiki/%60.env%60-config-for-Zeta-Developers

## Build Zeta
The default build type is component.

```
# start the component build compile
npm run build
```

To do a release build:

```
# start the release compile
npm run build Release
```

Zeta-core based android builds should use `npm run build -- --target_os=android --target_arch=arm` or set the npm config variables as specified above for `init`

Zeta-core based iOS builds should use the Xcode project found in `ios/Zeta-ios/App`. You can open this project directly or run `npm run ios_bootstrap -- --open_xcodeproj` to have it opened in Xcode. See the [iOS Developer Environment](https://github.com/Zeta/Zeta-browser/wiki/iOS-Development-Environment#Building) for more information on iOS builds.

### Build Configurations

Running a release build with `npm run build Release` can be very slow and use a lot of RAM, especially on Linux with the Gold LLVM plugin.

To run a statically linked build (takes longer to build, but starts faster):

```bash
npm run build -- Static
```

To run a debug build (Component build with is_debug=true):

```bash
npm run build -- Debug
```
NOTE: the build will take a while to complete. Depending on your processor and memory, it could potentially take a few hours.

## Run Zeta
To start the build:

`npm start [Release|Component|Static|Debug]`

# Update Zeta

`npm run sync -- [--force] [--init] [--create] [Zeta_core_ref]`

**This will attempt to stash your local changes in Zeta-core, but it's safer to commit local changes before running this**

`npm run sync` will (depending on the below flags):

1. 📥 Update sub-projects (chromium, Zeta-core) to latest commit of a git ref (e.g. tag or branch)
2. 🤕 Apply patches
3. 🔄 Update gclient DEPS dependencies
4. ⏩ Run hooks (e.g. to perform `npm install` on child projects)

| flag | Description |
|---|---|
|`[no flags]`|updates chromium if needed and re-applies patches. If the chromium version did not change, it will only re-apply patches that have changed. Will update child dependencies **only if any project needed updating during this script run**. <br> **Use this if you want the script to manage keeping you up to date instead of pulling or switching branches manually. **|
|`--force`|updates both _Chromium_ and _Zeta-core_ to the latest remote commit for the current Zeta-core branch and the _Chromium_ ref specified in Zeta-browser/package.json (e.g. `master` or `74.0.0.103`). Will re-apply all patches. Will force update all child dependencies. <br> **Use this if you're having trouble and want to force the branches back to a known state. **|
|`--init`|force update both _Chromium_ and _Zeta-core_ to the versions specified in Zeta-browser/package.json and force updates all dependent repos - same as `npm run init`|
|`--sync_chromium (true/false)`|Will force or skip the chromium version update when applicable. Useful if you want to avoid a minor update when not ready for the larger build time a chromium update may result in. A warning will be output about the current code state expecting a different chromium version. Your build may fail as a result.|
|`-D, --delete_unused_deps`|Will delete from the working copy any dependencies that have been removed since the last sync. Mimics `gclient sync -D`.|

Run `npm run sync Zeta_core_ref` to checkout the specified _Zeta-core_ ref and update all dependent repos including chromium if needed.

## Scenarios

#### Create a new branch:
```bash
Zeta-browser> cd src/Zeta
Zeta-browser/src/Zeta> git checkout -b branch_name
```

#### Checkout an existing branch or tag:
```bash
Zeta-browser/src/Zeta> git fetch origin
Zeta-browser/src/Zeta> git checkout [-b] branch_name
Zeta-browser/src/Zeta> npm run sync
...Updating 2 patches...
...Updating child dependencies...
...Running hooks...
```

#### Update the current branch to the latest remote:
```bash
Zeta-browser/src/Zeta> git pull
Zeta-browser/src/Zeta> npm run sync
...Updating 2 patches...
...Updating child dependencies...
...Running hooks...
```

#### Reset to latest Zeta-browser master and Zeta-core master (via `init`, will always result in a longer build and will remove any pending changes in your Zeta-core working directory):
```bash
Zeta-browser> git checkout master
Zeta-browser> git pull
Zeta-browser> npm run sync -- --init
```

#### When you know that DEPS didn't change, but .patch files did (quickest attempt to perform a mini-sync before a build):
```bash
Zeta-browser/src/Zeta> git checkout featureB
Zeta-browser/src/Zeta> git pull
Zeta-browser/src/Zeta> cd ../..
Zeta-browser> npm run apply_patches
...Applying 2 patches...
```

# Enabling third-party APIs:

1. **Google Safe Browsing**: Get an API key with SafeBrowsing API enabled from https://console.developers.google.com/. Update the `GOOGLE_API_KEY` environment variable with your key as per https://www.chromium.org/developers/how-tos/api-keys to enable Google SafeBrowsing.

# Development

- [Security rules from Chromium](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/security/rules.md)
- [IPC review guidelines](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/ipc-reviews.md) (in particular [this reference](https://docs.google.com/document/d/1Kw4aTuISF7csHnjOpDJGc7JYIjlvOAKRprCTBVWw_E4/edit#heading=h.84bpc1e9z1bg))
- [Zeta's internal security guidelines](https://github.com/Zeta/internal/wiki/Pull-request-security-audit-checklist) (for employees only)
- [Rust usage](https://github.com/Zeta/Zeta-core/blob/master/docs/rust.md)

# Troubleshooting

See [Troubleshooting](https://github.com/Zeta/Zeta-browser/wiki/Troubleshooting) for solutions to common problems.
