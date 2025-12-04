'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validToken, setValidToken] = useState(true)

  useEffect(() => {
    if (!token) {
      setValidToken(false)
      setError('Invalid or missing reset token')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

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
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || 'Failed to reset password')
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

  if (!validToken) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-netflix-red/20 to-black"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-black/80 backdrop-blur-md rounded-lg p-8 border border-gray-800 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h1>
            <p className="text-gray-400 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link href="/forgot-password">
              <Button className="w-full bg-netflix-red hover:bg-red-700">
                Request New Reset Link
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-netflix-red/20 to-black"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-black/80 backdrop-blur-md rounded-lg p-8 border border-gray-800 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Password Reset Successful</h1>
            <p className="text-gray-400 mb-6">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Link href="/login">
              <Button className="w-full bg-netflix-red hover:bg-red-700">
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
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
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-gray-400">Enter your new password below</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="password" className="text-white">New Password</Label>
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
                  placeholder="Enter new password"
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
              <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
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
                  placeholder="Confirm new password"
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

            <div className="text-sm text-gray-400">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>At least 8 characters long</li>
                <li>Contains both letters and numbers</li>
                <li>At least one special character</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-netflix-red hover:bg-red-700 text-white font-semibold py-3"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="text-netflix-red hover:text-red-400 font-semibold"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}