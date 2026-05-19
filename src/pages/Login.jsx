import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Loader2, Eye, EyeOff, UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createPageUrl } from '@/utils'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const isLogin = mode === 'login'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    if (!isLogin && !name) {
      setError('Name is required.')
      return
    }

    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
      navigate(createPageUrl('AdminDashboard'))
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-gold/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to={createPageUrl('Home')} className="inline-block">
              <h1 className="font-gilda text-4xl text-gold tracking-wide">Jewel</h1>
              <p className="text-xs text-gold/50 tracking-[0.2em] uppercase mt-1">
                Lifestyle Magazine
              </p>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex mb-8 border border-gold/10 rounded-lg overflow-hidden">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
                isLogin
                  ? 'bg-gold text-black'
                  : 'text-gold/50 hover:text-gold hover:bg-gold/5'
              }`}
            >
              <LogIn size={16} className="inline mr-2 -mt-0.5" />
              Login
            </button>
            <button
              onClick={() => { setMode('register'); setError('') }}
              className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
                !isLogin
                  ? 'bg-gold text-black'
                  : 'text-gold/50 hover:text-gold hover:bg-gold/5'
              }`}
            >
              <UserPlus size={16} className="inline mr-2 -mt-0.5" />
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm text-gold/70 mb-1.5 font-medium">Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="bg-black/50 border-gold/10 text-white placeholder:text-white/30 focus-visible:ring-gold/50 h-11"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gold/70 mb-1.5 font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-black/50 border-gold/10 text-white placeholder:text-white/30 focus-visible:ring-gold/50 h-11"
              />
            </div>

            <div>
              <label className="block text-sm text-gold/70 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? 'Enter your password' : 'Min 6 characters'}
                  className="bg-black/50 border-gold/10 text-white placeholder:text-white/30 focus-visible:ring-gold/50 h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gold/50 hover:text-gold transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 gradient-gold text-black font-semibold text-base hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isLogin ? (
                <LogIn size={18} />
              ) : (
                <UserPlus size={18} />
              )}
              <span className="ml-2">{loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}</span>
            </Button>
          </form>

          {/* Home link */}
          <div className="mt-6 text-center">
            <Link
              to={createPageUrl('Home')}
              className="text-sm text-gold/40 hover:text-gold transition-colors"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
