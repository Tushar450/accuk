"use client"

import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Search, Plus } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const initialDashboardData = {
  categories: [
    {
      name: "CNAPP Dashboard",
      widgets: [
        {
          id: "cloud-accounts",
          name: "Cloud Accounts",
          type: "pie-chart",
          data: {
            Connected: 2,
            "Not Connected": 0
          }
        },
        {
          id: "cloud-account-risk-assessment",
          name: "Cloud Account Risk Assessment",
          type: "donut-chart",
          data: {
            Failed: 1589,
            Warning: 681,
            "Not Available": 386,
            Passed: 7253
          }
        }
      ]
    },
    {
      name: "CWPP Dashboard",
      widgets: [
        {
          id: "top-5-namespace-specific-alerts",
          name: "Top 5 Namespace Specific Alerts",
          type: "bar-chart",
          data: {
            "Namespace 1": 5,
            "Namespace 2": 4,
            "Namespace 3": 3,
            "Namespace 4": 2,
            "Namespace 5": 1
          }
        },
        {
          id: "workload-alerts",
          name: "Workload Alerts",
          type: "bar-chart",
          data: {
            Critical: 10,
            High: 20,
            Medium: 30,
            Low: 40
          }
        }
      ]
    },
    {
      name: "Registry Scan",
      widgets: [
        {
          id: "image-risk-assessment",
          name: "Image Risk Assessment",
          type: "bar-chart",
          data: {
            Critical: 5,
            High: 150,
            Medium: 300,
            Low: 500
          }
        },
        {
          id: "image-security-issues",
          name: "Image Security Issues",
          type: "stacked-bar-chart",
          data: {
            Critical: 2,
            High: 2,
            Medium: 5,
            Low: 10
          }
        }
      ]
    }
  ]
}

const Widget = ({ widget }) => {
  switch (widget.type) {
    case 'pie-chart':
    case 'donut-chart':
      const data = Object.entries(widget.data).map(([name, value]) => ({ name, value }))
      return (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={widget.type === 'donut-chart' ? 60 : 0}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )
    case 'bar-chart':
    case 'stacked-bar-chart':
      const barData = Object.entries(widget.data).map(([name, value]) => ({ name, value }))
      return (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      )
    default:
      return <div>Unsupported widget type</div>
  }
}

export function DashboardComponent() {
  const [categories, setCategories] = useState(initialDashboardData.categories)
  const [searchTerm, setSearchTerm] = useState("")
  const [lastDays, setLastDays] = useState("7")
  const [filteredCategories, setFilteredCategories] = useState(categories)
  const [newWidgetName, setNewWidgetName] = useState("")
  const [newWidgetType, setNewWidgetType] = useState("bar-chart")
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    const filtered = categories.map(category => ({
      ...category,
      widgets: category.widgets.filter(widget =>
        widget.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.widgets.length > 0)
    setFilteredCategories(filtered)
  }, [categories, searchTerm])

  const addWidget = (categoryIndex) => {
    const newWidget = {
      id: `new-widget-${Date.now()}`,
      name: newWidgetName,
      type: newWidgetType,
      data: {}
    }
    const newCategories = [...categories]
    newCategories[categoryIndex].widgets.push(newWidget)
    setCategories(newCategories)
    setNewWidgetName("")
    setNewWidgetType("bar-chart")
    setSelectedCategory(null)
  }

  const removeWidget = (categoryIndex, widgetIndex) => {
    const newCategories = [...categories]
    newCategories[categoryIndex].widgets.splice(widgetIndex, 1)
    setCategories(newCategories)
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search widgets..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={lastDays} onValueChange={setLastDays}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {filteredCategories.map((category, categoryIndex) => (
        <div key={category.name} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{category.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.widgets.map((widget, widgetIndex) => (
              <div key={widget.id} className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">{widget.name}</h3>
                <Widget widget={widget} />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeWidget(categoryIndex, widgetIndex)}
                  className="mt-2"
                >
                  Remove Widget
                </Button>
              </div>
            ))}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-full min-h-[200px] flex flex-col items-center justify-center"
                  onClick={() => setSelectedCategory(categoryIndex)}
                >
                  <Plus className="h-6 w-6 mb-2" />
                  Add Widget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Widget</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newWidgetName}
                      onChange={(e) => setNewWidgetName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select
                      value={newWidgetType}
                      onValueChange={setNewWidgetType}
                    >
                      <SelectTrigger className="w-[180px] col-span-3">
                        <SelectValue placeholder="Select widget type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar-chart">Bar Chart</SelectItem>
                        <SelectItem value="pie-chart">Pie Chart</SelectItem>
                        <SelectItem value="donut-chart">Donut Chart</SelectItem>
                        <SelectItem value="stacked-bar-chart">Stacked Bar Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={() => addWidget(selectedCategory)}>Add Widget</Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ))}
    </div>
  )
}