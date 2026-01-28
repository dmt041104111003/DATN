import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  label?: string
}

function Input({ className, type, label, ...props }: InputProps) {
  const inputId = React.useId()
  const [isFocused, setIsFocused] = React.useState(false)
  const [hasValue, setHasValue] = React.useState(false)

  React.useEffect(() => {
    if (props.value !== undefined) {
      setHasValue(String(props.value).length > 0)
    } else if (props.defaultValue !== undefined) {
      setHasValue(String(props.defaultValue).length > 0)
    }
  }, [props.value, props.defaultValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0)
    props.onChange?.(e)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    props.onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    props.onBlur?.(e)
  }

  const showLabelUp = isFocused || hasValue || (props.value && String(props.value).length > 0) || (props.defaultValue && String(props.defaultValue).length > 0)

  if (label) {
    return (
      <>
        <style dangerouslySetInnerHTML={{
          __html: `
            .input-group-${inputId} {
              position: relative;
            }
            .input-group-${inputId} {
              width: 100%;
              max-width: 100%;
              box-sizing: border-box;
            }
            .input-field-${inputId} {
              font-size: 16px;
              padding: 12px 10px 12px 5px;
              display: block;
              width: 100%;
              max-width: 100%;
              box-sizing: border-box;
              border: none;
              border-bottom: 1px solid #515151;
              background: transparent;
            }
            @media (max-width: 640px) {
              .input-field-${inputId} {
                font-size: 16px;
                padding: 14px 10px 14px 5px;
              }
            }
            .input-field-${inputId}[type="date"],
            .input-field-${inputId}[type="datetime-local"] {
              padding-right: 30px;
            }
            .input-field-${inputId}[type="date"]::-webkit-calendar-picker-indicator,
            .input-field-${inputId}[type="datetime-local"]::-webkit-calendar-picker-indicator {
              position: absolute;
              right: 5px;
              cursor: pointer;
            }
            .input-field-${inputId}:focus {
              outline: none;
            }
            .input-label-${inputId} {
              color: #999;
              font-size: 18px;
              font-weight: normal;
              position: absolute;
              pointer-events: none;
              left: 5px;
              top: 12px;
              transition: 0.2s ease all;
              -moz-transition: 0.2s ease all;
              -webkit-transition: 0.2s ease all;
            }
            .input-label-up-${inputId} {
              top: -20px;
              font-size: 14px;
              color: #5264AE;
            }
            @media (max-width: 640px) {
              .input-label-${inputId} {
                top: 14px;
              }
            }
            .input-bar-${inputId} {
              position: relative;
              display: block;
              width: 100%;
            }
            .input-bar-${inputId}:before,
            .input-bar-${inputId}:after {
              content: '';
              height: 2px;
              width: 0;
              bottom: 1px;
              position: absolute;
              background: #5264AE;
              transition: 0.2s ease all;
              -moz-transition: 0.2s ease all;
              -webkit-transition: 0.2s ease all;
            }
            .input-bar-${inputId}:before {
              left: 50%;
            }
            .input-bar-${inputId}:after {
              right: 50%;
            }
            .input-field-${inputId}:focus ~ .input-bar-${inputId}:before,
            .input-field-${inputId}:focus ~ .input-bar-${inputId}:after {
              width: 50%;
            }
            .input-highlight-${inputId} {
              position: absolute;
              height: 60%;
              width: 100px;
              top: 25%;
              left: 0;
              pointer-events: none;
              opacity: 0.5;
            }
            .input-field-${inputId}:focus ~ .input-highlight-${inputId} {
              animation: inputHighlighter-${inputId} 0.3s ease;
            }
            @keyframes inputHighlighter-${inputId} {
              from {
                background: #5264AE;
              }
              to {
                width: 0;
                background: transparent;
              }
            }
          `
        }} />
        <div className={cn("input-group", `input-group-${inputId}`, "min-w-0", "w-full")}>
          <input
            id={inputId}
            type={type}
            data-slot="input"
            className={cn(`input-field-${inputId}`, "min-w-0", "w-full", className)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          <span className={`input-highlight-${inputId} input-highlight`}></span>
          <span className={`input-bar-${inputId} input-bar`}></span>
          <label
            htmlFor={inputId}
            className={cn(`input-label-${inputId}`, showLabelUp && `input-label-up-${inputId}`)}
          >
            {label}
          </label>
        </div>
      </>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .input-simple-${inputId} {
            font-size: 16px;
            padding: 12px 10px 12px 5px;
            display: block;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            border: none;
            border-bottom: 1px solid #515151;
            background: transparent;
            position: relative;
          }
          @media (max-width: 640px) {
            .input-simple-${inputId} {
              font-size: 16px;
              padding: 14px 10px 14px 5px;
            }
          }
          .input-simple-${inputId}[type="date"],
          .input-simple-${inputId}[type="datetime-local"] {
            padding-right: 30px;
          }
          .input-simple-${inputId}[type="date"]::-webkit-calendar-picker-indicator,
          .input-simple-${inputId}[type="datetime-local"]::-webkit-calendar-picker-indicator {
            position: absolute;
            right: 5px;
            cursor: pointer;
          }
          .input-simple-${inputId}:focus {
            outline: none;
            border-bottom-color: #5264AE;
          }
        `
      }} />
      <input
        id={props.id || inputId}
        type={type}
        data-slot="input"
        className={cn(`input-simple-${inputId}`, "min-w-0", className)}
        {...props}
      />
    </>
  )
}

export { Input }
