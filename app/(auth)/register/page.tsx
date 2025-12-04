'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth/use-auth'
import { Eye, EyeOff, Mail, Lock, User, UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Account created successfully! Redirecting to login...')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
    
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-gradient-to-br from-netflix-red/20 to-black"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-black/80 backdrop-blur-md rounded-lg p-8 border border-gray-800">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-netflix-red rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-white font-bold text-2xl">StreamFlix</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Join StreamFlix</h1>
            <p className="text-gray-400">Create your account to start streaming</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-6">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-white">First Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-netflix-red"
                    placeholder="First name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="lastName" className="text-white">Last Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-netflix-red"
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="username" className="text-white">Username</Label>
              <div className="relative mt-1">
                <UserCheck className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-netflix-red"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-netflix-red"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-netflix-red"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-netflix-red"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-netflix-red hover:bg-red-700 text-white font-semibold py-3"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-netflix-red hover:text-red-400 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}