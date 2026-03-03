import { useState } from 'react';
import Image from 'next/image';

const STEPS = [1, 2, 3, 4] as const;

export function HowToUse() {
  const [activeStep, setActiveStep] = useState<(typeof STEPS)[number]>(1);

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center gap-10 bg-[#f2f2f2] px-4 py-12 md:py-16 lg:flex-row lg:px-[9rem]">
      <div className="order-1 w-full max-w-3xl lg:order-2">
        <div className="w-full">
          <Image
            src={`/how-to-use/step${activeStep}.svg`}
            alt={`How to use – step ${activeStep}`}
            width={1200}
            height={800}
            className="h-auto w-full object-contain"
            priority
          />
        </div>
      </div>

      <div className="order-2 w-full max-w-md space-y-6 lg:order-1">
        <p className="text-base md:text-lg font-semibold uppercase tracking-[0.2em] text-gray-400">
          Identity verification
        </p>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-snug text-gray-900">
          4 STEPS – EASY
          <br />
          <span className="text-[#c41e3a]">AND FAST</span>
        </h1>

        {/* Mobile step indicator */}
        <div className="mt-3 flex items-center justify-between gap-2 sm:hidden">
          <div className="h-px flex-1 bg-gray-300" />
          {STEPS.map((step) => {
            const isActive = step === activeStep;
            return (
              <button
                key={step}
                type="button"
                onClick={() => setActiveStep(step)}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  isActive ? 'bg-[#c41e3a] text-white' : 'bg-white text-gray-600 border border-gray-300'
                }`}
                aria-label={`Go to step ${step}`}
              >
                {step}
              </button>
            );
          })}
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        <div className="mt-4 flex items-start gap-6 lg:gap-8">
          <div className="relative hidden sm:flex flex-col items-center pt-1 pb-1">
            {STEPS.map((step, index) => {
              const isActive = step === activeStep;
              const isCompleted = step < activeStep;
              const showActiveSegment = step <= activeStep;

              return (
                <div key={step} className="flex flex-col items-center">
                  {index > 0 && (
                    <div
                      className={`w-px transition-colors duration-200 ${
                        showActiveSegment ? 'bg-[#c41e3a]' : 'bg-gray-300'
                      }`}
                      style={{ height: index === activeStep - 1 ? 40 : 32 }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveStep(step)}
                    aria-label={`Go to step ${step}`}
                    className="relative z-10 my-1 flex items-center justify-center"
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 ${
                        isActive || isCompleted ? 'bg-[rgba(196,30,58,0.12)]' : 'bg-[rgba(148,163,184,0.2)]'
                      }`}
                    >
                      <span
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border-[2px] ${
                          isActive || isCompleted ? 'border-[#c41e3a] bg-white' : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#c41e3a]" />}
                      </span>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex-1 relative min-h-[150px] lg:min-h-[220px]">
            <p className="text-4xl md:text-5xl lg:text-[72px] font-bold text-[#f5d0d6] leading-none mb-2 lg:mb-4">
              0{activeStep}
            </p>
            <h2 className="text-[#c41e3a] font-bold text-lg lg:text-xl mb-2">
              {activeStep === 1 && 'Create your account'}
              {activeStep === 2 && 'Complete business information'}
              {activeStep === 3 && 'Verify & activate your account'}
              {activeStep === 4 && 'Start using the platform'}
            </h2>
            <p className="text-gray-600 text-base md:text-lg lg:text-base max-w-[320px]">
              {activeStep === 1 &&
                'Register an account or sign in using your existing government service account.'}
              {activeStep === 2 &&
                'Update full enterprise information so your business profile is ready for verification.'}
              {activeStep === 3 &&
                'Submit required documents and confirm ownership so your account can be activated.'}
              {activeStep === 4 &&
                'Start registering products, issuing traceability codes, and managing your supply chain.'}
            </p>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Step‑by‑step guide for registering and updating your business account information.</p>
        </div>
      </div>
    </section>
  );
}

