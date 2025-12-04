'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!email) {
      setError('Email is required')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || 'Failed to send reset email')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
    
    setLoading(false)
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
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
              <p className="text-gray-400">
                We've sent a password reset link to <span className="text-white">{email}</span>
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              
              <Button
                onClick={() => setSuccess(false)}
                variant="outline"
                className="w-full border-gray-700 text-white hover:bg-gray-800"
              >
                Try Different Email
              </Button>

              <Link href="/login">
                <Button className="w-full bg-netflix-red hover:bg-red-700">
                  Back to Login
                </Button>
              </Link>
            </div>
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
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-netflix-red rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-white font-bold text-2xl">StreamFlix</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-gray-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-netflix-red"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-netflix-red hover:bg-red-700 text-white font-semibold py-3"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-netflix-red hover:text-red-400 font-semibold"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Need help?</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Make sure you enter the email associated with your account</p>
              <p>• Check your spam/junk folder for the reset email</p>
              <p>• Contact support if you continue having issues</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}