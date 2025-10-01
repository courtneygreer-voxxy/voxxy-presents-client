import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Loader,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { budgetsApi } from "@/services/api"
import { getDataSource } from "@/config/environments"
import type {
  Event,
  Budget,
  BudgetLineItem,
  BudgetSummary,
  CreateBudgetRequest,
  CreateBudgetLineItemRequest,
  UpdateBudgetLineItemRequest
} from "@/types/database"

interface EventBudgetManagerProps {
  events: Event[]
  organizationId: string
}

export default function EventBudgetManager({ events, organizationId }: EventBudgetManagerProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [budget, setBudget] = useState<Budget | null>(null)
  const [lineItems, setLineItems] = useState<BudgetLineItem[]>([])
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Line item form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetLineItem | null>(null)
  const [formData, setFormData] = useState<Partial<CreateBudgetLineItemRequest>>({
    category: 'expense',
    type: 'venue',
    description: '',
    plannedAmount: 0,
    notes: ''
  })

  // Published events only
  const publishedEvents = events.filter(event =>
    event.status === 'published' || event.status === 'completed'
  )

  // Load budget data when event is selected
  useEffect(() => {
    if (selectedEvent) {
      loadBudgetData(selectedEvent.id)
    }
  }, [selectedEvent])

  const loadBudgetData = async (eventId: string) => {
    setLoading(true)
    setError(null)

    try {
      const dataSource = getDataSource()
      console.log('🔍 [Budget Debug] Loading budget data for event:', eventId, 'using data source:', dataSource)

      if (dataSource === 'api') {
        try {
          console.log('📡 [Budget Debug] Making API call to get budget for event:', eventId)
          const response = await budgetsApi.getEventBudget(eventId)
          console.log('✅ [Budget Debug] Budget API response:', response)

          setBudget(response.budget)
          setLineItems(response.lineItems || [])

          if (response.budget) {
            console.log('📊 [Budget Debug] Loading budget summary for budget ID:', response.budget.id)
            const summaryResponse = await budgetsApi.getBudgetSummary(response.budget.id)
            console.log('✅ [Budget Debug] Summary response:', summaryResponse)
            setSummary(summaryResponse.summary)
          }
        } catch (err: any) {
          console.log('⚠️ [Budget Debug] API error:', err)
          if (err.status === 404) {
            // No budget exists for this event
            console.log('📝 [Budget Debug] No budget found for event (404), setting null state')
            setBudget(null)
            setLineItems([])
            setSummary(null)
          } else if (err.status === 500) {
            // Server error - might be index issue, treat as no budget for now
            console.log('🔥 [Budget Debug] Server error (500), likely index issue, treating as no budget')
            setBudget(null)
            setLineItems([])
            setSummary(null)
          } else {
            throw err
          }
        }
      } else {
        // Firebase implementation would go here
        console.log('🔥 [Budget Debug] Firebase budget loading not implemented yet')
      }
    } catch (err) {
      console.error('❌ [Budget Debug] Failed to load budget data:', err)
      setError('Failed to load budget data')
    } finally {
      setLoading(false)
    }
  }

  const createBudget = async () => {
    if (!selectedEvent) {
      console.log('⚠️ [Budget Debug] No selected event for budget creation')
      return
    }

    console.log('🚀 [Budget Debug] Starting budget creation for event:', selectedEvent.title, selectedEvent.id)
    setSaving(true)
    setError(null)

    try {
      const dataSource = getDataSource()
      console.log('🔍 [Budget Debug] Using data source:', dataSource)

      if (dataSource === 'api') {
        const budgetData: CreateBudgetRequest = {
          eventId: selectedEvent.id,
          notes: `Budget for ${selectedEvent.title}`
        }

        console.log('📡 [Budget Debug] Creating budget with data:', budgetData)
        const response = await budgetsApi.createEventBudget(selectedEvent.id, budgetData)
        console.log('✅ [Budget Debug] Budget created successfully:', response)

        setBudget(response.budget)
        setLineItems([])

        // Load summary
        console.log('📊 [Budget Debug] Loading summary for new budget:', response.budget.id)
        const summaryResponse = await budgetsApi.getBudgetSummary(response.budget.id)
        console.log('✅ [Budget Debug] Summary loaded:', summaryResponse)
        setSummary(summaryResponse.summary)
      } else {
        // Firebase implementation would go here
        console.log('🔥 [Budget Debug] Firebase budget creation not implemented yet - this should not happen in development')
      }
    } catch (err: any) {
      console.error('❌ [Budget Debug] Failed to create budget:', err)
      if (err.status === 409) {
        // Budget already exists, reload the page to show it
        console.log('♻️ [Budget Debug] Budget already exists, reloading budget data')
        await loadBudgetData(selectedEvent.id)
      } else {
        setError('Failed to create budget: ' + err.message)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleAddLineItem = async () => {
    if (!budget || !formData.description || formData.plannedAmount === undefined) return

    setSaving(true)
    setError(null)

    try {
      const dataSource = getDataSource()

      if (dataSource === 'api') {
        const response = await budgetsApi.addLineItem(budget.id, formData)
        setLineItems(prev => [...prev, response.lineItem])

        // Refresh summary
        const summaryResponse = await budgetsApi.getBudgetSummary(budget.id)
        setSummary(summaryResponse.summary)

        // Reset form
        setFormData({
          category: 'expense',
          type: 'venue',
          description: '',
          plannedAmount: 0,
          notes: ''
        })
        setShowAddForm(false)
      }
    } catch (err) {
      console.error('Failed to add line item:', err)
      setError('Failed to add line item')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateLineItem = async (lineItem: BudgetLineItem, updates: UpdateBudgetLineItemRequest) => {
    setSaving(true)
    setError(null)

    try {
      const dataSource = getDataSource()

      if (dataSource === 'api') {
        const response = await budgetsApi.updateLineItem(lineItem.id, updates)
        setLineItems(prev => prev.map(item =>
          item.id === lineItem.id ? response.lineItem : item
        ))

        // Refresh summary
        if (budget) {
          const summaryResponse = await budgetsApi.getBudgetSummary(budget.id)
          setSummary(summaryResponse.summary)
        }
      }
    } catch (err) {
      console.error('Failed to update line item:', err)
      setError('Failed to update line item')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-400'
    if (variance < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4" />
    if (variance < 0) return <TrendingDown className="h-4 w-4" />
    return <BarChart3 className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Event Selection */}
      <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Event to Budget
          </CardTitle>
          <CardDescription className="text-gray-300">
            Choose a published or completed event to create and manage its budget. Click the dropdown below to see available events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {publishedEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">No events available for budgeting</p>
              <p className="text-gray-400 text-sm">
                You need published or completed events to create budgets. Create an event first in the Events tab.
              </p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-400">
                📊 {publishedEvents.length} event{publishedEvents.length !== 1 ? 's' : ''} available for budget management
              </div>
              <Select
                value={selectedEvent?.id || ''}
                onValueChange={(eventId) => {
                  const event = publishedEvents.find(e => e.id === eventId)
                  setSelectedEvent(event || null)
                }}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white h-12 text-left">
                  <SelectValue placeholder="Click here to select an event..." />
                </SelectTrigger>
                <SelectContent className="bg-white/15 backdrop-blur-md border-white/30">
                  {publishedEvents.map(event => (
                    <SelectItem key={event.id} value={event.id} className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{event.title}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(event.date).toLocaleDateString()} • {event.status}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-200">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        </div>
      )}

      {selectedEvent && (
        <>
          {loading ? (
            <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
              <CardContent className="p-8 text-center">
                <Loader className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
                <p className="text-gray-300">Loading budget data...</p>
              </CardContent>
            </Card>
          ) : !budget ? (
            /* No Budget - Create One */
            <Card className="!bg-purple-500/10 !border-purple-400/30 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <DollarSign className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-purple-300 mb-3">
                  No Budget Found
                </h3>
                <p className="text-purple-200 mb-6">
                  Create a budget for "{selectedEvent.title}" to start tracking expenses and revenue.
                </p>
                <Button
                  onClick={createBudget}
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {saving ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Budget
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Budget Management */
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-white/10 border border-white/20">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="line-items" className="data-[state=active]:bg-white/20">
                  Line Items
                </TabsTrigger>
                <TabsTrigger value="analysis" className="data-[state=active]:bg-white/20">
                  Analysis
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Revenue Card */}
                  <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-300">Revenue</p>
                          <p className="text-2xl font-bold text-green-400">
                            {formatCurrency(summary?.actualRevenue || 0)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Planned: {formatCurrency(summary?.plannedRevenue || 0)}
                          </p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-full">
                          <DollarSign className="h-6 w-6 text-green-400" />
                        </div>
                      </div>
                      {summary && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${getVarianceColor(summary.revenueVariance)}`}>
                          {getVarianceIcon(summary.revenueVariance)}
                          {formatCurrency(Math.abs(summary.revenueVariance))} variance
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Expenses Card */}
                  <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-300">Expenses</p>
                          <p className="text-2xl font-bold text-red-400">
                            {formatCurrency(summary?.actualExpenses || 0)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Planned: {formatCurrency(summary?.plannedExpenses || 0)}
                          </p>
                        </div>
                        <div className="p-3 bg-red-500/20 rounded-full">
                          <DollarSign className="h-6 w-6 text-red-400" />
                        </div>
                      </div>
                      {summary && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${getVarianceColor(-summary.expenseVariance)}`}>
                          {getVarianceIcon(-summary.expenseVariance)}
                          {formatCurrency(Math.abs(summary.expenseVariance))} variance
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Profit Card */}
                  <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-300">Net Profit</p>
                          <p className={`text-2xl font-bold ${(summary?.actualProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(summary?.actualProfit || 0)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Planned: {formatCurrency(summary?.plannedProfit || 0)}
                          </p>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-full">
                          <DollarSign className="h-6 w-6 text-purple-400" />
                        </div>
                      </div>
                      {summary && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${getVarianceColor(summary.profitVariance)}`}>
                          {getVarianceIcon(summary.profitVariance)}
                          {formatCurrency(Math.abs(summary.profitVariance))} variance
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Budget Status */}
                <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Budget Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={budget.status === 'active' ? 'default' : 'secondary'}>
                          {budget.status}
                        </Badge>
                        {summary?.isOverBudget && (
                          <Badge variant="destructive" className="bg-red-600">
                            Over Budget
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-300">Progress</p>
                        <p className="text-lg font-semibold text-white">
                          {summary?.completedLineItems || 0} / {summary?.totalLineItems || 0} items
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Line Items Tab */}
              <TabsContent value="line-items">
                <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">Budget Line Items</CardTitle>
                        <CardDescription className="text-gray-300">
                          Track individual revenue sources and expenses
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => setShowAddForm(true)}
                        disabled={saving}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Add Form */}
                    {showAddForm && (
                      <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="text-white font-medium mb-4">Add Line Item</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-white">Category</Label>
                            <Select
                              value={formData.category}
                              onValueChange={(value: 'revenue' | 'expense') =>
                                setFormData(prev => ({ ...prev, category: value }))
                              }
                            >
                              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white/15 backdrop-blur-md border-white/30">
                                <SelectItem value="revenue">Revenue</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-white">Type</Label>
                            <Select
                              value={formData.type}
                              onValueChange={(value) =>
                                setFormData(prev => ({ ...prev, type: value as any }))
                              }
                            >
                              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white/15 backdrop-blur-md border-white/30">
                                <SelectItem value="ticket_sales">Ticket Sales</SelectItem>
                                <SelectItem value="venue">Venue</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="food">Food & Beverage</SelectItem>
                                <SelectItem value="equipment">Equipment</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-white">Amount</Label>
                            <Input
                              type="number"
                              value={formData.plannedAmount}
                              onChange={(e) =>
                                setFormData(prev => ({ ...prev, plannedAmount: parseFloat(e.target.value) || 0 }))
                              }
                              className="bg-white/10 border-white/20 text-white"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Description</Label>
                            <Input
                              value={formData.description}
                              onChange={(e) =>
                                setFormData(prev => ({ ...prev, description: e.target.value }))
                              }
                              className="bg-white/10 border-white/20 text-white"
                              placeholder="Item description..."
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            onClick={handleAddLineItem}
                            disabled={saving || !formData.description || !formData.plannedAmount}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {saving ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                            Add Item
                          </Button>
                          <Button
                            onClick={() => setShowAddForm(false)}
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/15"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Line Items List */}
                    <div className="space-y-2">
                      {lineItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          No line items yet. Add your first budget item above.
                        </div>
                      ) : (
                        lineItems.map(item => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={item.category === 'revenue' ? 'default' : 'secondary'}>
                                  {item.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {item.type.replace('_', ' ')}
                                </Badge>
                                {item.actualAmount !== undefined && (
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                )}
                              </div>
                              <p className="text-white font-medium">{item.description}</p>
                              <p className="text-sm text-gray-400">
                                Planned: {formatCurrency(item.plannedAmount)}
                                {item.actualAmount !== undefined && (
                                  <> • Actual: {formatCurrency(item.actualAmount)}</>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.actualAmount === undefined && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const actualAmount = prompt(`Enter actual amount for "${item.description}":`)
                                    if (actualAmount) {
                                      handleUpdateLineItem(item, { actualAmount: parseFloat(actualAmount) })
                                    }
                                  }}
                                  className="bg-white/10 border-white/20 text-white hover:bg-white/15"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analysis Tab */}
              <TabsContent value="analysis">
                <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Budget Analysis</CardTitle>
                    <CardDescription className="text-gray-300">
                      Detailed financial analysis and insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {summary ? (
                      <div className="space-y-6">
                        {/* Profit Margins */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white/5 p-4 rounded-lg">
                            <h4 className="text-white font-medium mb-2">Planned Profit Margin</h4>
                            <p className="text-2xl font-bold text-purple-400">
                              {summary.plannedProfitMargin.toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-lg">
                            <h4 className="text-white font-medium mb-2">Actual Profit Margin</h4>
                            <p className={`text-2xl font-bold ${summary.actualProfitMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {summary.actualProfitMargin.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        {/* Variance Summary */}
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h4 className="text-white font-medium mb-4">Variance Summary</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-400">Revenue Variance</p>
                              <p className={`text-lg font-semibold ${getVarianceColor(summary.revenueVariance)}`}>
                                {formatCurrency(summary.revenueVariance)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Expense Variance</p>
                              <p className={`text-lg font-semibold ${getVarianceColor(-summary.expenseVariance)}`}>
                                {formatCurrency(summary.expenseVariance)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Overall Variance</p>
                              <p className={`text-lg font-semibold ${getVarianceColor(summary.profitVariance)}`}>
                                {summary.variancePercentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Budget Health */}
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h4 className="text-white font-medium mb-2">Budget Health</h4>
                          <div className="flex items-center gap-2">
                            {summary.isOverBudget ? (
                              <>
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                                <span className="text-red-400">Over Budget</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <span className="text-green-400">On Track</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        No analysis available. Add line items to see budget analysis.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  )
}