import type * as React from 'react'

import { useFieldContext } from '@/components/form/form-context'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type TextFieldProps = {
  label: string
  description?: string
} & Omit<
  React.ComponentProps<typeof Input>,
  'id' | 'name' | 'value' | 'onChange' | 'onBlur' | 'aria-invalid'
>

// Normalize a single TanStack Form error (a standard-schema issue object or a raw string)
// to a message string.
function errorMessage(error: unknown): string | undefined {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    const { message } = error as { message?: unknown }
    return typeof message === 'string' ? message : undefined
  }
  return undefined
}

// Reusable text field, bound to the current field via context. Renders label, control,
// optional description, and validation errors once the field has been touched.
export function TextField({ label, description, ...inputProps }: TextFieldProps) {
  const field = useFieldContext<string>()
  const errors = field.state.meta.errors
    .map(errorMessage)
    .filter((message): message is string => Boolean(message))
    .map((message) => ({ message }))
  const isInvalid = field.state.meta.isTouched && errors.length > 0

  return (
    <Field data-invalid={isInvalid || undefined}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid || undefined}
        {...inputProps}
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {isInvalid ? <FieldError errors={errors} /> : null}
    </Field>
  )
}
