"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

interface Donation {
  id: string
  donorName: string
  amount: number
  date: string
}

interface Expense {
  id: string
  description: string
  amount: number
  date: string
}

interface Donor {
  id: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [donations, setDonations] = useState<Donation[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [donors, setDonors] = useState<Donor[]>([])

  useEffect(() => {
    const auth = localStorage.getItem("ngo_auth")
    if (!auth) {
      router.push("/")
      return
    }

    const savedDonations = localStorage.getItem("ngo_donations")
    const savedExpenses = localStorage.getItem("ngo_expenses")
    const savedDonors = localStorage.getItem("ngo_donors")

    if (savedDonations) setDonations(JSON.parse(savedDonations))
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses))
    if (savedDonors) setDonors(JSON.parse(savedDonors))

    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const netBalance = totalDonations - totalExpenses
  const activeDonors = donors.length

  const stats = [
    {
      title: "Total Donations",
      value: `$${totalDonations.toFixed(2)}`,
      change: donations.length > 0 ? `${donations.length} donations` : "+0%",
      icon: "💰",
    },
    {
      title: "Active Donors",
      value: activeDonors.toString(),
      change: `${activeDonors} registered`,
      icon: "👥",
    },
    {
      title: "Total Expenses",
      value: `$${totalExpenses.toFixed(2)}`,
      change: expenses.length > 0 ? `${expenses.length} transactions` : "-0%",
      icon: "📊",
    },
    {
      title: "Net Balance",
      value: `$${netBalance.toFixed(2)}`,
      change: netBalance >= 0 ? "Surplus" : "Deficit",
      icon: "💵",
    },
  ]

  const recentDonations = donations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  const recentExpenses = expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your NGO financial activities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <span className="text-2xl">{stat.icon}</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-600 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
            </CardHeader>
            <CardContent>
              {recentDonations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No donations yet. Add your first donation from the Donations page.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">{donation.donorName}</div>
                        <div className="text-sm text-gray-500">{new Date(donation.date).toLocaleDateString()}</div>
                      </div>
                      <div className="font-semibold text-emerald-600">${donation.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {recentExpenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No expenses yet. Track your first expense from the Expenses page.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">{expense.description}</div>
                        <div className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</div>
                      </div>
                      <div className="font-semibold text-red-600">${expense.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
