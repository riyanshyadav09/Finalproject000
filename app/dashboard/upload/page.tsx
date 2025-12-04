'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Upload, Video, Image, Tag, DollarSign, 
  Clock, FileVideo, CheckCircle, AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function UploadPage() {
  const [uploadStep, setUploadStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    category: '',
    thumbnail: null,
    video: null,
    isPremium: false,
    monetization: true
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = (type: 'video' | 'thumbnail', file: File) => {
    setFormData(prev => ({ ...prev, [type]: file }))
  }

  const handleSubmit = async () => {
    setIsUploading(true)
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    setUploadStep(4) // Success step
    setIsUploading(false)
  }

  const renderStep = () => {
    switch (uploadStep) {
      case 1:
        return (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileVideo className="mr-2 h-5 w-5" />
                Upload Video File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">Drop your video file here</h3>
                <p className="text-gray-400 text-sm mb-4">or click to browse</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => e.target.files && handleFileUpload('video', e.target.files[0])}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload">
                  <Button className="bg-netflix-red hover:bg-red-700">
                    Choose Video File
                  </Button>
                </label>
              </div>
              
              {/* Codec Selection */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Video Codec</h4>
                <select className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2">
                  <option value="h264">H.264/AVC (Best Compatibility)</option>
                  <option value="vp9">VP9 (Better Compression)</option>
                  <option value="av1">AV1 (Best Compression)</option>
                </select>
                <p className="text-gray-400 text-xs mt-1">H.264 recommended for maximum device compatibility</p>
              </div>
              
              {formData.video && (
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-white">Selected: {formData.video.name}</p>
                  <p className="text-gray-400 text-sm">Size: {(formData.video.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              )}

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Supported Formats</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• MP4, MOV, AVI, MKV</li>
                  <li>• Maximum file size: 10GB</li>
                  <li>• Recommended: 1080p or higher</li>
                  <li>• Frame rate: 24-60 fps</li>
                </ul>
              </div>

              <Button 
                onClick={() => setUploadStep(2)}
                disabled={!formData.video}
                className="w-full bg-netflix-red hover:bg-red-700"
              >
                Next: Video Details
              </Button>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Video className="mr-2 h-5 w-5" />
                Video Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-white">Video Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                  placeholder="Enter an engaging title"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[100px]"
                  placeholder="Describe your video content"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 mt-1"
                  >
                    <option value="">Select Category</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="education">Education</option>
                    <option value="gaming">Gaming</option>
                    <option value="music">Music</option>
                    <option value="sports">Sports</option>
                    <option value="technology">Technology</option>
                    <option value="lifestyle">Lifestyle</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="tags" className="text-white">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={() => setUploadStep(1)}
                  variant="outline"
                  className="border-gray-700"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setUploadStep(3)}
                  disabled={!formData.title || !formData.description}
                  className="flex-1 bg-netflix-red hover:bg-red-700"
                >
                  Next: Thumbnail & Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Image className="mr-2 h-5 w-5" />
                Thumbnail & Monetization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-white">Thumbnail Image</Label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center mt-2">
                  <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm mb-2">Upload custom thumbnail</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFileUpload('thumbnail', e.target.files[0])}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label htmlFor="thumbnail-upload">
                    <Button size="sm" variant="outline" className="border-gray-700">
                      Choose Image
                    </Button>
                  </label>
                </div>
                {formData.thumbnail && (
                  <p className="text-green-500 text-sm mt-2">✓ {formData.thumbnail.name}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="premium"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                    className="rounded border-gray-700 bg-gray-800 text-netflix-red"
                  />
                  <Label htmlFor="premium" className="text-white">
                    Premium Content (Subscribers only)
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="monetization"
                    checked={formData.monetization}
                    onChange={(e) => setFormData(prev => ({ ...prev, monetization: e.target.checked }))}
                    className="rounded border-gray-700 bg-gray-800 text-netflix-red"
                  />
                  <Label htmlFor="monetization" className="text-white">
                    Enable Monetization
                  </Label>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Estimated Earnings
                </h4>
                <div className="text-gray-400 text-sm space-y-1">
                  <p>• Ad Revenue: $0.50 - $2.00 per 1,000 views</p>
                  <p>• Premium Views: $1.00 - $3.00 per 1,000 views</p>
                  <p>• StreamCoins: 10-50 coins per 1,000 views</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={() => setUploadStep(2)}
                  variant="outline"
                  className="border-gray-700"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="flex-1 bg-netflix-red hover:bg-red-700"
                >
                  {isUploading ? 'Uploading...' : 'Upload Video'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                Upload Successful!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="text-green-500">
                <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Video Uploaded Successfully!</h3>
                <p className="text-gray-400">Your video is now being processed and will be available shortly.</p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg text-left">
                <h4 className="text-white font-medium mb-2">What happens next?</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Video processing: 5-15 minutes</li>
                  <li>• Quality optimization for different devices</li>
                  <li>• Thumbnail generation (if not uploaded)</li>
                  <li>• Content review (if required)</li>
                  <li>• Publication to your channel</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={() => {
                    setUploadStep(1)
                    setFormData({
                      title: '',
                      description: '',
                      tags: '',
                      category: '',
                      thumbnail: null,
                      video: null,
                      isPremium: false,
                      monetization: true
                    })
                  }}
                  variant="outline"
                  className="border-gray-700"
                >
                  Upload Another
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full bg-netflix-red hover:bg-red-700">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  if (isUploading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Uploading Video...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-netflix-red mb-2">{uploadProgress}%</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div 
                    className="bg-netflix-red h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-gray-400">Processing your video... Please don't close this page.</p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Upload Details</h4>
                <div className="text-gray-400 text-sm space-y-1">
                  <p>Title: {formData.title}</p>
                  <p>Category: {formData.category}</p>
                  <p>File: {formData.video?.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Upload Video</h1>
            <p className="text-gray-400">Share your content with the world</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="border-gray-700">
              Cancel
            </Button>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step <= uploadStep ? 'bg-netflix-red text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {step < uploadStep ? <CheckCircle className="h-5 w-5" /> : step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 ${
                  step < uploadStep ? 'bg-netflix-red' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={uploadStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </div>
    </div>
  )
}