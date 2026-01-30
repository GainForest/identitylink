import {
  type Address,
  type Hex,
  hashTypedData,
  recoverAddress,
} from 'viem'
import {
  createAttestationDomain,
  ATTESTATION_TYPES,
  storageFormatToMessage,
  type StoredAttestation,
  type SignatureType,
} from './attestation'

const ERC1271_MAGIC_VALUE = '0x1626ba7e' as const

export interface VerificationResult {
  valid: boolean
  signerType: SignatureType
  recoveredAddress?: Address
  error?: string
}

type AnyPublicClient = {
  getBytecode: (args: { address: Address }) => Promise<Hex | undefined>
  readContract: (args: unknown) => Promise<unknown>
}

/**
 * Verify an attestation signature.
 * 
 * Supports both EOA (ECDSA) and smart wallet (ERC-1271) signatures.
 */
export async function verifyAttestation(
  client: AnyPublicClient,
  attestation: StoredAttestation
): Promise<VerificationResult> {
  const message = storageFormatToMessage(attestation.message)
  const expectedAddress = attestation.address as Address
  const signature = attestation.signature as Hex
  const signatureType = attestation.signatureType

  // Compute the EIP-712 hash
  const hash = hashTypedData({
    domain: createAttestationDomain(),
    types: ATTESTATION_TYPES,
    primaryType: 'Attestation',
    message: {
      did: message.did,
      evmAddress: message.evmAddress,
      chainId: message.chainId,
      timestamp: message.timestamp,
      nonce: message.nonce,
    },
  })

  // Route to appropriate verification method
  if (signatureType === 'erc1271') {
    return verifyERC1271(client, hash, signature, expectedAddress)
  }

  // Default to EOA verification
  return verifyEOA(hash, signature, expectedAddress)
}

/**
 * Verify an EOA signature using ECDSA recovery.
 */
async function verifyEOA(
  hash: Hex,
  signature: Hex,
  expectedAddress: Address
): Promise<VerificationResult> {
  try {
    const recoveredAddress = await recoverAddress({
      hash,
      signature,
    })

    const valid = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()

    return {
      valid,
      signerType: 'eoa',
      recoveredAddress,
      error: valid ? undefined : 'Recovered address does not match expected address',
    }
  } catch (err) {
    return {
      valid: false,
      signerType: 'eoa',
      error: `Signature recovery failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    }
  }
}

/**
 * Verify a smart wallet signature using ERC-1271.
 * 
 * Calls isValidSignature(bytes32 hash, bytes signature) on the contract
 * and checks for the magic value 0x1626ba7e.
 */
async function verifyERC1271(
  client: AnyPublicClient,
  hash: Hex,
  signature: Hex,
  contractAddress: Address
): Promise<VerificationResult> {
  try {
    // First check if there's code at the address
    const bytecode = await client.getBytecode({ address: contractAddress })
    
    if (!bytecode || bytecode === '0x') {
      // No contract at address - might be undeployed smart wallet
      // Fall back to EOA verification
      return verifyEOA(hash, signature, contractAddress)
    }

    // Call isValidSignature on the contract
    const result = await client.readContract({
      address: contractAddress,
      abi: [{
        name: 'isValidSignature',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'hash', type: 'bytes32' },
          { name: 'signature', type: 'bytes' },
        ],
        outputs: [{ name: '', type: 'bytes4' }],
      }],
      functionName: 'isValidSignature',
      args: [hash, signature],
    })

    const valid = result === ERC1271_MAGIC_VALUE

    return {
      valid,
      signerType: 'erc1271',
      error: valid ? undefined : `Contract returned ${result}, expected ${ERC1271_MAGIC_VALUE}`,
    }
  } catch (err) {
    // Contract might not implement ERC-1271, try EOA as fallback
    console.warn('ERC-1271 verification failed, trying EOA:', err)
    return verifyEOA(hash, signature, contractAddress)
  }
}

/**
 * Batch verify multiple attestations.
 */
export async function verifyAttestations(
  client: AnyPublicClient,
  attestations: StoredAttestation[]
): Promise<Map<string, VerificationResult>> {
  const results = new Map<string, VerificationResult>()

  await Promise.all(
    attestations.map(async (attestation) => {
      const key = `${attestation.address}-${attestation.chainId}`
      const result = await verifyAttestation(client, attestation)
      results.set(key, result)
    })
  )

  return results
}
