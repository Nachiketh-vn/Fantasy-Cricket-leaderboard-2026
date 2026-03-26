import LoginForm from './LoginForm'

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return <LoginForm searchParamsPromise={searchParams} />
}