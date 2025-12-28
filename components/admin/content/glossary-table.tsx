'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Search } from 'lucide-react'

export function GlossaryTable() {
  const [terms, setTerms] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchTerms()
  }, [])

  const fetchTerms = async () => {
    try {
      const response = await fetch('/api/admin/glossary')
      const data = await response.json()
      setTerms(data.terms || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load glossary terms',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this term?')) return

    try {
      const response = await fetch(`/api/admin/glossary?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      toast({
        title: 'Success',
        description: 'Term deleted successfully',
      })

      fetchTerms()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete term',
        variant: 'destructive',
      })
    }
  }

  const filteredTerms = terms.filter((term) =>
    term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-brutal pl-10"
          />
        </div>
        <Button className="border-brutal shadow-brutal-sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Term
        </Button>
      </div>

      <div className="border-brutal shadow-brutal bg-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b-4 border-border">
              <TableHead className="font-bold">Term</TableHead>
              <TableHead className="font-bold">Definition</TableHead>
              <TableHead className="font-bold">Category</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredTerms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No glossary terms found
                </TableCell>
              </TableRow>
            ) : (
              filteredTerms.map((term) => (
                <TableRow key={term.id} className="border-b-2 border-border">
                  <TableCell className="font-medium">{term.term}</TableCell>
                  <TableCell className="text-muted-foreground max-w-md truncate">
                    {term.definition}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-brutal capitalize">
                      {term.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(term.id)}
                      className="border-brutal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
