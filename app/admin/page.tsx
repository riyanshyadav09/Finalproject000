'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, Video, DollarSign, TrendingUp, Shield, Settings,
  Eye, Play, UserCheck, AlertTriangle, BarChart3, Database
} from 'lucide-react'
import Link from 'next/link'

const adminData = {
  totalUsers: 125000,
  totalVideos: 45000,
  totalRevenue: 125000.50,
  activeStreams: 1250,
  pendingReviews: 45,
  reportedContent: 12,
  dailyStats: [
    { date: '2024-01-01', users: 1200, videos: 150, revenue: 2500 },
    { date: '2024-01-02', users: 1350, videos: 180, revenue: 2800 },
    { date: '2024-01-03', users: 1100, videos: 120, revenue: 2200 },
    { date: '2024-01-04', users: 1450, videos: 200, revenue: 3100 },
    { date: '2024-01-05', users: 1600, videos: 220, revenue: 3400 },
    { date: '2024-01-06', users: 1750, videos: 250, revenue: 3800 },
    { date: '2024-01-07', users: 1900, videos: 280, revenue: 4200 }
  ],
  recentUsers: [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'CREATOR', joinDate: '2024-01-07', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'USER', joinDate: '2024-01-07', status: 'active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'PREMIUM', joinDate: '2024-01-06', status: 'pending' }
  ],
  topVideos: [
    { id: 1, title: 'Amazing Tech Review', creator: 'TechGuru', views: 250000, revenue: 1250.50 },
    { id: 2, title: 'Cooking Masterclass', creator: 'ChefMaster', views: 180000, revenue: 890.25 },
    { id: 3, title: 'Travel Adventure', creator: 'Wanderer', views: 150000, revenue: 750.75 }
  ]
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check admin authentication
    const checkAdminAuth = () => {
      // Mock admin check - in real app, verify JWT token and role
      const userRole = localStorage.getItem('userRole')
      setIsAdmin(userRole === 'ADMIN')
    }
    checkAdminAuth()
  }, [])

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 p-8">
          <CardContent className="text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-gray-400 mb-6">You need admin privileges to access this page.</p>
            <Link href="/login">
              <Button className="bg-netflix-red hover:bg-red-700">
                Login as Admin
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400">StreamFlix Platform Management</p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" className="border-gray-700">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Link href="/">
              <Button className="bg-netflix-red hover:bg-red-700">
                Back to Site
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{adminData.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-green-500">+12% from last month</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Videos</CardTitle>
                <Video className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{adminData.totalVideos.toLocaleString()}</div>
                <p className="text-xs text-green-500">+8% from last month</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${adminData.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-green-500">+15% from last month</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Active Streams</CardTitle>
                <Play className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{adminData.activeStreams.toLocaleString()}</div>
                <p className="text-xs text-yellow-500">Live now</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-yellow-900/20 border-yellow-500/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-400">Pending Reviews</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{adminData.pendingReviews}</div>
              <p className="text-xs text-yellow-300">Videos awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-red-900/20 border-red-500/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-400">Reported Content</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{adminData.reportedContent}</div>
              <p className="text-xs text-red-300">Requires immediate attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-netflix-red">
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-netflix-red">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-netflix-red">
              <Video className="mr-2 h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-netflix-red">
              <TrendingUp className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Platform Growth (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end space-x-2">
                    {adminData.dailyStats.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-netflix-red rounded-t"
                          style={{ height: `${(day.users / 2000) * 200}px` }}
                        />
                        <span className="text-xs text-gray-400 mt-2">
                          {new Date(day.date).getDate()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Top Performing Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {adminData.topVideos.map((video, index) => (
                      <div key={video.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-400 font-bold">#{index + 1}</span>
                          <div>
                            <h4 className="text-white font-medium">{video.title}</h4>
                            <p className="text-gray-400 text-sm">by {video.creator}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white">{video.views.toLocaleString()} views</p>
                          <p className="text-green-500 text-sm">${video.revenue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Recent User Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{user.name}</h3>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === 'ADMIN' ? 'bg-red-600' :
                          user.role === 'CREATOR' ? 'bg-purple-600' :
                          user.role === 'PREMIUM' ? 'bg-yellow-600' : 'bg-blue-600'
                        }`}>
                          {user.role}
                        </span>
                        <p className="text-gray-400 text-sm mt-1">{user.joinDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Content Moderation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pending Reviews</span>
                    <span className="text-yellow-500">{adminData.pendingReviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reported Content</span>
                    <span className="text-red-500">{adminData.reportedContent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Auto-Approved</span>
                    <span className="text-green-500">1,245</span>
                  </div>
                  <Button className="w-full bg-netflix-red hover:bg-red-700">
                    Review Content Queue
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Content Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Videos</span>
                    <span className="text-white">{adminData.totalVideos.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Premium Content</span>
                    <span className="text-yellow-500">12,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Free Content</span>
                    <span className="text-blue-500">32,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Storage</span>
                    <span className="text-purple-500">2.5 TB</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ad Revenue</span>
                    <span className="text-green-500">$85,250</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subscriptions</span>
                    <span className="text-blue-500">$32,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Premium Content</span>
                    <span className="text-purple-500">$7,250</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">User Engagement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Daily Active Users</span>
                    <span className="text-white">45,250</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg. Session Time</span>
                    <span className="text-blue-500">24m 32s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bounce Rate</span>
                    <span className="text-yellow-500">12.5%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Server Uptime</span>
                    <span className="text-green-500">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">CDN Performance</span>
                    <span className="text-green-500">Excellent</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Database Load</span>
                    <span className="text-yellow-500">Medium</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}