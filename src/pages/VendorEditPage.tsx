import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Eye, Save } from 'lucide-react'
import vendorService from '@/services/vendorService'
import type { Vendor } from '@/types/vendor'

export default function VendorEditPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [vendor, setVendor] = useState<Vendor | null>(null)

  useEffect(() => {
    const loadVendor = async () => {
      if (!slug) {
        setError('No vendor slug provided')
        setLoading(false)
        return
      }

      try {
        const vendorData = await vendorService.getVendorBySlug(slug)
        setVendor(vendorData)
      } catch (err: any) {
        console.error('Error loading vendor:', err)
        setError(err.message || 'Failed to load vendor')
      } finally {
        setLoading(false)
      }
    }

    loadVendor()
  }, [slug])

  const handleSave = async () => {
    if (!vendor) return

    setSaving(true)
    setError('')

    try {
      // TODO: Implement vendor update API call
      console.log('Saving vendor:', vendor)
      alert('Vendor saved! (API update not implemented yet)')
    } catch (err: any) {
      console.error('Error saving vendor:', err)
      setError(err.message || 'Failed to save vendor')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    if (vendor) {
      window.open(`/vendor/${vendor.slug}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading vendor...</p>
        </div>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 max-w-md">
          <h2 className="text-xl font-bold text-white mb-4">Error Loading Vendor</h2>
          <p className="text-gray-300 mb-6">{error || 'Vendor not found'}</p>
          <Button
            onClick={() => navigate('/vendor/dashboard')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/vendor/dashboard')}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <h1 className="text-xl font-bold text-white">Edit Vendor Profile</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              className="border-white/20 text-gray-300 hover:bg-white/5"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 space-y-6">
          <div>
            <Label htmlFor="name" className="text-gray-300">Business Name</Label>
            <Input
              id="name"
              value={vendor.name}
              onChange={(e) => setVendor({ ...vendor, name: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={vendor.description}
              onChange={(e) => setVendor({ ...vendor, description: e.target.value })}
              rows={4}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-300">Contact Email</Label>
            <Input
              id="email"
              type="email"
              value={vendor.contactInfo.email}
              onChange={(e) => setVendor({
                ...vendor,
                contactInfo: { ...vendor.contactInfo, email: e.target.value }
              })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-gray-300">Phone (Optional)</Label>
            <Input
              id="phone"
              value={vendor.contactInfo.phone || ''}
              onChange={(e) => setVendor({
                ...vendor,
                contactInfo: { ...vendor.contactInfo, phone: e.target.value }
              })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="website" className="text-gray-300">Website (Optional)</Label>
            <Input
              id="website"
              value={vendor.contactInfo.website || ''}
              onChange={(e) => setVendor({
                ...vendor,
                contactInfo: { ...vendor.contactInfo, website: e.target.value }
              })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label htmlFor="instagram" className="text-gray-300">Instagram (Optional)</Label>
            <Input
              id="instagram"
              value={vendor.contactInfo.instagram || ''}
              onChange={(e) => setVendor({
                ...vendor,
                contactInfo: { ...vendor.contactInfo, instagram: e.target.value }
              })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="@yourusername"
            />
          </div>

          <div>
            <Label htmlFor="address" className="text-gray-300">Address (Optional)</Label>
            <Input
              id="address"
              value={vendor.address || ''}
              onChange={(e) => setVendor({ ...vendor, address: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="123 Main St, City, State 12345"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
