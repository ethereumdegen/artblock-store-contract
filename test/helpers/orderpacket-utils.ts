/*
BID PACKET UTIL for NODEJS
javascript library for NODEJS
Version 0.10
*/
import EIP712Helper from "./EIP712Helper" 
import web3utils from 'web3-utils'

import ethUtil from 'ethereumjs-util'
 import ethSigUtil from 'eth-sig-util'
 


//"BidPacket(address bidderAddress,address nftContractAddress,address currencyTokenAddress,uint256 currencyTokenAmount,uint256 expires)"
 

var sampleBidPacket = {
    bidderAddress: "0xb11ca87e32075817c82cc471994943a4290f4a14",
    nftContractAddress: "0x0000000000000000000000000000000000000000",
    currencyTokenAddress: "0x357FfaDBdBEe756aA686Ef6843DA359E2a85229c",
    currencyTokenAmount:1000,  
    requireProjectId: false,
    projectId:0,  
    expires:0,
    signature: 0x0
}


export default class OrderPacketUtils {






    static getOrderPacket(
        orderCreator:string,
        isSellOrder:boolean,
        nftContractAddress:String,
        nftTokenId:number,
        currencyTokenAddress:String,
        currencyTokenAmount:number,
        expires:number,
        signature:string        
    ){

      return {
        orderCreator:orderCreator,
        isSellOrder:isSellOrder,
        nftContractAddress: nftContractAddress,
        nftTokenId:nftTokenId,
        currencyTokenAddress: currencyTokenAddress,
        currencyTokenAmount: currencyTokenAmount,
        expires:expires,        
        signature:signature
      }


    }
 
  /// "\x19\x01",
  ///  getEIP712DomainHash('BuyTheFloor','1',_chain_id,address(this)),
   /// getBidPacketHash(bidderAddress,nftContractAddress,currencyTokenAddress,currencyTokenAmount,expires)
      static getOrderTypedDataHash(typedData:any)
      {
        var typedDataHash = web3utils.soliditySha3(
                "\x19\x01",
                EIP712Helper.structHash('EIP712Domain', typedData.domain, typedData.types).toString(),
                EIP712Helper.structHash(typedData.primaryType, typedData.message, typedData.types).toString(),
           
        );

        
        //console.log('meep 1 - correct',Buffer.from(EIP712Helper.structHash('EIP712Domain', typedData.domain, typedData.types)).toString('hex')         )
        //console.log('meep 2 - correct', Buffer.from(EIP712Helper.structHash(typedData.primaryType, typedData.message, typedData.types)).toString('hex')   )
        return typedDataHash;
      }
 

     static recoverOrderPacketSigner( typedData:any, signature:string){

      console.log('signature',signature)

       var sigHash = OrderPacketUtils.getOrderTypedDataHash( typedData );
      // var msgBuf = ethUtil.toBuffer(signature)
       const res = ethUtil.fromRpcSig( signature );


       var hashBuf = ethUtil.toBuffer(sigHash)

       const pubKey  = ethUtil.ecrecover(hashBuf, res.v, res.r, res.s);
       const addrBuf = ethUtil.pubToAddress(pubKey);
       const recoveredSignatureSigner    = ethUtil.bufferToHex(addrBuf);

       var message = typedData.message

       console.log('recovered signer pub address',recoveredSignatureSigner.toLowerCase())
       //make sure the signer is the depositor of the tokens
       return recoveredSignatureSigner.toLowerCase();

     }



/*
     static signTypedData(privateKey:string, msgParams:any)
    {

      const msgHash = ethSigUtil.typedSignatureHash(msgParams.data)
       

      var msgBuffer= ethUtil.toBuffer(msgHash)
      var pkeyBuffer= ethUtil.toBuffer(privateKey)

      const sig = ethUtil.ecsign(msgBuffer, pkeyBuffer)
      return ethUtil.bufferToHex(ethSigUtil.concatSig(sig.v, sig.r, sig.s))

    }*/

//"BidPacket(address bidderAddress,address nftContractAddress,address currencyTokenAddress,uint256 currencyTokenAmount,uint256 expires)"
 
    static getOrderTypedDataFromParams( 
      _chainId:number,
      _contractAddress:string,
      orderCreator:string,
      isSellOrder:boolean,
      nftContractAddress:string,
      nftTokenId:number,
      currencyTokenAddress:string,
      currencyTokenAmount:number,
      expires:number)
    {
      const typedData = {
              types: {
                  EIP712Domain: [
                      { name: "contractName", type: "string" },
                      { name: "version", type: "string" },
                      { name: "chainId", type: "uint256" },
                      { name: "verifyingContract", type: "address" }
                  ],
                  OffchainOrder: [
                      { name: 'orderCreator', type: 'address' },
                      { name: 'isSellOrder', type: 'bool' },
                      { name: 'nftContractAddress', type: 'address' },  
                      { name: 'nftTokenId', type: 'uint256' },     
                      { name: 'currencyTokenAddress', type: 'address' },
                      { name: 'currencyTokenAmount', type: 'uint256' },                      
                      { name: 'expires', type: 'uint256' }
                  ],
              },
              primaryType: 'OffchainOrder',
              domain: {
                  contractName: "BlockStore",
                  version: "1",
                  chainId: _chainId,  
                  verifyingContract: web3utils.toChecksumAddress(_contractAddress)
              },
              message: {
                orderCreator: web3utils.toChecksumAddress(orderCreator),
                isSellOrder: isSellOrder,
                nftContractAddress: web3utils.toChecksumAddress(nftContractAddress),
                nftTokenId: nftTokenId,
                currencyTokenAddress: web3utils.toChecksumAddress(currencyTokenAddress),
                currencyTokenAmount: currencyTokenAmount,
                expires:expires
              }
          };



        return typedData;
    }
 
 

      static formatAmountWithDecimals(amountRaw:number,decimals:number)
      {
      var amountFormatted = amountRaw / (Math.pow(10,decimals) * 1.0)
 
      return amountFormatted;
    }


 

        //updating to spec
        // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md

        //https://github.com/ethereum/EIPs/blob/master/assets/eip-712/Example.sol

      static getEIP712TypedData()
      {

        return {
          type: 'object',
          properties: {
            types: {
              type: 'object',
              properties: {
                EIP712Domain: {type: 'array'},
              },
              additionalProperties: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {type: 'string'},
                    type: {type: 'string'}
                  },
                  required: ['name', 'type']
                }
              },
              required: ['EIP712Domain']
            },
            primaryType: {type: 'string'},
            domain: {type: 'object'},
            message: {type: 'object'}
          },
          required: ['types', 'primaryType', 'domain', 'message']
        }



      }



      static async performOffchainSignForBidPacket(args:any, web3Plug:any){
 
        

       let chainId = web3Plug.getActiveNetId()

       let contractData = web3Plug.getContractDataForActiveNetwork()

       let contractAddress = contractData['buythefloor'].address
 
 
 
       const typedData = OrderPacketUtils.getOrderTypedDataFromParams(
             
            chainId,  //0x2a for Kovan  -- MUST be in hex!? 
            contractAddress,
            args['orderCreator'],  //unpack the args 
            args['isSellOrder'],
            args['nftContractAddress'],
            args['nftTokenId'],
            args['currencyTokenAddress'],
            args['currencyTokenAmount'],
            args['expires'] 
       )
 

        console.log('bidpacket  typedData',typedData)
 
        var stringifiedData = JSON.stringify(  typedData );

        
        let typedDatahash = OrderPacketUtils.getOrderTypedDataHash(typedData)

        console.log('typedDatahash',typedDatahash)
        let signResult = await  OrderPacketUtils.signTypedData( web3Plug.getWeb3Instance(), args[0], stringifiedData  )
        
        
        
        console.log( 'signResult', signResult )  

        return signResult 

  }

  static async signTypedData(web3:any, signer:any, data:any )
    {
      var result = await new Promise(async resolve => {
  
              web3.currentProvider.sendAsync(
                {
                    method: "eth_signTypedData_v3",
                    params: [signer, data],
                    from: signer
                },
                function(err:any, result:any) {
                    if (err) {
                        return console.error(err);
                    }  
                      const signature = result.result.substring(2);
                    const r = "0x" + signature.substring(0, 64);
                    const s = "0x" + signature.substring(64, 128);
                    const v = parseInt(signature.substring(128, 130), 16);    // The signature is now comprised of r, s, and v.
                    console.log({r: r, s:s, v: v })
                    console.log('sign returned ',   result)
                    resolve({ signature: result.result, v:v, r:r, s:s  } )
                    }
                );
  
       
  
  
        });
  
        return result;
    }



/*
  let sellParams = {
          
    nftTokenAddress: this.selectedBidPacket.nftTokenAddress,
    tokenId: this.ownedTokenIdToSell, 
    from: this.web3Plug.getActiveAccountAddress(),
    to:  this.selectedBidPacket.bidderAddress,
    currencyToken: this.selectedBidPacket.currencyTokenAddress,
    currencyAmount: this.selectedBidPacket.currencyTokenAmount,
    expires: this.selectedBidPacket.expires,
    buyerSignature: this.selectedBidPacket.signature


   }*/

   /*
   static async getPacketBurnStatus(packet, BTFContractABI, web3Plug){

    let contractData = web3Plug.getContractDataForActiveNetwork()

    let contractAddress = contractData['buythefloor'].address
    let contract = web3Plug.getCustomContract( BTFContractABI,contractAddress )

    
    let typedData = BidPacketUtils.getBidTypedDataFromParams( 
      web3Plug.getActiveNetId(), 
      contractAddress,
      packet.bidderAddress, 
      packet.nftContractAddress, 
      packet.currencyTokenAddress, 
      packet.currencyTokenAmount, 
      packet.requireProjectId, 
      packet.projectId,
      packet.expires
       )



    let sigHash = BidPacketUtils.getBidTypedDataHash( typedData )


    let status =  await contract.methods.burnedSignatures(sigHash).call()
    console.log('burn status', packet, status )

    return parseInt(status)
   }

    
   static async sellNFTToBid(sellParams, BTFContractABI, web3Plug){

    let contractData = web3Plug.getContractDataForActiveNetwork()

    let contractAddress = contractData['buythefloor'].address
    let contract = web3Plug.getCustomContract( BTFContractABI,contractAddress )

    console.log(sellParams)

    return await contract.methods.sellNFT(...Object.values(sellParams)).send({ from: sellParams.from })

   }*/
}