"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Donation {
  id: string
  donorId: string
  donorName: string
  amount: number
  date: string
  method: string
  category: string
  notes: string
}

interface Donor {
  id: string
  name: string
  email: string
}

export default function DonationsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [donations, setDonations] = useState<Donation[]>([])
  const [donors, setDonors] = useState<Donor[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    donorId: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    method: "cash",
    category: "general",
    notes: "",
  })

  useEffect(() => {
    const auth = localStorage.getItem("ngo_auth")
    if (!auth) {
      router.push("/")
      return
    }

    // Load donations and donors
    const savedDonations = localStorage.getItem("ngo_donations")
    const savedDonors = localStorage.getItem("ngo_donors")

    if (savedDonations) {
      setDonations(JSON.parse(savedDonations))
    }
    if (savedDonors) {
      setDonors(JSON.parse(savedDonors))
    }
    setIsLoading(false)
  }, [router])

  const handleAddDonation = () => {
    const donor = donors.find((d) => d.id === formData.donorId)
    if (!donor) return

    const newDonation: Donation = {
      id: Date.now().toString(),
      donorId: formData.donorId,
      donorName: donor.name,
      amount: Number.parseFloat(formData.amount),
      date: formData.date,
      method: formData.method,
      category: formData.category,
      notes: formData.notes,
    }

    const updatedDonations = [...donations, newDonation]
    setDonations(updatedDonations)
    localStorage.setItem("ngo_donations", JSON.stringify(updatedDonations))

    // Update donor's total donations
    const updatedDonors = donors.map((d) => {
      if (d.id === formData.donorId) {
        const donorDonations = updatedDonations.filter((don) => don.donorId === d.id)
        const total = donorDonations.reduce((sum, don) => sum + don.amount, 0)
        return {
          ...d,
          totalDonations: total,
          lastDonation: formData.date,
        }
      }
      return d
    })
    localStorage.setItem("ngo_donors", JSON.stringify(updatedDonors))
    setDonors(updatedDonors)

    setFormData({
      donorId: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      method: "cash",
      category: "general",
      notes: "",
    })
    setIsDialogOpen(false)
  }

  const totalDonations = donations.reduce((sum, donation) => sum + donation.amount, 0)

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Donation Processing</h1>
            <p className="text-gray-600 mt-1">Track and manage all incoming donations</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">Record Donation</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record New Donation</DialogTitle>
                <DialogDescription>Enter the donation details below</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="donor">Select Donor</Label>
                  <Select
                    value={formData.donorId}
                    onValueChange={(value) => setFormData({ ...formData, donorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a donor" />
                    </SelectTrigger>
                    <SelectContent>
                      {donors.map((donor) => (
                        <SelectItem key={donor.id} value={donor.id}>
                          {donor.name} - {donor.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {donors.length === 0 && (
                    <p className="text-sm text-gray-500">No donors available. Add a donor first.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="100.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select
                    value={formData.method}
                    onValueChange={(value) => setFormData({ ...formData, method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Fund</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="emergency">Emergency Relief</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional information"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDonation} disabled={!formData.donorId || !formData.amount}>
                  Record Donation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${totalDonations.toFixed(2)}</div>
              <p className="text-xs text-gray-600 mt-1">{donations.length} transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$0.00</div>
              <p className="text-xs text-gray-600 mt-1">0 transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Donation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${donations.length > 0 ? (totalDonations / donations.length).toFixed(2) : "0.00"}
              </div>
              <p className="text-xs text-gray-600 mt-1">Per transaction</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No donations recorded yet. Add your first donation to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Donor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Method</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((donation) => (
                        <tr key={donation.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700">{new Date(donation.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-medium text-gray-900">{donation.donorName}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-emerald-600">${donation.amount.toFixed(2)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{donation.method.replace("_", " ")}</Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-700">{donation.category}</td>
                          <td className="py-3 px-4 text-gray-600 text-sm">{donation.notes || "-"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
