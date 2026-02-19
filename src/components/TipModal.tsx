'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt, useSwitchChain, useWriteContract, useConnect } from 'wagmi'
import { parseEther, parseUnits, formatUnits, type Address, erc20Abi } from 'viem'
import { mainnet, base, optimism, arbitrum } from 'wagmi/chains'
import { X, CheckCircle, ExternalLink } from 'lucide-react'
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
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative glass-panel rounded-2xl p-6 border border-border/50 shadow-lg max-w-sm w-full mx-4 animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="pb-4 border-b border-border mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">&#9749;</span>
              <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground">
                Buy {recipientName || 'them'} a coffee
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="size-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-5">
          {txStatus === 'success' ? (
            // Success state
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-create-accent" />
              </div>
              <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-1">Thanks for the coffee!</h3>
              <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground">Your tip has been sent successfully.</p>
              {txHash && (
                <a
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-xs text-create-accent hover:underline font-[family-name:var(--font-outfit)]"
                >
                  View transaction
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ) : (
            <>
              {/* Amount selection */}
              <div>
                <label className="font-[family-name:var(--font-outfit)] text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Amount
                </label>
                <div className="flex gap-2 mt-2">
                  {AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedAmount(amount)}
                      disabled={isPending}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all font-[family-name:var(--font-outfit)] ${
                        selectedAmount === amount
                          ? 'bg-create-accent text-create-accent-foreground ring-2 ring-create-accent/20'
                          : 'bg-muted text-muted-foreground hover:bg-secondary'
                      } disabled:opacity-50`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Token selection */}
              <div>
                <label className="font-[family-name:var(--font-outfit)] text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pay with
                </label>
                <div className="flex gap-2 mt-2">
                  {TOKEN_LIST.map((token) => (
                    <button
                      key={token}
                      onClick={() => setSelectedToken(token)}
                      disabled={isPending}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all font-[family-name:var(--font-outfit)] ${
                        selectedToken === token
                          ? 'bg-foreground text-background'
                          : 'bg-muted text-muted-foreground hover:bg-secondary'
                      } disabled:opacity-50`}
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chain selection */}
              <div>
                <label className="font-[family-name:var(--font-outfit)] text-xs font-medium text-muted-foreground uppercase tracking-wide">
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
                          : 'bg-muted hover:bg-secondary'
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
                      <span className="text-muted-foreground font-medium font-[family-name:var(--font-outfit)]">
                        {CHAIN_NAMES[c.id as SupportedChainId]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-[family-name:var(--font-outfit)] text-muted-foreground">You&apos;ll send</span>
                  <span className="font-[family-name:var(--font-outfit)] font-medium text-foreground">
                    {isPriceLoading ? '...' : `${getDisplayAmount()} ${selectedToken}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-[family-name:var(--font-outfit)] text-muted-foreground">Your balance</span>
                  <span className={`font-[family-name:var(--font-outfit)] font-medium ${hasEnoughBalance() ? 'text-foreground' : 'text-red-500'}`}>
                    {getCurrentBalance()} {selectedToken}
                  </span>
                </div>
              </div>

              {/* Error message */}
              {errorMessage && (
                <div className="font-[family-name:var(--font-outfit)] text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
                  {errorMessage}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {txStatus !== 'success' && (
          <div className="mt-5">
            {!isConnected ? (
              <button
                onClick={() => {
                  const injected = connectors.find(c => c.id === 'injected')
                  if (injected) connect({ connector: injected })
                }}
                disabled={isConnectPending}
                className="w-full py-3 rounded-lg font-[family-name:var(--font-outfit)] font-semibold text-sm transition-all
                           bg-create-accent text-create-accent-foreground hover:bg-create-accent/90 shadow-sm
                           disabled:opacity-50"
              >
                {isConnectPending ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={isPending || !hasEnoughBalance() || isPriceLoading}
                className={`w-full py-3 rounded-lg font-[family-name:var(--font-outfit)] font-semibold text-sm transition-all ${
                  isPending
                    ? 'bg-muted text-muted-foreground'
                    : hasEnoughBalance()
                      ? 'bg-create-accent text-create-accent-foreground hover:bg-create-accent/90 shadow-sm'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
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
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted
                 border border-border hover:bg-secondary
                 transition-all group"
    >
      <span className="text-xs">&#9749;</span>
      <span className="font-[family-name:var(--font-outfit)] text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
        Tip
      </span>
    </button>
  )
}
