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
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Member {
  id: string
  member_id: string
  name: string
  email: string
  phone: string
  address: string
  join_date: string
  total_savings: number
  total_loans: number
  status: "active" | "inactive"
}

export default function MembersPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const supabase = createClient()

  const generateMemberId = async () => {
    const { count } = await supabase.from("members").select("*", { count: "exact", head: true })
    const nextNumber = ((count || 0) + 1).toString().padStart(4, "0")
    return `MEM${nextNumber}`
  }

  const loadMembers = async () => {
    const { data, error } = await supabase.from("members").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error loading members:", error)
      return
    }

    setMembers(data || [])
  }

  useEffect(() => {
    const auth = localStorage.getItem("ngo_auth")
    if (!auth) {
      router.push("/")
      return
    }

    loadMembers().then(() => setIsLoading(false))
  }, [router])

  const handleAddMember = async () => {
    try {
      if (!formData.name || !formData.email) {
        toast.error("Name and email are required")
        return
      }

      const memberId = await generateMemberId()

      const { error } = await supabase.from("members").insert({
        member_id: memberId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        status: "active",
        join_date: new Date().toISOString(),
      })

      if (error) {
        console.error("[v0] Error adding member:", error)
        toast.error(`Failed to add member: ${error.message}`)
        return
      }

      toast.success(`Member ${formData.name} added successfully!`)
      await loadMembers()
      setFormData({ name: "", email: "", phone: "", address: "" })
      setIsDialogOpen(false)
    } catch (err: any) {
      console.error("[v0] Unexpected error:", err)
      toast.error("An unexpected error occurred")
    }
  }

  const handleDeleteMember = async (id: string) => {
    try {
      const { error } = await supabase.from("members").delete().eq("id", id)

      if (error) {
        console.error("[v0] Error deleting member:", error)
        toast.error(`Failed to delete member: ${error.message}`)
        return
      }

      toast.success("Member deleted successfully")
      await loadMembers()
    } catch (err: any) {
      console.error("[v0] Unexpected error:", err)
      toast.error("An unexpected error occurred")
    }
  }

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.member_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Member Management</h1>
            <p className="text-gray-600 mt-1">Manage member accounts and information</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">Add New Member</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>
                  Enter the member information below. A unique Member ID will be generated automatically.
                </DialogDescription>
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
                <Button 
                  onClick={handleAddMember} 
                  disabled={!formData.name || !formData.email}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Add Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Members ({filteredMembers.length})</CardTitle>
              <Input
                placeholder="Search by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sm:w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No members found. Add your first member to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Member ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Join Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Savings</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Loans</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-mono text-sm font-semibold text-emerald-600">{member.member_id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.address}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-700">{member.email}</div>
                          <div className="text-sm text-gray-500">{member.phone}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{new Date(member.join_date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">${Number(member.total_savings).toFixed(2)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">${Number(member.total_loans).toFixed(2)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={member.status === "active" ? "default" : "secondary"}>{member.status}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
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
