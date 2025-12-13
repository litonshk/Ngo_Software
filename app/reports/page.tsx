"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Donation {
  id: string
  amount: number
  date: string
  category: string
}

interface Expense {
  id: string
  amount: number
  date: string
  category: string
  status: string
}

export default function ReportsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [donations, setDonations] = useState<Donation[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [period, setPeriod] = useState("all")

  useEffect(() => {
    const auth = localStorage.getItem("ngo_auth")
    if (!auth) {
      router.push("/")
      return
    }

    // Load data
    const savedDonations = localStorage.getItem("ngo_donations")
    const savedExpenses = localStorage.getItem("ngo_expenses")

    if (savedDonations) setDonations(JSON.parse(savedDonations))
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses))

    setIsLoading(false)
  }, [router])

  // Calculate totals
  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const netBalance = totalDonations - totalExpenses

  // Category breakdowns
  const donationsByCategory = donations.reduce(
    (acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + d.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const expensesByCategory = expenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    },
    {} as Record<string, number>,
  )

  // Monthly data
  const getMonthlyData = () => {
    const monthlyDonations: Record<string, number> = {}
    const monthlyExpenses: Record<string, number> = {}

    donations.forEach((d) => {
      const month = new Date(d.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })
      monthlyDonations[month] = (monthlyDonations[month] || 0) + d.amount
    })

    expenses.forEach((e) => {
      const month = new Date(e.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + e.amount
    })

    return { monthlyDonations, monthlyExpenses }
  }

  const { monthlyDonations, monthlyExpenses } = getMonthlyData()

  const handleExport = (type: string) => {
    let csvContent = ""

    if (type === "income") {
      csvContent = "Date,Category,Amount\n"
      donations.forEach((d) => {
        csvContent += `${d.date},${d.category},${d.amount}\n`
      })
    } else if (type === "expenses") {
      csvContent = "Date,Category,Amount,Status\n"
      expenses.forEach((e) => {
        csvContent += `${e.date},${e.category},${e.amount},${e.status}\n`
      })
    } else if (type === "summary") {
      csvContent = "Report Type,Amount\n"
      csvContent += `Total Donations,${totalDonations}\n`
      csvContent += `Total Expenses,${totalExpenses}\n`
      csvContent += `Net Balance,${netBalance}\n`
    }

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ngo_${type}_report_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600 mt-1">Comprehensive financial analysis and insights</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">${totalDonations.toFixed(2)}</div>
              <p className="text-xs text-gray-600 mt-1">{donations.length} donations</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-gray-600 mt-1">{expenses.length} transactions</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Net Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                ${netBalance.toFixed(2)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {netBalance >= 0 ? "Surplus" : "Deficit"} ({((netBalance / totalDonations) * 100).toFixed(1)}%)
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="income">Income Analysis</TabsTrigger>
            <TabsTrigger value="expenses">Expense Analysis</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Income Statement</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleExport("summary")}>
                    Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-700">Total Revenue (Donations)</span>
                      <span className="font-semibold text-emerald-600">${totalDonations.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-700">Total Expenses</span>
                      <span className="font-semibold text-red-600">-${totalExpenses.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 pt-3 border-t-2 border-gray-300">
                      <span className="font-bold text-gray-900">Net Income</span>
                      <span className={`font-bold text-lg ${netBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                        ${netBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Average Donation</span>
                        <span className="font-medium">
                          ${donations.length > 0 ? (totalDonations / donations.length).toFixed(2) : "0.00"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Average Expense</span>
                        <span className="font-medium">
                          ${expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : "0.00"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Expense Ratio</span>
                        <span className="font-medium">
                          {totalDonations > 0 ? ((totalExpenses / totalDonations) * 100).toFixed(1) : "0"}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${Math.min((totalExpenses / totalDonations) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Income by Category</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleExport("income")}>
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {Object.keys(donationsByCategory).length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No income data available</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(donationsByCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                            <span className="font-semibold text-emerald-600">${amount.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${(amount / totalDonations) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {((amount / totalDonations) * 100).toFixed(1)}% of total income
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Expenses by Category</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleExport("expenses")}>
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {Object.keys(expensesByCategory).length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No expense data available</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(expensesByCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                            <span className="font-semibold text-red-600">${amount.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${(amount / totalExpenses) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {((amount / totalExpenses) * 100).toFixed(1)}% of total expenses
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(monthlyDonations).length === 0 && Object.keys(monthlyExpenses).length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No trend data available</p>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-4 font-medium text-gray-700">Month</th>
                            <th className="text-left py-2 px-4 font-medium text-gray-700">Income</th>
                            <th className="text-left py-2 px-4 font-medium text-gray-700">Expenses</th>
                            <th className="text-left py-2 px-4 font-medium text-gray-700">Net</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from(new Set([...Object.keys(monthlyDonations), ...Object.keys(monthlyExpenses)])).map(
                            (month) => {
                              const income = monthlyDonations[month] || 0
                              const expense = monthlyExpenses[month] || 0
                              const net = income - expense
                              return (
                                <tr key={month} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-2 px-4 font-medium text-gray-900">{month}</td>
                                  <td className="py-2 px-4 text-emerald-600">${income.toFixed(2)}</td>
                                  <td className="py-2 px-4 text-red-600">${expense.toFixed(2)}</td>
                                  <td
                                    className={`py-2 px-4 font-semibold ${net >= 0 ? "text-blue-600" : "text-red-600"}`}
                                  >
                                    ${net.toFixed(2)}
                                  </td>
                                </tr>
                              )
                            },
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
