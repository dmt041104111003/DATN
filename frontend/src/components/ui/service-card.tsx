"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { HeroButton } from "@/components/landing/hero-button"

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
      iconBg: 'hsl(var(--primary))',
      buttonBg: 'hsl(var(--primary))',
      buttonHover: 'hsl(var(--primary) / 0.9)',
      innerBg: 'hsl(var(--muted))',
      pricingBg: 'hsl(var(--muted))',
    },
    {
      iconBg: 'hsl(var(--primary))',
      buttonBg: 'hsl(var(--primary))',
      buttonHover: 'hsl(var(--primary) / 0.9)',
      innerBg: 'hsl(var(--muted))',
      pricingBg: 'hsl(var(--muted))',
    },
    {
      iconBg: 'hsl(var(--primary))',
      buttonBg: 'hsl(var(--primary))',
      buttonHover: 'hsl(var(--primary) / 0.9)',
      innerBg: 'hsl(var(--muted))',
      pricingBg: 'hsl(var(--muted))',
    }
  ]
  
  const colors = colorSchemes[variant]
  
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .service-card-wrapper-${cardId} {
            max-width: 100%;
            width: 100%;
            cursor: ${disabled ? 'default' : 'pointer'};
            transition: transform 0.3s ease;
          }
          .service-card-featured-${cardId} {
            transform: scale(1.05);
            z-index: 10;
          }
          @media (max-width: 768px) {
            .service-card-featured-${cardId} {
              transform: scale(1);
            }
          }
          .service-card-${cardId} strong {
            font-weight: 600;
            color: hsl(var(--foreground));
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
            color: hsl(var(--foreground));
          }
          .service-pricing-${cardId} small {
            color: hsl(var(--muted-foreground));
            font-size: 0.75em;
            margin-left: 0.25em;
          }
          .service-title-${cardId} {
            font-weight: 700;
            font-size: 1.25rem;
            color: hsl(var(--foreground));
            margin: 0;
          }
          .service-title-${cardId} + * {
            margin-top: 0.75rem;
          }
          .service-info-${cardId} {
            color: hsl(var(--muted-foreground));
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
            color: hsl(var(--primary-foreground));
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
          .hero-button-full-${cardId} {
            width: 100% !important;
          }
        `
      }} />
      <div 
        className={cn(
          `service-card-wrapper-${cardId}`,
          isFeatured && `service-card-featured-${cardId}`,
          className
        )}
        onClick={() => {
          if (!disabled && onClick) {
            onClick()
          }
        }}
      >
        <Card className="p-2.5">
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
            <div 
              className={`service-action-${cardId}`}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <HeroButton
                onClick={() => {
                  onClick?.()
                }}
                disabled={disabled}
                variant="A"
                className={`hero-button-full-${cardId}`}
              >
                {buttonText}
              </HeroButton>
            </div>
          )}
          </div>
        </Card>
      </div>
    </>
  )
}
