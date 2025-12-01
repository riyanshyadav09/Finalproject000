'use client'

import { useState } from 'react'

export function useAuth() {
  const [user] = useState(null)
  const [loading] = useState(false)

  const login = async (email: string, password: string) => {
    // Mock login for demo
    return { success: true }
  }

  const register = async (data: any) => {
    // Mock register for demo
    return { success: true }
  }

  const logout = () => {
    // Mock logout for demo
  }

  const updateUser = () => {
    // Mock update for demo
  }

  return {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  }
}