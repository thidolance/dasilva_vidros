export function validateCredentials(usuario: string, password: string): boolean {
  return (
    usuario === process.env.AUTH_USUARIO &&
    password === process.env.AUTH_PASSWORD
  )
}
