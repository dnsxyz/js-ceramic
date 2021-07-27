import { AccountID } from 'caip'
import { RemoteSigner } from '@taquito/remote-signer'
import { BlockchainHandler } from '../blockchain-handler'
import { LinkProof } from '@ceramicnetwork/blockchain-utils-linking'
import fetch from 'cross-fetch'
import * as uint8arrays from 'uint8arrays'

export const ADDRESS_NOT_FOUND_ERROR = new Error(`Address not found on the Tezos blockchain`)
export const PUBLIC_KEY_NOT_PUBLISHED_ERROR = new Error(
  `Public key not published to the Tezos blockchain`
)

const namespace = 'tezos'

const FAKE_API_ENDPOINT = 'https://fake-api.example.com' // this enpoint is never actually called

// should be the same as @taquito/utils char2Bytes()
// exported for testing to ensure above
/**
 * converts a utf8 string to a hex string
 *
 * @param {string} input - the string to convert
 * @returns {string} the converted hex string
 */
export function char2Bytes(input: string): string {
  return uint8arrays.toString(uint8arrays.fromString(input, 'utf8'), 'base16')
}

/**
 * creates a function which attempts to resolve the public key associated with the wallet address
 *
 * @param {string} address - a Tezos wallet address to lookup
 * @returns {() => Promise<string>} - the fetching function for the public key of the address
 * @throws {Error} - if the address is not found on the blockchain
 * @throws {Error} - if the public key is not published to the blockchain
 */
function publicKeyFinder(address: string): () => Promise<string> {
  // request the public key from the Tezos blockchain
  const request = fetch(`https://api.tzstats.com/explorer/account/${address}`).catch(() => {
    throw ADDRESS_NOT_FOUND_ERROR
  })
  return async (): Promise<string> => {
    const result = (await (await request).json())?.pubkey
    if (result) {
      return result
    } else {
      throw PUBLIC_KEY_NOT_PUBLISHED_ERROR
    }
  }
}

// can only validate proofs with wallet addresses (public key hashes) that have:
// - at least one transaction on the blockchain
// - their public key published to the blockchain
export async function validateLink(proof: LinkProof): Promise<LinkProof | null> {
  const account = AccountID.parse(proof.account)
  const msg = char2Bytes(proof.message)

  const verifier = new RemoteSigner(account.address, FAKE_API_ENDPOINT)
  verifier.publicKey = publicKeyFinder(account.address)

  try {
    const is_sig_valid: boolean = await verifier.verify(msg, proof.signature)

    return is_sig_valid ? proof : null
  } catch (ignored) {
    return null
  }
}

const Handler: BlockchainHandler = {
  namespace,
  validateLink,
}

export default Handler