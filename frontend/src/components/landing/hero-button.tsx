"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface HeroButtonProps {
  href: string
  children: React.ReactNode
  variant?: "A" | "B" | "C"
  className?: string
}

export function HeroButton({ 
  href, 
  children, 
  variant = "C",
  className 
}: HeroButtonProps) {
  const buttonId = React.useId()

  const colorSchemes = {
    A: {
      lineColor: "#555555",
      backColor: "#ffecf6",
    },
    B: {
      lineColor: "#1b1919",
      backColor: "#e9ecff",
    },
    C: {
      lineColor: "#00135c",
      backColor: "#defffa",
    },
  }

  const colors = colorSchemes[variant]

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .hero-button-${buttonId} {
            position: relative;
            z-index: 0;
            width: 240px;
            height: 56px;
            text-decoration: none;
            font-size: 14px;
            font-weight: bold;
            color: ${colors.lineColor};
            letter-spacing: 2px;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          .hero-button-text-${buttonId} {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            position: relative;
            z-index: 1;
          }
          .hero-button-${buttonId}::before,
          .hero-button-${buttonId}::after,
          .hero-button-text-${buttonId}::before,
          .hero-button-text-${buttonId}::after {
            content: "";
            position: absolute;
            height: 3px;
            border-radius: 2px;
            background: ${colors.lineColor};
            transition: all 0.5s ease;
          }
          .hero-button-${buttonId}::before {
            top: 0;
            left: 54px;
            width: calc(100% - 56px * 2 - 16px);
          }
          .hero-button-${buttonId}::after {
            top: 0;
            right: 54px;
            width: 8px;
          }
          .hero-button-text-${buttonId}::before {
            bottom: 0;
            right: 54px;
            width: calc(100% - 56px * 2 - 16px);
          }
          .hero-button-text-${buttonId}::after {
            bottom: 0;
            left: 54px;
            width: 8px;
          }
          .hero-button-line-${buttonId} {
            position: absolute;
            top: 0;
            width: 56px;
            height: 100%;
            overflow: hidden;
          }
          .hero-button-line-${buttonId}::before {
            content: "";
            position: absolute;
            top: 0;
            width: 150%;
            height: 100%;
            box-sizing: border-box;
            border-radius: 300px;
            border: solid 3px ${colors.lineColor};
          }
          .hero-button-line-${buttonId}:nth-child(1),
          .hero-button-line-${buttonId}:nth-child(1)::before {
            left: 0;
          }
          .hero-button-line-${buttonId}:nth-child(2),
          .hero-button-line-${buttonId}:nth-child(2)::before {
            right: 0;
          }
          .hero-button-${buttonId}:hover {
            letter-spacing: 6px;
          }
          .hero-button-${buttonId}:hover::before,
          .hero-button-${buttonId}:hover .hero-button-text-${buttonId}::before {
            width: 8px;
          }
          .hero-button-${buttonId}:hover::after,
          .hero-button-${buttonId}:hover .hero-button-text-${buttonId}::after {
            width: calc(100% - 56px * 2 - 16px);
          }
          .hero-button-drow1-${buttonId},
          .hero-button-drow2-${buttonId} {
            position: absolute;
            z-index: -1;
            border-radius: 16px;
            transform-origin: 16px 16px;
          }
          .hero-button-drow1-${buttonId} {
            top: -16px;
            left: 40px;
            width: 32px;
            height: 0;
            transform: rotate(30deg);
          }
          .hero-button-drow2-${buttonId} {
            top: 44px;
            left: 77px;
            width: 32px;
            height: 0;
            transform: rotate(-127deg);
          }
          .hero-button-drow1-${buttonId}::before,
          .hero-button-drow1-${buttonId}::after,
          .hero-button-drow2-${buttonId}::before,
          .hero-button-drow2-${buttonId}::after {
            content: "";
            position: absolute;
          }
          .hero-button-drow1-${buttonId}::before {
            bottom: 0;
            left: 0;
            width: 0;
            height: 32px;
            border-radius: 16px;
            transform-origin: 16px 16px;
            transform: rotate(-60deg);
          }
          .hero-button-drow1-${buttonId}::after {
            top: -10px;
            left: 45px;
            width: 0;
            height: 32px;
            border-radius: 16px;
            transform-origin: 16px 16px;
            transform: rotate(69deg);
          }
          .hero-button-drow2-${buttonId}::before {
            bottom: 0;
            left: 0;
            width: 0;
            height: 32px;
            border-radius: 16px;
            transform-origin: 16px 16px;
            transform: rotate(-146deg);
          }
          .hero-button-drow2-${buttonId}::after {
            bottom: 26px;
            left: -40px;
            width: 0;
            height: 32px;
            border-radius: 16px;
            transform-origin: 16px 16px;
            transform: rotate(-262deg);
          }
          .hero-button-drow1-${buttonId},
          .hero-button-drow1-${buttonId}::before,
          .hero-button-drow1-${buttonId}::after,
          .hero-button-drow2-${buttonId},
          .hero-button-drow2-${buttonId}::before,
          .hero-button-drow2-${buttonId}::after {
            background: ${colors.backColor};
          }
          .hero-button-${buttonId}:hover .hero-button-drow1-${buttonId} {
            animation: drow1-${buttonId} ease-in 0.06s;
            animation-fill-mode: forwards;
          }
          .hero-button-${buttonId}:hover .hero-button-drow1-${buttonId}::before {
            animation: drow2-${buttonId} linear 0.08s 0.06s;
            animation-fill-mode: forwards;
          }
          .hero-button-${buttonId}:hover .hero-button-drow1-${buttonId}::after {
            animation: drow3-${buttonId} linear 0.03s 0.14s;
            animation-fill-mode: forwards;
          }
          .hero-button-${buttonId}:hover .hero-button-drow2-${buttonId} {
            animation: drow4-${buttonId} linear 0.06s 0.2s;
            animation-fill-mode: forwards;
          }
          .hero-button-${buttonId}:hover .hero-button-drow2-${buttonId}::before {
            animation: drow3-${buttonId} linear 0.03s 0.26s;
            animation-fill-mode: forwards;
          }
          .hero-button-${buttonId}:hover .hero-button-drow2-${buttonId}::after {
            animation: drow5-${buttonId} linear 0.06s 0.32s;
            animation-fill-mode: forwards;
          }
          @keyframes drow1-${buttonId} {
            0% {
              height: 0;
            }
            100% {
              height: 100px;
            }
          }
          @keyframes drow2-${buttonId} {
            0% {
              width: 0;
              opacity: 0;
            }
            10% {
              opacity: 0;
            }
            11% {
              opacity: 1;
            }
            100% {
              width: 120px;
            }
          }
          @keyframes drow3-${buttonId} {
            0% {
              width: 0;
            }
            100% {
              width: 80px;
            }
          }
          @keyframes drow4-${buttonId} {
            0% {
              height: 0;
            }
            100% {
              height: 120px;
            }
          }
          @keyframes drow5-${buttonId} {
            0% {
              width: 0;
            }
            100% {
              width: 124px;
            }
          }
        `
      }} />
      <Link
        href={href}
        className={cn(`hero-button-${buttonId}`, className)}
      >
        <div className={`hero-button-line-${buttonId}`} />
        <div className={`hero-button-line-${buttonId}`} />
        <span className={`hero-button-text-${buttonId}`}>{children}</span>
        <div className={`hero-button-drow1-${buttonId}`} />
        <div className={`hero-button-drow2-${buttonId}`} />
      </Link>
    </>
  )
}
