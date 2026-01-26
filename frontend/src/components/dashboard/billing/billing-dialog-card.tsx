"use client"

import * as React from "react"
import { Service } from "@/types/subscription"
import { HeroButton } from "@/components/landing/hero-button"

interface BillingDialogCardProps {
  service: Service
  onSubscribe: () => void
  processing?: boolean
}

export function BillingDialogCard({ service, onSubscribe, processing }: BillingDialogCardProps) {
  const cardId = React.useId()
  
  const durationText = service.duration 
    ? `${service.duration} ${service.duration === 1 ? 'day' : 'days'}` 
    : 'N/A'
  
  const maxProductsText = service.maxProducts === null 
    ? 'Unlimited' 
    : `${service.maxProducts} products / day`

  const totalPrice = service.price

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .billing-container-${cardId} {
            display: grid;
            grid-template-columns: auto;
            gap: 0px;
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
            height: 100%;
          }

          .billing-container-${cardId} hr {
            height: 1px;
            background-color: #E5E7EB;
            border: none;
            margin: 0;
          }

          .billing-container-${cardId} .card {
            width: 100%;
            background: #FFFFFF;
            color: #1F2937;
            box-shadow: 0px 187px 75px rgba(0, 0, 0, 0.01), 0px 105px 63px rgba(0, 0, 0, 0.05), 0px 47px 47px rgba(0, 0, 0, 0.09), 0px 12px 26px rgba(0, 0, 0, 0.1), 0px 0px 0px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
          }

          .billing-container-${cardId} .title {
            width: 100%;
            height: 40px;
            position: relative;
            display: flex;
            align-items: center;
            padding-left: 20px;
            border-bottom: 1px solid #E5E7EB;
            font-weight: 700;
            font-size: 13px;
            color: #1F2937;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .billing-container-${cardId} .cart {
            border-radius: 19px 19px 0px 0px;
          }

          .billing-container-${cardId} .steps {
            display: flex;
            flex-direction: column;
            padding: 24px;
            flex: 1;
          }

          .billing-container-${cardId} .step {
            display: grid;
            gap: 10px;
          }

          .billing-container-${cardId} .step span {
            font-size: 14px;
            font-weight: 600;
            color: #1F2937;
            margin-bottom: 8px;
            display: block;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .billing-container-${cardId} .step p {
            font-size: 13px;
            font-weight: 500;
            color: #6B7280;
            margin: 0;
            line-height: 1.5;
          }

          .billing-container-${cardId} .promo form {
            display: grid;
            grid-template-columns: 1fr 80px;
            gap: 10px;
            padding: 0px;
          }

          .billing-container-${cardId} .input_field {
            width: auto;
            height: 40px;
            padding: 0 0 0 12px;
            border-radius: 5px;
            outline: none;
            border: 1px solid #E5E7EB;
            background-color: #FFFFFF;
            transition: all 0.3s cubic-bezier(0.15, 0.83, 0.66, 1);
            font-size: 12px;
            color: #1F2937;
          }

          .billing-container-${cardId} .input_field:focus {
            border: 1px solid #9CA3AF;
            box-shadow: 0px 0px 0px 2px rgba(156, 163, 175, 0.2);
            background-color: #FFFFFF;
          }

          .billing-container-${cardId} .promo form button {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            padding: 10px 18px;
            gap: 10px;
            width: 100%;
            height: 36px;
            background: rgba(16, 86, 82, 0.75);
            box-shadow: 0px 0.5px 0.5px #F3D2C9, 0px 1px 0.5px rgba(239, 239, 239, 0.5);
            border-radius: 5px;
            border: 0;
            font-style: normal;
            font-weight: 600;
            font-size: 12px;
            line-height: 15px;
            color: #000000;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .billing-container-${cardId} .promo form button:hover {
            background: rgba(16, 86, 82, 0.85);
          }

          .billing-container-${cardId} .payments .details {
            display: grid;
            grid-template-columns: 6fr 4fr;
            padding: 0px;
            gap: 2px;
          }


          .billing-container-${cardId} .payments .details span:nth-child(odd) {
            font-size: 13px;
            font-weight: 600;
            color: #6B7280;
            margin: auto auto auto 0;
          }

          .billing-container-${cardId} .payments .details span:nth-child(even) {
            font-size: 15px;
            font-weight: 600;
            color: #1F2937;
            margin: auto 0 auto auto;
            white-space: nowrap;
          }

          .billing-container-${cardId} .checkout {
            border-radius: 0px 0px 19px 19px;
          }

          .billing-container-${cardId} .footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 12px 12px 24px;
            background-color: hsl(var(--muted));
            flex-wrap: wrap;
            gap: 12px;
          }

          .billing-container-${cardId} .price {
            position: relative;
            font-size: 24px;
            color: hsl(var(--foreground));
            font-weight: 900;
          }

          .billing-container-${cardId} .checkout-btn-wrapper {
            display: flex;
            align-items: center;
            justify-content: flex-end;
          }

          .billing-container-${cardId} .checkout-btn-wrapper button,
          .billing-container-${cardId} .checkout-btn-wrapper a {
            width: 160px !important;
            height: 40px !important;
            font-size: 13px !important;
          }

          @media (max-width: 640px) {
            .billing-container-${cardId} {
              max-width: 100%;
            }

            .billing-container-${cardId} .title {
              font-size: 12px;
              padding-left: 16px;
              height: 36px;
            }

            .billing-container-${cardId} .steps {
              padding: 16px;
            }

            .billing-container-${cardId} .step span {
              font-size: 13px;
            }

            .billing-container-${cardId} .step p {
              font-size: 12px;
            }

            .billing-container-${cardId} .input_field {
              height: 36px;
              font-size: 11px;
            }

            .billing-container-${cardId} .promo form button {
              height: 36px;
              font-size: 12px;
            }

            .billing-container-${cardId} .payments .details {
              grid-template-columns: 1fr 1fr;
              gap: 8px 4px;
            }

            .billing-container-${cardId} .payments .details span:nth-child(odd) {
              font-size: 12px;
            }

            .billing-container-${cardId} .payments .details span:nth-child(even) {
              font-size: 14px;
              white-space: normal;
              text-align: right;
            }

            .billing-container-${cardId} .footer {
              padding: 12px 16px;
              flex-direction: column;
              align-items: stretch;
              gap: 12px;
            }

            .billing-container-${cardId} .price {
              font-size: 20px;
              text-align: center;
            }

            .billing-container-${cardId} .checkout-btn-wrapper {
              width: 100%;
              justify-content: stretch;
            }

            .billing-container-${cardId} .checkout-btn-wrapper button,
            .billing-container-${cardId} .checkout-btn-wrapper a {
              width: 100% !important;
              height: 42px !important;
              font-size: 14px !important;
            }
          }
        `
      }} />
      <div className={`billing-container-${cardId}`}>
        <div className="card cart">
          <label className="title">SUBSCRIPTION</label>
          <div className="steps">
            <div className="step">
              <div>
                <span>SERVICE PLAN</span>
                <p>{service.name}</p>
                {service.description && <p>{service.description}</p>}
              </div>
              <hr />
              <div>
                <span>DURATION</span>
                <p>{durationText}</p>
                <p>Max Products: {maxProductsText}</p>
              </div>
              <div className="payments">
                <span>PAYMENT</span>
                <div className="details">
                  <span>Plan Price:</span>
                  <span>{service.price} ₳</span>
                  <span>Duration:</span>
                  <span>{durationText}</span>
                  <span>Total:</span>
                  <span>{totalPrice} ₳</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card checkout">
          <div className="footer">
            <label className="price">{totalPrice} ₳</label>
            <div className="checkout-btn-wrapper">
              <HeroButton
                onClick={onSubscribe}
                disabled={processing}
                variant="A"
              >
                {processing ? 'Processing...' : 'Subscribe'}
              </HeroButton>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
