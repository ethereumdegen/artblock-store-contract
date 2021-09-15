import { DeployFunction } from 'hardhat-deploy/types'

import { deploy } from '../utils/deploy-helpers'
import { BigNumberish, BigNumber as BN } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const deployOptions: DeployFunction = async (hre) => {
  const { getNamedSigner, run, log } = hre
  const deployer = await getNamedSigner('deployer')

  // Make sure contracts are compiled
  await run('compile')

  log('')
  log('********** Block Store **********', { indent: 1 })
  log('')

  const blockStore = await deploy({
    contract: 'BlockStore',
    name: 'BlockStore',
    hre,
    /*proxy: {
      proxyContract: 'OpenZeppelinTransparentProxy',
    },*/
  })
  
/*
  const uriFetcher = await deploy({
    contract: 'OptionURIFetcher',
    name: 'TellerOptionURIFetcher',
    hre,
    proxy: {
      proxyContract: 'OpenZeppelinTransparentProxy',
    }
  })*/

 
 
 
}

 

deployOptions.tags = ['store']
deployOptions.dependencies = []

export default deployOptions
