import { ConfigParams } from '@/lib/createDefaultConfig'
import inquirer from 'inquirer'
import { uninstall } from '@/cli/setup/uninstall'
import { Logger } from '@/lib/logger'
import { langSet } from '@/lib/langSet'
import chalk from 'chalk'
import { monitorUpdate, updateVersion } from '@/cli/update'
import { CONFIG } from '@/config/config'
import { migrate } from '@/lib/migrate/migrate'
import { checkValidatorCommands } from './checkValidator'
import { getValidatorInfoCommands } from './getValidatorInfo'

export enum INSTALLER_CHOICES {
  UPGRADE,
  CHECK,
  CONFIG,
  BACKUP,
  MIGRATE,
  UNINSTALL,
  EXIT,
}

export const server = async (solvConfig: ConfigParams) => {
  Logger.solvAA()
  const { logs, installer, cmds } = solvConfig.locale
  const { config } = solvConfig
  if (!config.LANG_SETUP) {
    await langSet()
    console.log(`Please run command again:\n\n${chalk.green('$ solv s')}`)
    return
  }
  const msg = Logger.warningHex(logs.installer.welcomeMsg)
  console.log(msg + '\n')

  if (!config.IS_SETUP) {
    const msg2 = logs.installer.description
    console.log(Logger.greyHex(msg2) + '\n')
  }

  // Put increment number in front of each item
  const choices = installer.map((item, index) => {
    return `${index + 1}${item}`
  })
  const answer = await inquirer.prompt<{ server: string }>([
    {
      name: 'server',
      type: 'list',
      message: cmds.installer,
      choices,
    },
  ])

  const selectedOption = (Number(answer.server.split(')')[0]) -
    1) as INSTALLER_CHOICES
  switch (selectedOption) {
    case INSTALLER_CHOICES.UPGRADE:
      console.log('Upgrading solv...')
      updateVersion(CONFIG.SOLANA_VERSION)
      Logger.normal(
        `✔️ Update to Solana Version ${chalk.green(CONFIG.SOLANA_VERSION)}`,
      )
      monitorUpdate(CONFIG.DELINQUENT_STAKE, true)
      break
    case INSTALLER_CHOICES.CHECK:
      checkValidatorCommands(solvConfig)
      break
    case INSTALLER_CHOICES.CONFIG:
      getValidatorInfoCommands(solvConfig)
      break
    case INSTALLER_CHOICES.BACKUP:
      console.log('Coming soon...')
      //await scpCreate()
      break
    case INSTALLER_CHOICES.MIGRATE:
      console.log('Migrating Validator Config...')
      await migrate()
      break
    case INSTALLER_CHOICES.UNINSTALL:
      await uninstall()
      break
    case INSTALLER_CHOICES.EXIT:
      console.log('Exiting solv...')
      break
    default:
      break
  }
}
