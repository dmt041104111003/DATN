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
  isFeatured?: boolean
  variant?: 0 | 1 | 2
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
  isActive = false,
  isFeatured = false,
  variant = 0
}: ServiceCardProps) {
  const cardId = React.useId()
  
  const colorSchemes = [
    {
      iconBg: '#7dd3fc',
      buttonBg: '#60a5fa',
      buttonHover: '#3b82f6',
      innerBg: '#e0f2fe',
      pricingBg: '#dbeafe',
    },
    {
      iconBg: '#60a5fa',
      buttonBg: '#3b82f6',
      buttonHover: '#2563eb',
      innerBg: '#dbeafe',
      pricingBg: '#bfdbfe',
    },
    {
      iconBg: '#3b82f6',
      buttonBg: '#2563eb',
      buttonHover: '#1d4ed8',
      innerBg: '#bfdbfe',
      pricingBg: '#93c5fd',
    }
  ]
  
  const colors = colorSchemes[variant]
  
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .service-card-${cardId} {
            border-radius: 16px;
            box-shadow: 0 30px 30px -25px rgba(0, 38, 255, 0.205);
            padding: 10px;
            background-color: #fff;
            color: #697e91;
            max-width: 100%;
            width: 100%;
            box-sizing: border-box;
            cursor: ${disabled ? 'default' : 'pointer'};
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .service-card-featured-${cardId} {
            transform: scale(1.05);
            box-shadow: 0 40px 40px -25px rgba(0, 38, 255, 0.3);
            z-index: 10;
          }
          @media (max-width: 768px) {
            .service-card-featured-${cardId} {
              transform: scale(1);
            }
          }
          .service-card-${cardId} strong {
            font-weight: 600;
            color: #425275;
          }
          .service-inner-${cardId} {
            align-items: flex-start;
            padding: 20px;
            padding-top: 40px;
            background-color: ${colors.innerBg};
            border-radius: 12px;
            position: relative;
            display: flex;
            flex-direction: column;
          }
          .service-pricing-${cardId} {
            position: absolute;
            top: 0;
            right: 0;
            background-color: ${colors.pricingBg};
            border-radius: 99em 0 0 99em;
            display: flex;
            align-items: center;
            padding: 0.625em 0.75em;
            font-size: 1.25rem;
            font-weight: 600;
            color: #425475;
          }
          .service-pricing-${cardId} small {
            color: #707a91;
            font-size: 0.75em;
            margin-left: 0.25em;
          }
          .service-title-${cardId} {
            font-weight: 700;
            font-size: 1.25rem;
            color: #425675;
            margin: 0;
          }
          .service-title-${cardId} + * {
            margin-top: 0.75rem;
          }
          .service-info-${cardId} {
            color: #697e91;
            margin: 0;
            font-weight: 500;
          }
          .service-info-${cardId} + * {
            margin-top: 1rem;
          }
          .service-features-${cardId} {
            display: flex;
            flex-direction: column;
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .service-features-${cardId} li {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
          }
          .service-features-${cardId} li + * {
            margin-top: 0.75rem;
          }
          .service-icon-${cardId} {
            background-color: ${colors.iconBg};
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            flex-shrink: 0;
          }
          .service-icon-${cardId} svg {
            width: 14px;
            height: 14px;
          }
          .service-features-${cardId} + * {
            margin-top: 1.25rem;
          }
          .service-action-${cardId} {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: end;
          }
          .service-button-${cardId} {
            background-color: ${colors.buttonBg};
            border-radius: 6px;
            color: #fff;
            font-weight: 600;
            font-size: 1.125rem;
            text-align: center;
            border: 0;
            outline: 0;
            width: 100%;
            padding: 0.625em 0.75em;
            text-decoration: none;
            cursor: ${disabled ? 'not-allowed' : 'pointer'};
            transition: background-color 0.3s ease;
            box-sizing: border-box;
            word-break: break-word;
            overflow-wrap: break-word;
          }
          .service-button-${cardId}:hover:not(:disabled),
          .service-button-${cardId}:focus:not(:disabled) {
            background-color: ${colors.buttonHover};
          }
          .service-button-${cardId}:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `
      }} />
      <div 
        className={cn(
          `service-card-${cardId}`,
          isFeatured && `service-card-featured-${cardId}`,
          className
        )}
        onClick={() => {
          if (!disabled && onClick) {
            onClick()
          }
        }}
      >
        <div className={`service-inner-${cardId}`}>
          <div className={`service-pricing-${cardId}`}>
            <span>
              {price} ₳
            </span>
          </div>
          <p className={`service-title-${cardId}`}>{name}</p>
          {description && (
            <p className={`service-info-${cardId}`}>{description}</p>
          )}
          {(duration || product) && (
            <ul className={`service-features-${cardId}`}>
              {duration && (
                <li>
                  <span className={`service-icon-${cardId}`}>
                    <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0h24v24H0z" fill="none"></path>
                      <path fill="currentColor" d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                    </svg>
                  </span>
                  <span>{duration}</span>
                </li>
              )}
              {product && (
                <li>
                  <span className={`service-icon-${cardId}`}>
                    <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0h24v24H0z" fill="none"></path>
                      <path fill="currentColor" d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                    </svg>
                  </span>
                  <span>{product}</span>
                </li>
              )}
            </ul>
          )}
          {buttonText && (
            <div className={`service-action-${cardId}`}>
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
            </div>
          )}
        </div>
      </div>
    </>
  )
}
