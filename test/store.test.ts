import { Contract, Signer } from 'ethers'
import * as hre from 'hardhat'
 
const { getNamedSigner, contracts, deployments, ethers } = hre


import OrderPacketUtils from './helpers/orderpacket-utils'

const { use, should, expect } = require('chai')
const { solidity } = require('ethereum-waffle')

use(solidity)
should()
 


describe('Store', function () {

  let user:Signer;
  let counterparty:Signer;

  let storeContract: Contract;
  let erc721Contract: Contract;

 

  beforeEach(async () => {
    
    await hre.deployments.fixture('store', {
      keepExistingDeployments: false
    })
     
    user = await getNamedSigner('borrower')
    counterparty = await getNamedSigner('lender')

    storeContract = await contracts.get('BlockStore')

    const ERC721ContractFactory = await ethers.getContractFactory('MintableERC721')
    erc721Contract = await ERC721ContractFactory.deploy()
   
 
  })

  describe('receive hooks', () => {
    it('Should not be able to receive any ERC721 tokens without creating an option', async () => {
      await erc721Contract.connect(user).mint(0)
      await erc721Contract.connect(user)['safeTransferFrom(address,address,uint256)'](user.getAddress(), storeContract.address, 0)
        .should.be.revertedWith('ERC721: transfer to non ERC721Receiver implementer')
    }) 
     
  })

    

  describe('Orders', () => {
    it('Should be able to fulfill an offchain Sell Order', async () => {
     
     // let signature = OrderPacketUtils.signTypedData( )
     
      /*const bundle = await createBundle({ 721: [0] })
      await optionsContract.connect(user).createOption(bundle, 100, ONE_MONTH)

      let balanceBefore = await filler.getBalance()

      let fillTx = await optionsContract.connect(filler).fillOption(0, { value: 100 })
        // @ts-ignore
        .then(({ wait }) => wait())

      // filler balance should be decremented by the cost of the fillTx and by the value of the fill
      const balanceAfter = await filler.getBalance()
      const expectedBalance = balanceBefore.sub(100).sub(fillTx.gasUsed.mul(fillTx.effectiveGasPrice))
      balanceAfter.should.eql(expectedBalance)*/
    })

    it('Should be able to fulfill an offchain Buy Order', async () => {
       
    })

     
  })

  
  describe('cancel Order', () => {
    it('Should be able to cancel an order', async () => {
       
    })

     
 
  })

   
})
