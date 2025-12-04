'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, Eye, Users, Clock, DollarSign, 
  Calendar, BarChart3, PieChart, Activity
} from 'lucide-react'
import Link from 'next/link'

const analyticsData = {
  overview: {
    totalViews: 1250000,
    watchTime: 45000, // hours
    subscribers: 89500,
    revenue: 2450.75,
    avgViewDuration: 4.5, // minutes
    clickThroughRate: 8.5, // percentage
    engagement: 12.3, // percentage
    retention: 65.8 // percentage
  },
  demographics: {
    ageGroups: [
      { range: '13-17', percentage: 15 },
      { range: '18-24', percentage: 35 },
      { range: '25-34', percentage: 28 },
      { range: '35-44', percentage: 15 },
      { range: '45+', percentage: 7 }
    ],
    countries: [
      { name: 'United States', percentage: 45 },
      { name: 'United Kingdom', percentage: 18 },
      { name: 'Canada', percentage: 12 },
      { name: 'Australia', percentage: 8 },
      { name: 'Germany', percentage: 6 },
      { name: 'Others', percentage: 11 }
    ]
  },
  performance: {
    last30Days: [
      { date: '2024-01-01', views: 15000, revenue: 75.50 },
      { date: '2024-01-02', views: 18000, revenue: 89.25 },
      { date: '2024-01-03', views: 22000, revenue: 110.75 },
      { date: '2024-01-04', views: 19000, revenue: 95.25 },
      { date: '2024-01-05', views: 25000, revenue: 125.50 },
      { date: '2024-01-06', views: 28000, revenue: 140.25 },
      { date: '2024-01-07', views: 32000, revenue: 160.75 }
    ]
  },
  topVideos: [
    { title: 'Amazing Tech Review 2024', views: 250000, revenue: 1250.50, retention: 78 },
    { title: 'Ultimate Cooking Guide', views: 180000, revenue: 890.25, retention: 65 },
    { title: 'Travel Vlog: Japan', views: 150000, revenue: 750.75, retention: 82 },
    { title: 'Gaming Setup Tour', views: 120000, revenue: 600.50, retention: 58 },
    { title: 'Photography Tips', views: 95000, revenue: 475.25, retention: 71 }
  ]
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d')

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-400">Track your content performance and audience insights</p>
          </div>
          <div className="flex space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Link href="/dashboard">
              <Button variant="outline" className="border-gray-700">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
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
                <div className="text-2xl font-bold text-white">{analyticsData.overview.totalViews.toLocaleString()}</div>
                <p className="text-xs text-green-500">+12% vs last period</p>
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
                <CardTitle className="text-sm font-medium text-gray-400">Watch Time</CardTitle>
                <Clock className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{analyticsData.overview.watchTime.toLocaleString()}h</div>
                <p className="text-xs text-green-500">+8% vs last period</p>
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
                <CardTitle className="text-sm font-medium text-gray-400">Subscribers</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{analyticsData.overview.subscribers.toLocaleString()}</div>
                <p className="text-xs text-green-500">+245 this week</p>
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
                <CardTitle className="text-sm font-medium text-gray-400">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${analyticsData.overview.revenue.toFixed(2)}</div>
                <p className="text-xs text-green-500">+15% vs last period</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Analytics */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger value="performance" className="data-[state=active]:bg-netflix-red">
              <BarChart3 className="mr-2 h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="audience" className="data-[state=active]:bg-netflix-red">
              <Users className="mr-2 h-4 w-4" />
              Audience
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-netflix-red">
              <Activity className="mr-2 h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-netflix-red">
              <DollarSign className="mr-2 h-4 w-4" />
              Revenue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Views & Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end space-x-2">
                    {analyticsData.performance.last30Days.slice(-7).map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-blue-500 rounded-t"
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
                  <CardTitle className="text-white">Key Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg. View Duration</span>
                    <span className="text-white">{analyticsData.overview.avgViewDuration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Click-through Rate</span>
                    <span className="text-green-500">{analyticsData.overview.clickThroughRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Engagement Rate</span>
                    <span className="text-blue-500">{analyticsData.overview.engagement}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Audience Retention</span>
                    <span className="text-purple-500">{analyticsData.overview.retention}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Age Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.demographics.ageGroups.map((group, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-400">{group.range}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-netflix-red h-2 rounded-full"
                              style={{ width: `${group.percentage}%` }}
                            />
                          </div>
                          <span className="text-white text-sm">{group.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Top Countries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.demographics.countries.map((country, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-400">{country.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${country.percentage}%` }}
                            />
                          </div>
                          <span className="text-white text-sm">{country.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Top Performing Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topVideos.map((video, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-400 font-bold">#{index + 1}</span>
                        <div>
                          <h3 className="text-white font-medium">{video.title}</h3>
                          <p className="text-gray-400 text-sm">{video.views.toLocaleString()} views</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-500 font-medium">${video.revenue}</p>
                        <p className="text-blue-400 text-sm">{video.retention}% retention</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ad Revenue</span>
                    <span className="text-green-500">$1,850.25 (75%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Premium Views</span>
                    <span className="text-blue-500">$425.50 (17%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Channel Memberships</span>
                    <span className="text-purple-500">$175.00 (8%)</span>
                  </div>
                  <hr className="border-gray-700" />
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Total Revenue</span>
                    <span className="text-green-500">${analyticsData.overview.revenue.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-end space-x-2">
                    {analyticsData.performance.last30Days.slice(-7).map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-green-500 rounded-t"
                          style={{ height: `${(day.revenue / 200) * 150}px` }}
                        />
                        <span className="text-xs text-gray-400 mt-2">
                          {new Date(day.date).getDate()}
                        </span>
                      </div>
                    ))}
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