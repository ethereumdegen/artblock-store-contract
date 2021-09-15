import { Contract, Signer } from 'ethers'
import * as hre from 'hardhat'
 
import fs from 'fs'
import path from 'path'
 

const { getNamedSigner, contracts, deployments, ethers } = hre

import ethUtil from 'ethereumjs-util'


import EIP712Helper from './helpers/EIP712Helper'
import EIP712Utils from './helpers/EIP712Utils'


const { use, should, expect } = require('chai')
const { solidity } = require('ethereum-waffle')

use(solidity)
should()
 

let customConfigJSON = fs.readFileSync(path.join('test/helpers/eip712-config.json'));
let customConfig = JSON.parse(customConfigJSON.toString())



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

    it('Should be able to sign an offchain Sell Order', async() => {

      let counterpartyAddress = await counterparty.getAddress()

      let dataValues = {
          orderCreator:counterpartyAddress,
          isSellOrder:true,
          nftContractAddress:"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
          nftTokenId:0,
          currencyTokenAddress:"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
          currencyTokenAmount:100,
          expires:0 
      }
      
      let chainId = await hre.getChainId()

 
      console.log('chainId', chainId)

      const typedData = EIP712Utils.getTypedDataFromParams( 
        parseInt(chainId),  
        storeContract.address,
        customConfig,
        dataValues  
      )
  
      console.log('typedData', (typedData))
      let typedDatahash = EIP712Utils.getTypedDataHash(typedData) 
  
     // var privateKey = testAccount.secretKey;
     // var privKey = Buffer.from(privateKey.substring(2), 'hex')
   
      //const sig = ethUtil.ecsign( typedDatahash   , privKey );

      let sig2 = await counterparty.signMessage( typedDatahash )
 
     // var signature = ethUtil.toRpcSig(sig.v, sig.r, sig.s);
    
      let recoveredSigner = EIP712Utils.recoverPacketSigner(typedData, sig2)
      console.log('recoveredSigner', recoveredSigner )
        
  
      expect(recoveredSigner.toLowerCase()).to.eql(counterpartyAddress.toLowerCase())
  

    })

    it('Should be able to fulfill an offchain Sell Order', async () => {

        let provider = hre.network.provider

      //  let signature = OrderPacketUtils.signTypedData(provider,user,typedData )
      /*  let signature = 'test'

        let NATIVE_ETH = '0x0000000000000000000000000000000000000010'

        let orderPacket = OrderPacketUtils.getOrderPacket(await counterparty.getAddress(),true,erc721Contract.getAddress,0,NATIVE_ETH,100,0)
        let typedData

        let resultAddress = OrderPacketUtils.recoverOrderPacketSigner(typedData,signature);
       */




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
 

