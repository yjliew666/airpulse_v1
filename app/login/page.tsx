// app/login/page.tsx
import { login, signup } from './actions' // We will create this next

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">AirPulse Login</h1>
        
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input name="email" type="email" required className="w-full rounded border p-2" />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input name="password" type="password" required className="w-full rounded border p-2" />
        </div>

        <div className="flex gap-2">
          <button formAction={login} className="flex-1 rounded bg-blue-600 py-2 text-white">Log in</button>
          <button formAction={signup} className="flex-1 rounded border border-gray-300 py-2">Sign up</button>
        </div>
      </form>
    </div>
  )
}