'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt, useSwitchChain, useWriteContract, useConnect } from 'wagmi'
import { parseEther, parseUnits, formatUnits, type Address, erc20Abi } from 'viem'
import { mainnet, base, optimism, arbitrum } from 'wagmi/chains'
import { ChainIcon } from './ChainIcons'
import { CHAIN_NAMES, CHAIN_COLORS, type SupportedChainId } from '@/lib/chains'

// Token configurations per chain
const TOKEN_ADDRESSES: Record<string, Record<number, Address>> = {
  USDC: {
    [mainnet.id]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    [optimism.id]: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    [arbitrum.id]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  },
  USDT: {
    [mainnet.id]: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    [base.id]: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    [optimism.id]: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    [arbitrum.id]: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  },
}

type TokenType = 'ETH' | 'USDC' | 'USDT'
const TOKEN_LIST: TokenType[] = ['ETH', 'USDC', 'USDT']
type AmountUSD = 1 | 5 | 10

const AMOUNTS: AmountUSD[] = [1, 5, 10]
const CHAINS = [mainnet, base, optimism, arbitrum]



interface TipModalProps {
  isOpen: boolean
  onClose: () => void
  recipientName?: string
  recipientAddress: string
}

export function TipModal({ isOpen, onClose, recipientName, recipientAddress }: TipModalProps) {
  const { address, isConnected, chain } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { connect, connectors, isPending: isConnectPending } = useConnect()
  
  const [selectedAmount, setSelectedAmount] = useState<AmountUSD>(5)
  const [selectedToken, setSelectedToken] = useState<TokenType>('ETH')
  const [selectedChainId, setSelectedChainId] = useState<number>(base.id)
  const [ethPrice, setEthPrice] = useState<number | null>(null)
  const [isPriceLoading, setIsPriceLoading] = useState(true)
  const [txStatus, setTxStatus] = useState<'idle' | 'switching' | 'sending' | 'confirming' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch ETH price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setIsPriceLoading(true)
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
        const data = await res.json()
        setEthPrice(data.ethereum.usd)
      } catch {
        // Fallback price
        setEthPrice(3500)
      } finally {
        setIsPriceLoading(false)
      }
    }
    if (isOpen) {
      fetchPrice()
      // Refresh every 30 seconds
      const interval = setInterval(fetchPrice, 30000)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  // Get ETH balance
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address,
    chainId: selectedChainId,
  })

  // Get token balance for USDC/USDT
  const tokenAddress = selectedToken !== 'ETH' 
    ? TOKEN_ADDRESSES[selectedToken]?.[selectedChainId]
    : undefined

  const { data: tokenBalance, refetch: refetchTokenBalance } = useBalance({
    address,
    token: tokenAddress,
    chainId: selectedChainId,
  })

  // Send ETH transaction
  const { 
    sendTransactionAsync, 
    data: ethTxHash,
    isPending: isEthPending,
  } = useSendTransaction()

  // Send ERC20 transaction
  const {
    writeContractAsync,
    data: tokenTxHash,
    isPending: isTokenPending,
  } = useWriteContract()

  // Wait for transaction confirmation
  const txHash = ethTxHash || tokenTxHash
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Update status based on transaction state
  useEffect(() => {
    if (isSuccess) {
      setTxStatus('success')
      refetchEthBalance()
      refetchTokenBalance()
    }
  }, [isSuccess, refetchEthBalance, refetchTokenBalance])

  // Calculate amount in token
  const getTokenAmount = useCallback((): bigint => {
    if (selectedToken === 'ETH') {
      if (!ethPrice) return BigInt(0)
      const ethAmount = selectedAmount / ethPrice
      return parseEther(ethAmount.toFixed(18))
    } else {
      // USDC/USDT are 6 decimals and 1:1 with USD
      return parseUnits(selectedAmount.toString(), 6)
    }
  }, [selectedToken, selectedAmount, ethPrice])

  // Format display amount
  const getDisplayAmount = useCallback((): string => {
    if (selectedToken === 'ETH') {
      if (!ethPrice) return '...'
      const ethAmount = selectedAmount / ethPrice
      return ethAmount.toFixed(6)
    } else {
      return selectedAmount.toFixed(2)
    }
  }, [selectedToken, selectedAmount, ethPrice])

  // Get current balance
  const getCurrentBalance = useCallback((): string => {
    const balance = selectedToken === 'ETH' ? ethBalance : tokenBalance
    if (!balance) return '0'
    return parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(
      selectedToken === 'ETH' ? 6 : 2
    )
  }, [selectedToken, ethBalance, tokenBalance])

  // Check if user has enough balance
  const hasEnoughBalance = useCallback((): boolean => {
    const balance = selectedToken === 'ETH' ? ethBalance : tokenBalance
    if (!balance) return false
    return balance.value >= getTokenAmount()
  }, [selectedToken, ethBalance, tokenBalance, getTokenAmount])

  // Handle send
  const handleSend = async () => {
    if (!isConnected || !address) return
    
    setErrorMessage(null)
    
    try {
      // Switch chain if needed
      if (chain?.id !== selectedChainId) {
        setTxStatus('switching')
        await switchChainAsync({ chainId: selectedChainId })
      }

      setTxStatus('sending')
      
      if (selectedToken === 'ETH') {
        await sendTransactionAsync({
          to: recipientAddress as Address,
          value: getTokenAmount(),
        })
      } else {
        const tokenAddr = TOKEN_ADDRESSES[selectedToken]?.[selectedChainId]
        if (!tokenAddr) {
          throw new Error('Token not available on this chain')
        }
        
        await writeContractAsync({
          address: tokenAddr,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [recipientAddress as Address, getTokenAmount()],
        })
      }
      
      setTxStatus('confirming')
    } catch (err) {
      setTxStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Transaction failed')
    }
  }

  // Reset on close
  const handleClose = () => {
    setTxStatus('idle')
    setErrorMessage(null)
    onClose()
  }

  if (!isOpen) return null

  const isPending = isEthPending || isTokenPending || isConfirming || txStatus === 'switching'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl dark:shadow-zinc-900/50 max-w-sm w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">&#9749;</span>
              <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
                Buy {recipientName || 'them'} a coffee
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {txStatus === 'success' ? (
            // Success state
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 mb-1">Thanks for the coffee!</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Your tip has been sent successfully.</p>
              {txHash && (
                <a
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View transaction
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}
            </div>
          ) : (
            <>
              {/* Amount selection */}
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Amount
                </label>
                <div className="flex gap-2 mt-2">
                  {AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedAmount(amount)}
                      disabled={isPending}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        selectedAmount === amount
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      } disabled:opacity-50`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Token selection */}
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Pay with
                </label>
                <div className="flex gap-2 mt-2">
                  {TOKEN_LIST.map((token) => (
                    <button
                      key={token}
                      onClick={() => setSelectedToken(token)}
                      disabled={isPending}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        selectedToken === token
                          ? 'bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      } disabled:opacity-50`}
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chain selection */}
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Network
                </label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {CHAINS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedChainId(c.id)}
                      disabled={isPending}
                      className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs transition-all ${
                        selectedChainId === c.id
                          ? 'ring-2 ring-offset-1'
                          : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      } disabled:opacity-50`}
                      style={{
                        ...(selectedChainId === c.id && {
                          backgroundColor: `${CHAIN_COLORS[c.id as SupportedChainId]}15`,
                          '--tw-ring-color': CHAIN_COLORS[c.id as SupportedChainId],
                        }),
                      }}
                    >
                      <span style={{ color: CHAIN_COLORS[c.id as SupportedChainId] }}>
                        <ChainIcon chainId={c.id} className="w-5 h-5" />
                      </span>
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                        {CHAIN_NAMES[c.id as SupportedChainId]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">You&apos;ll send</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {isPriceLoading ? '...' : `${getDisplayAmount()} ${selectedToken}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Your balance</span>
                  <span className={`font-medium ${hasEnoughBalance() ? 'text-zinc-800 dark:text-zinc-200' : 'text-red-500 dark:text-red-400'}`}>
                    {getCurrentBalance()} {selectedToken}
                  </span>
                </div>
              </div>

              {/* Error message */}
              {errorMessage && (
                <div className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
                  {errorMessage}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {txStatus !== 'success' && (
          <div className="px-6 pb-6">
            {!isConnected ? (
              <button
                onClick={() => {
                  const injected = connectors.find(c => c.id === 'injected')
                  if (injected) connect({ connector: injected })
                }}
                disabled={isConnectPending}
                className="w-full py-3 rounded-xl font-medium text-sm transition-all
                           bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]
                           disabled:opacity-50"
              >
                {isConnectPending ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={isPending || !hasEnoughBalance() || isPriceLoading}
                className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${
                  isPending
                    ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                    : hasEnoughBalance()
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                }`}
              >
                {txStatus === 'switching' && 'Switching network...'}
                {txStatus === 'sending' && 'Confirm in wallet...'}
                {txStatus === 'confirming' && 'Confirming...'}
                {txStatus === 'idle' && (hasEnoughBalance() ? `Send $${selectedAmount} tip` : 'Insufficient balance')}
                {txStatus === 'error' && 'Try again'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Coffee button to trigger the modal
export function CoffeeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Buy them a coffee"
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30
                 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/30 
                 hover:border-amber-300 dark:hover:border-amber-700/50 transition-all group"
    >
      <span className="text-xs">&#9749;</span>
      <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 group-hover:text-amber-800 dark:group-hover:text-amber-300">
        Tip
      </span>
    </button>
  )
}
