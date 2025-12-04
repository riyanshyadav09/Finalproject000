'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Wallet, Coins, DollarSign, ArrowUpRight, ArrowDownLeft, 
  CreditCard, Bank, TrendingUp, History, Send, Receive
} from 'lucide-react'
import Link from 'next/link'

const walletData = {
  streamCoins: 12500,
  usdBalance: 1250.00,
  pendingEarnings: 245.75,
  totalEarned: 5680.25,
  exchangeRate: 0.1, // 1 StreamCoin = $0.10
  transactions: [
    { id: 1, type: 'earned', amount: 150, description: 'Video views - Tech Review 2024', date: '2024-01-07', status: 'completed' },
    { id: 2, type: 'withdrawal', amount: -500, description: 'Bank transfer', date: '2024-01-06', status: 'completed' },
    { id: 3, type: 'earned', amount: 89, description: 'Premium views - Cooking Tutorial', date: '2024-01-05', status: 'completed' },
    { id: 4, type: 'earned', amount: 245, description: 'Ad revenue - Travel Vlog', date: '2024-01-04', status: 'completed' },
    { id: 5, type: 'withdrawal', amount: -200, description: 'PayPal transfer', date: '2024-01-03', status: 'pending' }
  ]
}

export default function WalletPage() {
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [exchangeAmount, setExchangeAmount] = useState('')

  const handleWithdraw = () => {
    console.log('Withdrawing:', withdrawAmount)
  }

  const handleExchange = () => {
    console.log('Exchanging coins:', exchangeAmount)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Wallet & Earnings</h1>
            <p className="text-gray-400">Manage your StreamCoins and earnings</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="border-gray-700">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-yellow-600 to-yellow-800 border-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">StreamCoins Balance</CardTitle>
                <Coins className="h-6 w-6" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{walletData.streamCoins.toLocaleString()}</div>
                <p className="text-yellow-100 text-sm">≈ ${(walletData.streamCoins * walletData.exchangeRate).toFixed(2)} USD</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-600 to-green-800 border-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">USD Balance</CardTitle>
                <DollarSign className="h-6 w-6" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${walletData.usdBalance.toFixed(2)}</div>
                <p className="text-green-100 text-sm">Available for withdrawal</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
                <TrendingUp className="h-6 w-6" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${walletData.pendingEarnings.toFixed(2)}</div>
                <p className="text-blue-100 text-sm">Processing in 2-3 days</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-netflix-red">
              <Wallet className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="exchange" className="data-[state=active]:bg-netflix-red">
              <Coins className="mr-2 h-4 w-4" />
              Exchange
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="data-[state=active]:bg-netflix-red">
              <Send className="mr-2 h-4 w-4" />
              Withdraw
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-netflix-red">
              <History className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Earnings Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Lifetime Earnings</span>
                    <span className="text-green-500 font-bold">${walletData.totalEarned.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">This Month</span>
                    <span className="text-white">${walletData.usdBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pending</span>
                    <span className="text-yellow-500">${walletData.pendingEarnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">StreamCoins Value</span>
                    <span className="text-blue-500">${(walletData.streamCoins * walletData.exchangeRate).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Exchange Rate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">1 StreamCoin = $0.10</div>
                    <p className="text-gray-400 text-sm">Current exchange rate</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">24h Change</span>
                      <span className="text-green-500">+2.5%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">7d Change</span>
                      <span className="text-green-500">+8.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="exchange" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Exchange StreamCoins to USD</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-400 text-sm">StreamCoins Amount</label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={exchangeAmount}
                      onChange={(e) => setExchangeAmount(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                    <p className="text-gray-500 text-xs mt-1">Available: {walletData.streamCoins.toLocaleString()} coins</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">USD Equivalent</label>
                    <div className="bg-gray-800 border border-gray-700 rounded-md p-3 mt-1">
                      <span className="text-green-500 font-bold">
                        ${exchangeAmount ? (parseFloat(exchangeAmount) * walletData.exchangeRate).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleExchange}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  disabled={!exchangeAmount}
                >
                  <Coins className="mr-2 h-4 w-4" />
                  Exchange to USD
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Withdraw Funds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Withdrawal Amount (USD)</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                  />
                  <p className="text-gray-500 text-xs mt-1">Available: ${walletData.usdBalance.toFixed(2)}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleWithdraw}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!withdrawAmount}
                  >
                    <Bank className="mr-2 h-4 w-4" />
                    Bank Transfer
                  </Button>
                  <Button 
                    onClick={handleWithdraw}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!withdrawAmount}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    PayPal
                  </Button>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Withdrawal Information</h4>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• Minimum withdrawal: $50</li>
                    <li>• Processing time: 2-5 business days</li>
                    <li>• No fees for withdrawals above $100</li>
                    <li>• $2.50 fee for withdrawals under $100</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {walletData.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'earned' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {transaction.type === 'earned' ? 
                            <ArrowDownLeft className="h-4 w-4" /> : 
                            <ArrowUpRight className="h-4 w-4" />
                          }
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{transaction.description}</h3>
                          <p className="text-gray-400 text-sm">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.amount > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <p className={`text-xs ${
                          transaction.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}