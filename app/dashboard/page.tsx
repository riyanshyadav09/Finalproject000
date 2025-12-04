'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, Upload, Eye, DollarSign, TrendingUp, Users, 
  Calendar, Clock, Coins, Wallet, BarChart3, Video
} from 'lucide-react'
import Link from 'next/link'

const mockData = {
  totalViews: 1250000,
  totalVideos: 45,
  subscribers: 89500,
  earnings: 2450.75,
  coins: 12500,
  dailyViews: [
    { date: '2024-01-01', views: 15000 },
    { date: '2024-01-02', views: 18000 },
    { date: '2024-01-03', views: 22000 },
    { date: '2024-01-04', views: 19000 },
    { date: '2024-01-05', views: 25000 },
    { date: '2024-01-06', views: 28000 },
    { date: '2024-01-07', views: 32000 }
  ],
  recentVideos: [
    { id: 1, title: 'Amazing Travel Vlog', views: 45000, earnings: 125.50, uploadDate: '2024-01-05' },
    { id: 2, title: 'Tech Review 2024', views: 78000, earnings: 245.75, uploadDate: '2024-01-03' },
    { id: 3, title: 'Cooking Tutorial', views: 32000, earnings: 89.25, uploadDate: '2024-01-01' }
  ]
}

export default function DashboardPage() {
  const [stats, setStats] = useState(mockData)

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Creator Dashboard</h1>
            <p className="text-gray-400">Manage your content and track performance</p>
          </div>
          <div className="flex space-x-4">
            <Link href="/dashboard/upload">
              <Button className="bg-netflix-red hover:bg-red-700">
                <Upload className="mr-2 h-4 w-4" />
                Upload Video
              </Button>
            </Link>
            <Link href="/dashboard/wallet">
              <Button variant="outline" className="border-gray-700">
                <Wallet className="mr-2 h-4 w-4" />
                Wallet
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
                <CardTitle className="text-sm font-medium text-gray-400">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</div>
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
                <div className="text-2xl font-bold text-white">{stats.totalVideos}</div>
                <p className="text-xs text-green-500">+3 this month</p>
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
                <CardTitle className="text-sm font-medium text-gray-400">Earnings (USD)</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${stats.earnings.toFixed(2)}</div>
                <p className="text-xs text-green-500">+8% from last month</p>
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
                <CardTitle className="text-sm font-medium text-gray-400">StreamCoins</CardTitle>
                <Coins className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.coins.toLocaleString()}</div>
                <p className="text-xs text-yellow-500">≈ ${(stats.coins * 0.1).toFixed(2)} USD</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-netflix-red">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-netflix-red">
              <Video className="mr-2 h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-netflix-red">
              <DollarSign className="mr-2 h-4 w-4" />
              Earnings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Daily Views (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end space-x-2">
                    {stats.dailyViews.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-netflix-red rounded-t"
                          style={{ height: `${(day.views / 35000) * 200}px` }}
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
                  <CardTitle className="text-white">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average View Duration</span>
                    <span className="text-white">4:32</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Click-through Rate</span>
                    <span className="text-green-500">8.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Engagement Rate</span>
                    <span className="text-blue-500">12.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subscriber Growth</span>
                    <span className="text-purple-500">+245 this week</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentVideos.map((video) => (
                    <div key={video.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-12 bg-gray-700 rounded flex items-center justify-center">
                          <Play className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{video.title}</h3>
                          <p className="text-gray-400 text-sm">{video.views.toLocaleString()} views</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-500 font-medium">${video.earnings}</p>
                        <p className="text-gray-400 text-sm">{video.uploadDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Earnings Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ad Revenue</span>
                    <span className="text-green-500">$1,850.25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Premium Views</span>
                    <span className="text-blue-500">$425.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Channel Memberships</span>
                    <span className="text-purple-500">$175.00</span>
                  </div>
                  <hr className="border-gray-700" />
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Total Earnings</span>
                    <span className="text-green-500">${stats.earnings.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">StreamCoins Wallet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500">{stats.coins.toLocaleString()}</div>
                    <p className="text-gray-400">StreamCoins Balance</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl text-green-500">${(stats.coins * 0.1).toFixed(2)}</div>
                    <p className="text-gray-400">USD Equivalent</p>
                  </div>
                  <Link href="/dashboard/wallet">
                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                      <Wallet className="mr-2 h-4 w-4" />
                      Manage Wallet
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}