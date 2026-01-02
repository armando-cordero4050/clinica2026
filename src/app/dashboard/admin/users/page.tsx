'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createUser, updateUserRole, getAllUsers, changeUserPassword } from '@/modules/core/actions/users'
import { CheckCircle2, XCircle, UserPlus, Shield } from 'lucide-react'

const ROLES = [
  { value: 'super_admin', label: 'Super Admin', color: 'bg-red-500' },
  { value: 'clinic_admin', label: 'Clinic Admin', color: 'bg-blue-500' },
  { value: 'doctor', label: 'Doctor', color: 'bg-green-500' },
  { value: 'lab_admin', label: 'Lab Admin', color: 'bg-orange-500' },
  { value: 'lab_staff', label: 'Lab Staff', color: 'bg-yellow-500' },
  { value: 'courier', label: 'Courier', color: 'bg-purple-500' },
  { value: 'patient', label: 'Patient', color: 'bg-gray-500' },
]

export default function UsersAdminPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [roleUpdateMessage, setRoleUpdateMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>('')
  const [users, setUsers] = useState<Array<{
    id: string
    email: string
    role: string
    is_active: boolean
    created_at: string
    last_sign_in_at: string | null
    is_online: boolean
  }>>([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  const loadUsers = async () => {
    setLoadingUsers(true)
    const result = await getAllUsers()
    if (result.success) {
      setUsers(result.data)
    }
    setLoadingUsers(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (roleUpdateMessage) {
      const timer = setTimeout(() => {
        setRoleUpdateMessage(null)
      }, 3000) // Hide after 3 seconds
      return () => clearTimeout(timer)
    }
  }, [roleUpdateMessage])

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const form = e.currentTarget // Store reference before async operation
    
    const result = await createUser(formData)

    if (result.success) {
      setStatus('success')
      setMessage(result.message)
      form.reset() // Use stored reference
      loadUsers() // Refresh user list
    } else {
      setStatus('error')
      setMessage(result.message)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string, userEmail: string) => {
    const result = await updateUserRole(userId, newRole)
    if (result.success) {
      setRoleUpdateMessage({ type: 'success', text: `Role updated for ${userEmail}` })
      loadUsers()
    } else {
      setRoleUpdateMessage({ type: 'error', text: result.message })
    }
  }

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedUserId) return

    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get('newPassword') as string

    const result = await changeUserPassword(selectedUserId, newPassword)
    
    if (result.success) {
      setRoleUpdateMessage({ type: 'success', text: `Password updated for ${selectedUserEmail}` })
      setPasswordDialogOpen(false)
      setSelectedUserId(null)
      setSelectedUserEmail('')
    } else {
      setRoleUpdateMessage({ type: 'error', text: result.message })
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-red-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Create and manage system users and their roles</p>
        </div>
      </div>

      {/* Role Update Toast Notification */}
      {roleUpdateMessage && (
        <Alert className={roleUpdateMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
          {roleUpdateMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <AlertDescription>{roleUpdateMessage.text}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Create User Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Create New User
            </CardTitle>
            <CardDescription>
              Add a new user to the system with a specific role
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateUser}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <Select name="role" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {status === 'success' && (
                <Alert className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {status === 'error' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={status === 'loading'} className="w-full">
                {status === 'loading' ? 'Creating User...' : 'Create User'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Users</CardTitle>
            <CardDescription>
              Manage roles, passwords, and permissions for existing users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="text-center py-8 text-muted-foreground">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Select
                            defaultValue={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value, user.email)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Badge className={user.is_online ? 'bg-green-500' : 'bg-gray-400'}>
                            {user.is_online ? 'Online' : 'Offline'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.is_active ? (
                            <Badge className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUserId(user.id)
                              setSelectedUserEmail(user.email)
                              setPasswordDialogOpen(true)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Change password</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                              <path d="m15 5 4 4"/>
                            </svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUserEmail}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
