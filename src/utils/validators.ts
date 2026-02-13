/**
 * Form validation rules for VaInput, VaSelect, etc.
 * Each rule is a function: (value) => true | string (error message)
 */

export const validators = {
  required: (value: unknown): true | string => {
    if (value === undefined || value === null) return 'This field is required'
    if (typeof value === 'string' && value.trim() === '') return 'This field is required'
    return true
  },
  email: (value: unknown): true | string => {
    if (!value) return true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(String(value)) || 'Please enter a valid email address'
  },
}
