"use client"

import Image from 'next/image'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Is HSupply free to use?",
    answer: "HSupply offers a free tier for small businesses to trace their products. For larger operations, we have premium plans with additional features and higher traceability limits.",
  },
  {
    question: "How does origin traceability work?",
    answer: "Each product is registered on Cardano blockchain with its origin information, creating an immutable record of where it comes from, when it was produced, and its journey to consumers.",
  },
  {
    question: "How can consumers verify product authenticity?",
    answer: "Consumers simply scan the QR code on the product packaging. Our system instantly retrieves and displays the complete origin history, production details, and authenticity verification from the blockchain.",
  },
  {
    question: "Is my product data secure?",
    answer: "Yes. All traceability data is encrypted and stored on the blockchain. Only authorized parties can update product information, while verification is publicly accessible for transparency.",
  },
]

export function FAQ() {
  return (
    <section className="py-12 sm:py-16">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
        <div className="flex-1 w-full">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 sm:mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-sm sm:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="hidden lg:flex lg:w-[500px] shrink-0 self-stretch">
          <Image
            src="/faq.gif"
            alt="faq"
            width={500}
            height={400}
            className="w-full h-full object-contain"
            unoptimized
          />
        </div>
      </div>
    </section>
  )
}
