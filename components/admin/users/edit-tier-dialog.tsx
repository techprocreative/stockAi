'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Edit } from 'lucide-react'

interface EditTierDialogProps {
  userId: string
  currentTier: string
}

export function EditTierDialog({ userId, currentTier }: EditTierDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState(currentTier)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSave = async () => {
    if (selectedTier === currentTier) {
      setOpen(false)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${userId}/tier`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_tier: selectedTier }),
      })

      if (!response.ok) {
        throw new Error('Failed to update tier')
      }

      toast({
        title: 'Success',
        description: 'User tier updated successfully',
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user tier',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-brutal">
          <Edit className="h-4 w-4 mr-2" />
          Edit Tier
        </Button>
      </DialogTrigger>
      <DialogContent className="border-brutal">
        <DialogHeader>
          <DialogTitle>Edit Subscription Tier</DialogTitle>
          <DialogDescription>
            Change the user's subscription tier. This will affect their access
            permissions and chat limits.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tier">Subscription Tier</Label>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger id="tier" className="border-brutal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="whale">Whale</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="border-brutal"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="border-brutal shadow-brutal-sm"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
