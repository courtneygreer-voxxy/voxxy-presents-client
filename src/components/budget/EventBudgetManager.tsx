import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  CheckCircle,
  Save,
  X
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  preSelectedEventId?: string | null
}

export default function EventBudgetManager({ events, organizationId, preSelectedEventId }: EventBudgetManagerProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [budget, setBudget] = useState<Budget | null>(null)
  const [lineItems, setLineItems] = useState<BudgetLineItem[]>([])
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eventBudgets, setEventBudgets] = useState<Record<string, boolean>>({})

  // Line item form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetLineItem | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<BudgetLineItem>>({})
  const [formData, setFormData] = useState<Partial<CreateBudgetLineItemRequest>>({
    category: 'expense',
    type: 'venue',
    description: '',
    plannedAmount: 0,
    notes: ''
  })

  // Events available for budgeting (exclude only drafts and cancelled)
  const publishedEvents = events.filter(event =>
    event.status !== 'draft' && event.status !== 'cancelled'
  )

  // Load budget status for all events on mount
  useEffect(() => {
    async function checkEventBudgets() {
      const dataSource = getDataSource()
      if (dataSource !== 'api') return

      const budgetStatus: Record<string, boolean> = {}

      for (const event of publishedEvents) {
        try {
          const response = await budgetsApi.getEventBudget(event.id)
          budgetStatus[event.id] = !!response.budget
        } catch (err: any) {
          budgetStatus[event.id] = false
        }
      }

      setEventBudgets(budgetStatus)
    }

    if (publishedEvents.length > 0) {
      checkEventBudgets()
    }
  }, [publishedEvents.length])

  // Handle pre-selected event
  useEffect(() => {
    if (preSelectedEventId && publishedEvents.length > 0) {
      const event = publishedEvents.find(e => e.id === preSelectedEventId)
      if (event && event.id !== selectedEvent?.id) {
        setSelectedEvent(event)
      }
    }
  }, [preSelectedEventId, publishedEvents])

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

        // Update event budgets state
        setEventBudgets(prev => ({ ...prev, [selectedEvent.id]: true }))

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

  const handleDeleteLineItem = async (lineItem: BudgetLineItem) => {
    if (!confirm(`Delete "${lineItem.description}"?`)) return

    setSaving(true)
    setError(null)

    try {
      const dataSource = getDataSource()

      if (dataSource === 'api') {
        await budgetsApi.deleteLineItem(lineItem.id)
        setLineItems(prev => prev.filter(item => item.id !== lineItem.id))

        // Refresh summary
        if (budget) {
          const summaryResponse = await budgetsApi.getBudgetSummary(budget.id)
          setSummary(summaryResponse.summary)
        }
      }
    } catch (err) {
      console.error('Failed to delete line item:', err)
      setError('Failed to delete line item')
    } finally {
      setSaving(false)
    }
  }

  const startEditingLineItem = (lineItem: BudgetLineItem) => {
    setEditingItemId(lineItem.id)
    setEditFormData({
      category: lineItem.category,
      type: lineItem.type,
      description: lineItem.description,
      plannedAmount: lineItem.plannedAmount,
      actualAmount: lineItem.actualAmount,
      notes: lineItem.notes
    })
  }

  const cancelEditingLineItem = () => {
    setEditingItemId(null)
    setEditFormData({})
  }

  const saveEditingLineItem = async () => {
    if (!editingItemId) return

    setSaving(true)
    setError(null)

    try {
      const dataSource = getDataSource()

      if (dataSource === 'api') {
        const response = await budgetsApi.updateLineItem(editingItemId, editFormData as UpdateBudgetLineItemRequest)
        setLineItems(prev => prev.map(item =>
          item.id === editingItemId ? response.lineItem : item
        ))

        // Refresh summary
        if (budget) {
          const summaryResponse = await budgetsApi.getBudgetSummary(budget.id)
          setSummary(summaryResponse.summary)
        }

        setEditingItemId(null)
        setEditFormData({})
      }
    } catch (err) {
      console.error('Failed to save line item:', err)
      setError('Failed to save line item')
    } finally {
      setSaving(false)
    }
  }

  const generateTemplateBudget = async () => {
    if (!budget) return

    setSaving(true)
    setError(null)

    try {
      const dataSource = getDataSource()

      if (dataSource === 'api') {
        // Define template line items for a typical social club event
        const templateItems: Partial<CreateBudgetLineItemRequest>[] = [
          // Revenue
          { category: 'revenue', type: 'ticket_sales', description: 'Ticket Sales', plannedAmount: 1000, notes: 'Expected ticket revenue' },

          // Expenses
          { category: 'expense', type: 'venue', description: 'Venue Rental', plannedAmount: 300, notes: 'Venue rental fee' },
          { category: 'expense', type: 'food', description: 'Catering & Food', plannedAmount: 250, notes: 'Food and beverage costs' },
          { category: 'expense', type: 'staff', description: 'Entertainment/Performers', plannedAmount: 200, notes: 'DJ, musicians, or entertainment' },
          { category: 'expense', type: 'staff', description: 'Event Staff', plannedAmount: 150, notes: 'Security, servers, coordinators' },
          { category: 'expense', type: 'equipment', description: 'Audio/Visual Equipment', plannedAmount: 100, notes: 'Sound system, lighting, etc.' },
          { category: 'expense', type: 'marketing', description: 'Marketing & Promotion', plannedAmount: 75, notes: 'Ads, flyers, social media promotion' },
          { category: 'expense', type: 'other', description: 'Supplies & Decorations', plannedAmount: 50, notes: 'Event supplies, decorations, materials' },
          { category: 'expense', type: 'other', description: 'Insurance & Permits', plannedAmount: 25, notes: 'Event insurance and permits' },
        ]

        // Add all template items
        for (const item of templateItems) {
          const response = await budgetsApi.addLineItem(budget.id, item)
          setLineItems(prev => [...prev, response.lineItem])
        }

        // Refresh summary
        const summaryResponse = await budgetsApi.getBudgetSummary(budget.id)
        setSummary(summaryResponse.summary)
      }
    } catch (err) {
      console.error('Failed to generate template budget:', err)
      setError('Failed to generate template budget')
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
            Choose an event to create and manage its budget. Click on an event card below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {publishedEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">No events available for budgeting</p>
              <p className="text-gray-400 text-sm">
                Create an event in the Events tab to get started with budget management.
              </p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-400 mb-4">
                📊 {publishedEvents.length} event{publishedEvents.length !== 1 ? 's' : ''} available for budget management
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publishedEvents.map(event => {
                  const isSelected = selectedEvent?.id === event.id
                  return (
                    <Card
                      key={event.id}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        isSelected
                          ? '!bg-purple-500/20 !border-purple-400/50 ring-2 ring-purple-400/50'
                          : '!bg-white/5 !border-white/10 hover:!bg-white/10'
                      }`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          <h3 className="font-semibold text-white text-sm line-clamp-2">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={event.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                                {event.status}
                              </Badge>
                              {eventBudgets[event.id] && (
                                <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                                  In Progress
                                </Badge>
                              )}
                            </div>
                            {isSelected && (
                              <CheckCircle className="h-4 w-4 text-purple-400" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
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
            <>
              <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Budget for</p>
                      <h3 className="text-lg font-semibold text-white">{selectedEvent.title}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="!bg-purple-500/10 !border-purple-400/30 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <DollarSign className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-purple-300 mb-3">
                    No Budget Found
                  </h3>
                  <p className="text-purple-200 mb-6">
                    Create a budget for this event to start tracking expenses and revenue.
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
            </>
          ) : (
            /* Budget Management */
            <>
              <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Budget for</p>
                      <h3 className="text-lg font-semibold text-white">{selectedEvent.title}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-white/10 border border-white/20">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="budget-table" className="data-[state=active]:bg-white/20">
                  Budget Table
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

              {/* Budget Table Tab */}
              <TabsContent value="budget-table">
                <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">Budget Table</CardTitle>
                        <CardDescription className="text-gray-300">
                          Manage your event budget in a familiar spreadsheet format
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={generateTemplateBudget}
                          disabled={saving}
                          variant="outline"
                          className="bg-white/5 border-white/20 hover:bg-white/10 text-white"
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Generate Template
                        </Button>
                        <Button
                          onClick={() => setShowAddForm(true)}
                          disabled={saving}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Line Item
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Add Form */}
                    {showAddForm && (
                      <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="text-white font-medium mb-4">Add New Line Item</h4>
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
                          <div>
                            <Label className="text-white">Planned Amount</Label>
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

                    {/* Excel-Style Budget Table */}
                    <div className="border border-white/20 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-white/5 border-white/20 hover:bg-white/5">
                            <TableHead className="text-white font-semibold">Category</TableHead>
                            <TableHead className="text-white font-semibold">Type</TableHead>
                            <TableHead className="text-white font-semibold">Description</TableHead>
                            <TableHead className="text-white font-semibold text-right">Planned Amount</TableHead>
                            <TableHead className="text-white font-semibold text-right">Actual Amount</TableHead>
                            <TableHead className="text-white font-semibold text-right">Variance</TableHead>
                            <TableHead className="text-white font-semibold text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lineItems.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                                No budget items yet. Click "Add Line Item" to get started.
                              </TableCell>
                            </TableRow>
                          ) : (
                            lineItems.map((item) => {
                              const variance = item.actualAmount !== undefined ? item.actualAmount - item.plannedAmount : 0
                              const isCompleted = item.actualAmount !== undefined
                              const isEditing = editingItemId === item.id

                              return (
                                <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                                  {/* Category */}
                                  <TableCell className="text-white">
                                    {isEditing ? (
                                      <Select
                                        value={editFormData.category}
                                        onValueChange={(value: 'revenue' | 'expense') =>
                                          setEditFormData(prev => ({ ...prev, category: value }))
                                        }
                                      >
                                        <SelectTrigger className="bg-white/10 border-white/20 text-white h-8 w-28">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white/15 backdrop-blur-md border-white/30">
                                          <SelectItem value="revenue">Revenue</SelectItem>
                                          <SelectItem value="expense">Expense</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <Badge variant={item.category === 'revenue' ? 'default' : 'secondary'} className="text-xs">
                                        {item.category}
                                      </Badge>
                                    )}
                                  </TableCell>

                                  {/* Type */}
                                  <TableCell className="text-gray-300 text-sm">
                                    {isEditing ? (
                                      <Select
                                        value={editFormData.type}
                                        onValueChange={(value) =>
                                          setEditFormData(prev => ({ ...prev, type: value as any }))
                                        }
                                      >
                                        <SelectTrigger className="bg-white/10 border-white/20 text-white h-8 w-32">
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
                                    ) : (
                                      item.type.replace('_', ' ')
                                    )}
                                  </TableCell>

                                  {/* Description */}
                                  <TableCell className="text-white font-medium">
                                    {isEditing ? (
                                      <Input
                                        value={editFormData.description}
                                        onChange={(e) =>
                                          setEditFormData(prev => ({ ...prev, description: e.target.value }))
                                        }
                                        className="bg-white/10 border-white/20 text-white h-8"
                                        placeholder="Description..."
                                      />
                                    ) : (
                                      item.description
                                    )}
                                  </TableCell>

                                  {/* Planned Amount */}
                                  <TableCell className="text-right">
                                    {isEditing ? (
                                      <Input
                                        type="number"
                                        value={editFormData.plannedAmount || ''}
                                        onChange={(e) =>
                                          setEditFormData(prev => ({ ...prev, plannedAmount: parseFloat(e.target.value) || 0 }))
                                        }
                                        className="bg-white/10 border-white/20 text-white text-right font-mono h-8 w-24 ml-auto"
                                        placeholder="0.00"
                                      />
                                    ) : (
                                      <span className="font-mono text-white">{formatCurrency(item.plannedAmount)}</span>
                                    )}
                                  </TableCell>

                                  {/* Actual Amount */}
                                  <TableCell className="text-right">
                                    <Input
                                      type="number"
                                      value={isEditing ? (editFormData.actualAmount || '') : (item.actualAmount || '')}
                                      onChange={(e) => {
                                        const actualAmount = parseFloat(e.target.value) || undefined
                                        if (isEditing) {
                                          setEditFormData(prev => ({ ...prev, actualAmount }))
                                        } else {
                                          handleUpdateLineItem(item, { actualAmount })
                                        }
                                      }}
                                      className="bg-white/10 border-white/20 text-white text-right font-mono h-8 w-24 ml-auto"
                                      placeholder="0.00"
                                    />
                                  </TableCell>

                                  {/* Variance */}
                                  <TableCell className="text-right">
                                    {isCompleted ? (
                                      <span className={`font-mono text-sm ${getVarianceColor(variance)}`}>
                                        {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 text-sm">-</span>
                                    )}
                                  </TableCell>

                                  {/* Actions */}
                                  <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      {isEditing ? (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={saveEditingLineItem}
                                            disabled={saving}
                                            className="bg-green-600/20 border-green-400/30 text-green-300 hover:bg-green-600/30 hover:text-green-200 h-8 w-8 p-0"
                                          >
                                            <Save className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={cancelEditingLineItem}
                                            disabled={saving}
                                            className="bg-gray-600/20 border-gray-400/30 text-gray-300 hover:bg-gray-600/30 hover:text-gray-200 h-8 w-8 p-0"
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => startEditingLineItem(item)}
                                            disabled={saving}
                                            className="bg-blue-600/20 border-blue-400/30 text-blue-300 hover:bg-blue-600/30 hover:text-blue-200 h-8 w-8 p-0"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeleteLineItem(item)}
                                            disabled={saving}
                                            className="bg-red-600/20 border-red-400/30 text-red-300 hover:bg-red-600/30 hover:text-red-200 h-8 w-8 p-0"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Summary Row */}
                    {lineItems.length > 0 && summary && (
                      <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/20">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Total Planned</p>
                            <p className="text-white font-semibold font-mono">
                              {formatCurrency(summary.plannedRevenue - summary.plannedExpenses)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Total Actual</p>
                            <p className="text-white font-semibold font-mono">
                              {formatCurrency(summary.actualRevenue - summary.actualExpenses)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Total Variance</p>
                            <p className={`font-semibold font-mono ${getVarianceColor(summary.profitVariance)}`}>
                              {summary.profitVariance >= 0 ? '+' : ''}{formatCurrency(summary.profitVariance)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Completion</p>
                            <p className="text-white font-semibold">
                              {summary.completedLineItems} / {summary.totalLineItems} items
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
            </>
          )}
        </>
      )}
    </div>
  )
}