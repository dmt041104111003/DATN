"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ServiceCardProps {
  name: string
  description?: string
  price: number
  duration?: string
  product?: string
  className?: string
  onClick?: () => void
  disabled?: boolean
  buttonText?: string
  isActive?: boolean
}

export function ServiceCard({ 
  name, 
  description, 
  price, 
  duration,
  product,
  className,
  onClick,
  disabled = false,
  buttonText,
  isActive = false
}: ServiceCardProps) {
  const cardId = React.useId()
  
  const bannerText1 = isActive ? 'ACTIVE' : 'SUBSCRIBE'
  const bannerText2 = isActive ? 'ACTIVE' : 'JOIN US'
  
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .service-card-${cardId} {
            width: 100%;
            max-width: 100%;
            padding: 8px;
            background: #fff;
            border: 2px solid #000;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            cursor: ${disabled ? 'default' : 'pointer'};
            box-sizing: border-box;
          }
          @media (min-width: 640px) {
            .service-card-${cardId} {
              padding: 12px;
            }
          }
          .service-card-${cardId}:active {
            animation: shake-${cardId} 0.5s ease-in-out;
          }
          @keyframes shake-${cardId} {
            0% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-5px);
            }
            50% {
              transform: translateX(5px);
            }
            75% {
              transform: translateX(-5px);
            }
            100% {
              transform: translateX(0);
            }
          }
          .service-banner-${cardId} {
            position: absolute;
            top: 2px;
            right: -80px;
            background: ${isActive ? '#ef4444' : '#000'};
            color: #fff;
            padding: 18px;
            width: 360px;
            text-align: center;
            transform: rotate(45deg);
            font-weight: bold;
            font-size: 22px;
            letter-spacing: 2.5px;
            overflow: hidden;
            transition: background 0.5s ease;
          }
          @media (min-width: 640px) {
            .service-banner-${cardId} {
              padding: 20px;
              font-size: 24px;
            }
          }
          .service-banner-${cardId}:hover {
            background: ${isActive ? '#dc2626' : '#ef4444'};
          }
          .service-banner-text-${cardId} {
            display: inline-block;
            transition: opacity 0.5s ease, transform 0.5s ease;
            width: 100%;
            position: absolute;
            left: 13%;
            top: 50%;
            transform: translateY(-50%);
          }
          .service-banner-${cardId}:hover .service-banner-text-${cardId}:first-child {
            opacity: 0;
            transform: translateY(-100%);
          }
          .service-banner-${cardId}:hover .service-banner-text-${cardId}:last-child {
            opacity: 1;
            transform: translateY(-40%);
          }
          .service-banner-text-${cardId}:last-child {
            opacity: 0;
            transform: translateY(60%);
          }
          .service-title-${cardId} {
            font-size: 22px;
            font-weight: 700;
            color: #000;
            text-transform: uppercase;
            margin-bottom: 10px;
            display: block;
            border-bottom: 2px solid #000;
            width: 50%;
          }
          .service-subtitle-${cardId} {
            font-size: 16px;
            line-height: 1.4;
            color: #333;
            margin-bottom: 12px;
            padding-bottom: 8px;
            width: 100%;
            box-sizing: border-box;
          }
          .service-price-${cardId} {
            font-size: 32px;
            font-weight: 700;
            color: #000;
            margin-bottom: 10px;
          }
          .service-price-unit-${cardId} {
            font-size: 18px;
            font-weight: 500;
            color: #666;
            margin-left: 4px;
          }
          .service-info-${cardId} {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 12px;
          }
          .service-info-item-${cardId} {
            font-size: 14px;
            color: #333;
          }
          .service-button-${cardId} {
            border: 2px solid #000;
            background: #000;
            color: #fff;
            padding: 10px;
            font-size: 15px;
            font-weight: bold;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
            box-sizing: border-box;
            word-break: break-word;
            overflow-wrap: break-word;
          }
          @media (min-width: 640px) {
            .service-title-${cardId} {
              font-size: 32px;
              margin-bottom: 12px;
            }
            .service-subtitle-${cardId} {
              font-size: 20px;
              margin-bottom: 16px;
              padding-bottom: 10px;
            }
            .service-price-${cardId} {
              font-size: 48px;
              margin-bottom: 12px;
            }
            .service-price-unit-${cardId} {
              font-size: 24px;
            }
            .service-info-${cardId} {
              gap: 10px;
              margin-bottom: 16px;
            }
            .service-info-item-${cardId} {
              font-size: 18px;
            }
            .service-button-${cardId} {
              padding: 14px;
              font-size: 18px;
              border: 2px solid #000;
            }
          }
          .service-button-${cardId}:hover:not(:disabled) {
            background: #fff;
            color: #000;
            transform: translateY(-4px);
            box-shadow: 0 4px 0 #000;
          }
          .service-button-${cardId}:active:not(:disabled) {
            animation: shake-${cardId} 0.5s ease-in-out;
            transform: translateY(0);
            box-shadow: none;
          }
          .service-button-${cardId}:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: #666;
            border-color: #666;
          }
        `
      }} />
      <div 
        className={cn(`service-card-${cardId}`, className)}
        onClick={() => {
          if (!disabled && onClick) {
            onClick()
          }
        }}
      >
        <div className={`service-banner-${cardId}`}>
          <span className={`service-banner-text-${cardId}`}>{bannerText1}</span>
          <span className={`service-banner-text-${cardId}`}>{bannerText2}</span>
        </div>
        <span className={`service-title-${cardId}`}>{name}</span>
        <div className={`service-subtitle-${cardId}`}>
          <div className={`service-price-${cardId}`}>
            {price}
            <span className={`service-price-unit-${cardId}`}>ADA</span>
          </div>
          <div className={`service-info-${cardId}`}>
            {duration && (
              <div className={`service-info-item-${cardId}`}>Duration: {duration}</div>
            )}
            {product && (
              <div className={`service-info-item-${cardId}`}>Products: {product}</div>
            )}
          </div>
        </div>
        {buttonText && (
          <button
            type="button"
            className={`service-button-${cardId}`}
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
            disabled={disabled}
          >
            {buttonText}
          </button>
        )}
      </div>
    </>
  )
}
