export function validateCredentials(password: string): boolean {
  return password === process.env.AUTH_PASSWORD
}
