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
import { Badge } from "@/components/ui/badge"

interface Donor {
  id: string
  name: string
  email: string
  phone: string
  address: string
  totalDonations: number
  lastDonation: string
  status: "active" | "inactive"
}

export default function DonorsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [donors, setDonors] = useState<Donor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    const auth = localStorage.getItem("ngo_auth")
    if (!auth) {
      router.push("/")
      return
    }

    // Load donors from localStorage
    const savedDonors = localStorage.getItem("ngo_donors")
    if (savedDonors) {
      setDonors(JSON.parse(savedDonors))
    }
    setIsLoading(false)
  }, [router])

  const handleAddDonor = () => {
    const newDonor: Donor = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      totalDonations: 0,
      lastDonation: "-",
      status: "active",
    }

    const updatedDonors = [...donors, newDonor]
    setDonors(updatedDonors)
    localStorage.setItem("ngo_donors", JSON.stringify(updatedDonors))

    setFormData({ name: "", email: "", phone: "", address: "" })
    setIsDialogOpen(false)
  }

  const handleDeleteDonor = (id: string) => {
    const updatedDonors = donors.filter((donor) => donor.id !== id)
    setDonors(updatedDonors)
    localStorage.setItem("ngo_donors", JSON.stringify(updatedDonors))
  }

  const filteredDonors = donors.filter(
    (donor) =>
      donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Donor Management</h1>
            <p className="text-gray-600 mt-1">Manage your donor database and contacts</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">Add New Donor</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Donor</DialogTitle>
                <DialogDescription>Enter the donor information below</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main St, City, Country"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDonor} disabled={!formData.name || !formData.email}>
                  Add Donor
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Donors ({filteredDonors.length})</CardTitle>
              <Input
                placeholder="Search donors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sm:w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredDonors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No donors found. Add your first donor to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Total Donations</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonors.map((donor) => (
                      <tr key={donor.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{donor.name}</div>
                          <div className="text-sm text-gray-500">{donor.address}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{donor.email}</td>
                        <td className="py-3 px-4 text-gray-700">{donor.phone}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">${donor.totalDonations.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">Last: {donor.lastDonation}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={donor.status === "active" ? "default" : "secondary"}>{donor.status}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDonor(donor.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </td>
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
