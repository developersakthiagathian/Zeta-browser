// Copyright (c) 2019 The Zeta Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

const fs = require('fs')
const Log = require('../lib/logging')
const path = require('path')
const { spawnSync } = require('child_process')
const util = require('../lib/util')

Log.progress('Performing initial checkout of Zeta-core')

const ZetaCoreDir = path.resolve(__dirname, '..', 'src', 'Zeta')
const ZetaCoreRef = util.getProjectVersion('Zeta-core')

if (!fs.existsSync(path.join(ZetaCoreDir, '.git'))) {
  Log.status(`Cloning Zeta-core [${ZetaCoreRef}] into ${ZetaCoreDir}...`)
  fs.mkdirSync(ZetaCoreDir)
  util.runGit(ZetaCoreDir, ['clone', util.getNPMConfig(['projects', 'Zeta-core', 'repository', 'url']), '.'])
  util.runGit(ZetaCoreDir, ['checkout', ZetaCoreRef])
}
const ZetaCoreSha = util.runGit(ZetaCoreDir, ['rev-parse', 'HEAD'])
Log.progress(`Zeta-core repo at ${ZetaCoreDir} is at commit ID ${ZetaCoreSha}`)

let npmCommand = 'npm'
if (process.platform === 'win32') {
  npmCommand += '.cmd'
}

util.run(npmCommand, ['install'], { cwd: ZetaCoreDir })

util.run(npmCommand, ['run', 'sync' ,'--', '--init'].concat(process.argv.slice(2)), {
  cwd: ZetaCoreDir,
  env: process.env,
  stdio: 'inherit',
  shell: true,
  git_cwd: '.', })
