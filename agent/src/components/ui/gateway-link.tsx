"use client"

export function toGatewayUrl(ipfsUrl: string): string {
  if (ipfsUrl.startsWith('ipfs://')) {
    const cid = ipfsUrl.replace('ipfs://', '')
    return `https://gateway.pinata.cloud/ipfs/${cid}`
  }
  return ipfsUrl
}

interface GatewayLinkProps {
  url: string
  className?: string
  maxLength?: number
  truncate?: boolean
}

export function GatewayLink({ url, className = '', maxLength = 40, truncate = true }: GatewayLinkProps) {
  const gatewayUrl = toGatewayUrl(url)
  
  const truncateUrl = (url: string, maxLength: number): string => {
    if (url.length <= maxLength) return url
    return url.slice(0, maxLength) + '...'
  }

  const displayUrl = truncate ? truncateUrl(gatewayUrl, maxLength) : gatewayUrl

  return (
    <a
      href={gatewayUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-primary hover:underline truncate whitespace-nowrap text-sm font-mono ${className}`}
      title={gatewayUrl}
    >
      {displayUrl}
    </a>
  )
}
