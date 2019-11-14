import ethUtils from 'ethereumjs-util'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import deployer from '../../helpers/deployer.js'
import logDecoder from '../../helpers/log-decoder.js'
import { buildInFlight } from '../../mockResponses/utils'
import StatefulUtils from '../../helpers/StatefulUtils'

const predicateTestUtils = require('./predicateTestUtils')
const crypto = require('crypto')
const Web3 = require('web3')
const Matic = require('maticjs').default

const utils = require('../../helpers/utils')
const web3Child = utils.web3Child

chai.use(chaiAsPromised).should()
let contracts, childContracts
let predicate, statefulUtils

// contract('ERC721Predicate with Maticjs', async function(accounts) {
//   let tokenId
//   const alice = accounts[0]
//   const bob = accounts[1]

//   before(async function() {
//     contracts = await deployer.freshDeploy()
//     contracts.ERC721Predicate = await deployer.deployErc721Predicate()
//     childContracts = await deployer.initializeChildChain(accounts[0])
//     statefulUtils = new StatefulUtils()
//   })

//   describe('ERC721PlasmaMetadataMintable', async function() {
//     let maticClient

//     beforeEach(async function() {
//       predicate = await deployer.deployErc721Predicate()
//       maticClient = await initializeMaticClient(contracts)
//       const { rootERC721, childErc721 } = await deployer.deployChildErc721MetadataMintable()
//       // add ERC721Predicate as a minter
//       await rootERC721.addMinter(predicate.address)
//       childContracts.rootERC721 = rootERC721
//       childContracts.childErc721 = childErc721
//       tokenId = '0x' + crypto.randomBytes(32).toString('hex')
//     })

//     it('startExitForMintWithTokenURITokens', async function() {
//       const uri = `https://tokens.com/${tokenId}`
//       const { receipt: r } = await childContracts.childErc721.mintWithTokenURI(alice, tokenId, uri)
//       await web3Child.eth.getTransaction(r.transactionHash)
//       await childContracts.childErc721.transferFrom(alice, bob, tokenId)

//       const receipt = await maticClient.withdrawManager.burnERC721Token(
//         childContracts.childErc721.address,
//         tokenId,
//         { from: bob }
//       )
//       // the token doesnt exist on the root chain as yet
//       expect(await childContracts.rootERC721.exists(tokenId)).to.be.false

//       await statefulUtils.submitCheckpoint2(contracts.rootChain, receipt, accounts)

//       const startExit = await maticClient.withdrawManager.startExitForMintWithTokenURITokens(
//         receipt.transactionHash,
//         { from: bob }
//       )
//       console.log('startExit', startExit.gasUsed)

//       expect(await childContracts.rootERC721.exists(tokenId)).to.be.true
//       expect(await childContracts.rootERC721.tokenURI(tokenId)).to.equal(uri)
//       expect((await childContracts.rootERC721.ownerOf(tokenId)).toLowerCase()).to.equal(contracts.depositManager.address.toLowerCase())

//       await predicateTestUtils.timeTravel()
//       await maticClient.withdrawManager.processExits(childContracts.rootERC721.address, { from: alice })
//       assert.strictEqual(await childContracts.rootERC721.ownerOf(tokenId), bob)
//       expect(await childContracts.rootERC721.tokenURI(tokenId)).to.equal(uri)
//     })

//     it('startBulkExitForMintWithTokenURITokens with maticjs', async function() {
//       const NUM_TOKENS = 3
//       const withdrawls = []
//       const tokenIds = []
//       for (let i = 0; i < NUM_TOKENS; i++) {
//         tokenId = '0x' + crypto.randomBytes(32).toString('hex')
//         const uri = `https://tokens.com/${tokenId}`
//         tokenIds.push({ tokenId, uri })
//         await childContracts.childErc721.mintWithTokenURI(alice, tokenId, uri)
//         await childContracts.childErc721.transferFrom(alice, bob, tokenId)

//         const withdraw = await maticClient.withdrawManager.burnERC721Token(
//           childContracts.childErc721.address,
//           tokenId, { from: bob }
//         )
//         withdrawls.push(withdraw.transactionHash)
//         // the token doesnt exist on the root chain as yet
//         expect(await childContracts.rootERC721.exists(tokenId)).to.be.false
//         await statefulUtils.submitCheckpoint2(contracts.rootChain, withdraw, accounts)
//       }

//       const startExit = await maticClient.withdrawManager.startBulkExitForMintWithTokenURITokens(
//         withdrawls,
//         { from: bob }
//       )
//       console.log('startExit', startExit.gasUsed)

//       for (let i = 0; i < NUM_TOKENS; i++) {
//         tokenId = tokenIds[i].tokenId
//         const uri = tokenIds[i].uri
//         expect(await childContracts.rootERC721.exists(tokenId)).to.be.true
//         expect(await childContracts.rootERC721.tokenURI(tokenId)).to.equal(uri)
//         expect((await childContracts.rootERC721.ownerOf(tokenId)).toLowerCase()).to.equal(contracts.depositManager.address.toLowerCase())
//       }

//       await predicateTestUtils.timeTravel()
//       await maticClient.withdrawManager.processExits(childContracts.rootERC721.address, { from: alice })
//       for (let i = 0; i < NUM_TOKENS; i++) {
//         assert.strictEqual(await childContracts.rootERC721.ownerOf(tokenId), bob)
//       }
//     })
//   })
// })

async function initializeMaticClient(contracts) {
  const options = {
    parentProvider: new Web3('http://localhost:8545'),
    maticProvider: new Web3('http://localhost:8546'),
    registry: contracts.registry.address,
    rootChain: contracts.rootChain.address,
    depositManager: contracts.depositManager.address,
    withdrawManager: contracts.withdrawManager.address
  }
  const maticClient = new Matic(options)
  await maticClient.initialize()
  return maticClient
}
