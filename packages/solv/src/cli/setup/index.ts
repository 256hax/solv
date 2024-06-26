import { program } from '@/index'
import { setup } from '@/cli/setup/setup'
import chalk from 'chalk'
import { setupVoteAccount } from '@/cli/setup/setupVoteAccount'
import {
  ConfigParams,
  readOrCreateDefaultConfig,
} from '@/lib/readOrCreateDefaultConfig'
import { createSolvKeyPairs } from '@/lib/createSolvKeys'
import { testnetSetup } from './testnetSetup'
import { updateSolvConfig } from '@/lib/updateSolvConfig'
import { updateLogrotate } from '@/cli/setup/updateLogrotate'
import { rmLogs } from './rmLogs'
import { setupSwap } from './setupSwap'

type SetupOptions = {
  vote: boolean
  key: boolean
  testnet: boolean
  mainnet: boolean
  rpc: boolean
  commission: string
  swap: boolean
}

export const setupCommands = (solvConfig: ConfigParams) => {
  const { cmds } = solvConfig.locale

  program
    .command('rmLogs')
    .description('Remove Logs')
    .action(() => {
      rmLogs()
    })

  program
    .command('setup')
    .description(cmds.setup)
    .option('--vote', 'Setup Vote Account', false)
    .option('--key', 'Setup Validator Keypairs', false)
    .option('--swap', 'Setup Swap', false)
    .action(async (options: SetupOptions) => {
      updateSolvConfig({ COMMISSION: Number(options.commission) })
      const solvConfigReflectComission = readOrCreateDefaultConfig()
      if (options.vote) {
        console.log(chalk.white('Setting up Vote Account ...'))
        setupVoteAccount(solvConfigReflectComission)
      } else if (options.key) {
        console.log(chalk.white('Setting up Validator Keypairs ...'))
        createSolvKeyPairs(solvConfigReflectComission)
      } else if (options.testnet) {
        console.log(chalk.white('Setting up Testnet Validator ...'))
        await testnetSetup(solvConfigReflectComission)
      } else if (options.swap) {
        await setupSwap()
      } else {
        console.log(chalk.white('Setting up Solana Validator ...'))
        await setup(solvConfigReflectComission)
      }
    })
}
