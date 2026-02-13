import { useToast } from 'vuestic-ui'

export function useAppToast() {
  const { init } = useToast()

  return {
    toast: init,
    success: (message: string) =>
      init({ message, color: 'success' }),
    error: (message: string) =>
      init({ message, color: 'danger' }),
    info: (message: string) =>
      init({ message, color: 'info' }),
  }
}
