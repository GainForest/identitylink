/**
 * SVG icons for supported EVM chains.
 * Each icon uses currentColor so it can be styled with text color classes.
 */

interface ChainIconProps {
  className?: string
}

export function EthereumIcon({ className = 'w-4 h-4' }: ChainIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 15 15" 
      fill="currentColor"
      className={className}
    >
      <g clipPath="url(#eth-clip)">
        <path d="M7.49997 11.0754L3.02246 8.43961L7.49997 14.7151L11.9775 8.43961L7.49997 11.0754Z" />
        <path d="M7.5 0.177887L11.9774 7.59031L7.5 10.2334L3.02246 7.59065L7.5 0.177887Z" />
      </g>
      <defs>
        <clipPath id="eth-clip">
          <rect width="15" height="14.5385" fill="white" transform="translate(0 0.17691)" />
        </clipPath>
      </defs>
    </svg>
  )
}

export function BaseIcon({ className = 'w-4 h-4' }: ChainIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 15 15" 
      fill="currentColor"
      className={className}
    >
      <path d="M3 3.711C3 3.46747 3 3.3457 3.04589 3.25203C3.08982 3.16234 3.16234 3.08982 3.25203 3.04589C3.3457 3 3.46747 3 3.711 3H11.289C11.5325 3 11.6543 3 11.748 3.04589C11.8376 3.08982 11.9102 3.16234 11.9541 3.25203C12 3.3457 12 3.46747 12 3.711V11.289C12 11.5325 12 11.6543 11.9541 11.748C11.9102 11.8376 11.8376 11.9102 11.748 11.9541C11.6543 12 11.5325 12 11.289 12H3.711C3.46747 12 3.3457 12 3.25203 11.9541C3.16234 11.9102 3.08982 11.8376 3.04589 11.748C3 11.6543 3 11.5325 3 11.289V3.711Z" />
    </svg>
  )
}

export function OptimismIcon({ className = 'w-4 h-4' }: ChainIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 15 15" 
      fill="currentColor"
      className={className}
    >
      <path d="M7.50001 0C3.35824 0 0 3.35824 0 7.5C0 11.6418 3.35824 15 7.50001 15C11.6418 15 15 11.6418 15 7.5C15 3.35824 11.6418 0 7.50001 0ZM7.50001 11.3187V14.1209C4.61757 14.1209 2.28023 11.7835 2.28023 8.90111C2.28023 6.01867 4.61757 3.68134 7.50001 3.68134V0.87912C10.3824 0.87912 12.7198 3.21649 12.7198 6.09889C12.7198 8.98132 10.3824 11.3187 7.50001 11.3187ZM10.0824 7.47581V7.52419C8.94394 8.09122 8.09119 8.94394 7.52419 10.0824H7.47582C6.90878 8.94394 6.05603 8.09122 4.91757 7.52419V7.47581C6.05603 6.90877 6.90878 6.05606 7.47582 4.9176H7.52419C8.09119 6.05606 8.94394 6.90877 10.0824 7.47581Z" />
    </svg>
  )
}

export function ArbitrumIcon({ className = 'w-4 h-4' }: ChainIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 15 15" 
      fill="currentColor"
      className={className}
    >
      <path d="M7.48049 0.931121C7.4446 0.931121 7.4115 0.9404 7.3784 0.958601L2.00801 4.15774C1.94495 4.1945 1.90592 4.26231 1.90906 4.33583L1.92997 10.7002C1.92997 10.7741 1.96899 10.8415 2.03206 10.8783L7.42056 14.0403C7.45052 14.0589 7.48641 14.0678 7.52265 14.0678C7.55889 14.0678 7.59164 14.0585 7.62474 14.0403L12.9948 10.8415C13.0578 10.8048 13.0969 10.737 13.0937 10.6635L13.0728 4.29907C13.0728 4.2252 13.0338 4.15774 12.9707 4.12099L7.57944 0.955746C7.54948 0.9404 7.51359 0.931121 7.48049 0.931121ZM7.47735 0C7.66934 0 7.86132 0.0492505 8.0324 0.150607L13.4209 3.31263C13.7659 3.5157 13.9791 3.89044 13.9791 4.29622L14 10.6606C14 11.0664 13.7899 11.4411 13.4481 11.647L8.0777 14.8462C7.90662 14.9475 7.71463 15 7.52265 15C7.33066 15 7.13868 14.9508 6.9676 14.8494L1.57909 11.6874C1.23415 11.4847 1.02091 11.1096 1.02091 10.7041L1 4.33976C1 3.93398 1.2101 3.55924 1.55192 3.35332L6.9223 0.153819C7.09338 0.0524625 7.28537 0 7.47735 0Z" />
      <path d="M6.3885 3.46931H7.17456C7.23449 3.46931 7.28571 3.50607 7.30662 3.5646L9.83868 10.6724C9.85679 10.7184 9.82056 10.7677 9.77282 10.7677H8.98676C8.92683 10.7677 8.87561 10.7309 8.8547 10.6724L6.32265 3.5646C6.30453 3.51856 6.34077 3.46931 6.3885 3.46931ZM7.76551 3.46931H8.55157C8.6115 3.46931 8.66272 3.50607 8.68362 3.5646L11.2129 10.6695C11.231 10.7156 11.1948 10.7648 11.147 10.7648H10.361C10.301 10.7648 10.2498 10.7281 10.2289 10.6695L7.69965 3.5646C7.68153 3.51856 7.71463 3.46931 7.76551 3.46931ZM6.7453 6.2227C6.7662 6.1581 6.85645 6.1581 6.87735 6.2227L7.28537 7.37188C7.29721 7.40257 7.29721 7.43933 7.28537 7.47038L6.1453 10.6695C6.12439 10.7248 6.07317 10.7648 6.01324 10.7648H5.22718C5.17909 10.7648 5.14321 10.7156 5.16132 10.6695L6.7453 6.2227ZM3.78711 10.6695L6.05819 4.28979C6.07909 4.2252 6.16934 4.2252 6.19024 4.28979L6.59826 5.43897C6.6101 5.46966 6.6101 5.50642 6.59826 5.53747L4.77108 10.6695C4.75017 10.7248 4.69895 10.7648 4.63902 10.7648H3.85296C3.80209 10.768 3.76899 10.7156 3.78711 10.6695Z" />
    </svg>
  )
}

export function CeloIcon({ className = 'w-4 h-4' }: ChainIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 15 15" 
      fill="currentColor"
      className={className}
    >
      <path d="M14 1H1V14H14V9.46188H11.8413C11.0979 11.1183 9.42454 12.2689 7.51018 12.2689C4.86945 12.2689 2.73107 10.1102 2.73107 7.48982C2.72768 4.86945 4.86945 2.73107 7.51018 2.73107C9.46188 2.73107 11.1352 3.91906 11.8786 5.61279H14V1Z" />
    </svg>
  )
}

export function PolygonIcon({ className = 'w-4 h-4' }: ChainIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      className={className}
    >
      <path d="M8.98519 8.38604L6.73312 7.08251L-0.0233994 10.9928V18.8129L6.73312 22.7232L13.49 18.8129V6.64791L17.2434 4.47572L20.9973 6.64791V10.9928L17.2434 13.165L14.9913 11.8619V15.3372L17.2434 16.6407L24 12.7304V4.91032L17.2434 1L10.4869 4.91032V17.0753L6.73312 19.2475L2.97959 17.0753V12.7304L6.73312 10.5582L8.98519 11.8614V8.38604Z" />
    </svg>
  )
}

// Generic chain icon for unknown chains
export function GenericChainIcon({ className = 'w-4 h-4' }: ChainIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  )
}

// Map chain IDs to icon components
import { mainnet, base, optimism, arbitrum } from 'wagmi/chains'

export const CHAIN_ICONS: Record<number, React.FC<ChainIconProps>> = {
  [mainnet.id]: EthereumIcon,
  [base.id]: BaseIcon,
  [optimism.id]: OptimismIcon,
  [arbitrum.id]: ArbitrumIcon,
  // Add more chains as needed
  // [celo.id]: CeloIcon,
  // [polygon.id]: PolygonIcon,
}

export function ChainIcon({ chainId, className }: { chainId: number; className?: string }) {
  const Icon = CHAIN_ICONS[chainId] || GenericChainIcon
  return <Icon className={className} />
}
