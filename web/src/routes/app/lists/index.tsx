import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, ShoppingBag, CheckSquare, Briefcase, FileText, Archive, CheckCircle } from 'lucide-react'
import { useLists } from '@/hooks/useLists'
import { useListsRealtime } from '@/hooks/useListsRealtime'
import { useListItemCounts } from '@/hooks/useListItemCounts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ListsTypeOptions, ListsStatusOptions } from '@/types/pocketbase-types'

export const Route = createFileRoute('/app/lists/')({
  component: ListsPage,
})

function ListsPage() {
  const { lists, isLoading, createList, isCreating } = useLists()

  // Enable realtime updates for lists
  useListsRealtime()

  // Get item counts for all lists
  const itemCounts = useListItemCounts(lists.map((l) => l.id))

  const [filter, setFilter] = useState<ListsStatusOptions | 'all'>('active' as ListsStatusOptions)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListType, setNewListType] = useState<ListsTypeOptions>('shopping' as ListsTypeOptions)

  const filteredLists = filter === 'all'
    ? lists
    : lists.filter((list) => list.status === filter)

  const handleCreateList = () => {
    if (!newListName.trim()) return

    createList(
      { name: newListName.trim(), type: newListType as ListsTypeOptions },
      {
        onSuccess: () => {
          setNewListName('')
          setNewListType('shopping' as ListsTypeOptions)
          setCreateDialogOpen(false)
        },
      }
    )
  }

  const getTypeIcon = (type: ListsTypeOptions) => {
    switch (type) {
      case 'shopping':
        return <ShoppingBag className="h-5 w-5" />
      case 'todo':
        return <CheckSquare className="h-5 w-5" />
      case 'packing':
        return <Briefcase className="h-5 w-5" />
      case 'custom':
        return <FileText className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: ListsTypeOptions) => {
    switch (type) {
      case 'shopping':
        return '#b4dbfa'
      case 'todo':
        return '#dad4fc'
      case 'packing':
        return '#fadeaf'
      case 'custom':
        return '#f8d5f4'
      default:
        return '#b4dbfa'
    }
  }

  const getStatusBadge = (status: ListsStatusOptions) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>
      case 'archived':
        return <Badge variant="outline">Archived</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground font-semibold">Loading lists...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Colored header matching mobile Lists page (lavender) */}
      <div className="bg-[#dad4fc] border-b-2 border-black px-6 py-6 dark:border-white/25">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-black">Lists</h1>
            <p className="text-black/60 font-medium">Manage your family's shopping, todo, and packing lists</p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white border-black hover:bg-black/80">
                <Plus className="h-4 w-4 mr-2" />
                New List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New List</DialogTitle>
                <DialogDescription>
                  Create a new list to share with your family
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">List Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Weekly Groceries"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateList()
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="type">List Type</Label>
                  <Select
                    value={newListType}
                    onValueChange={(value) => setNewListType(value as ListsTypeOptions)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shopping">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4" />
                          Shopping
                        </div>
                      </SelectItem>
                      <SelectItem value="todo">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-4 w-4" />
                          Todo
                        </div>
                      </SelectItem>
                      <SelectItem value="packing">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Packing
                        </div>
                      </SelectItem>
                      <SelectItem value="custom">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Custom
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateList} disabled={isCreating || !newListName.trim()}>
                    {isCreating ? 'Creating...' : 'Create List'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Filter tabs */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active' as ListsStatusOptions)}
          >
            Active ({lists.filter((l) => l.status === 'active').length})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed' as ListsStatusOptions)}
          >
            Completed ({lists.filter((l) => l.status === 'completed').length})
          </Button>
          <Button
            variant={filter === 'archived' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('archived' as ListsStatusOptions)}
          >
            <Archive className="h-4 w-4 mr-1" />
            Archived ({lists.filter((l) => l.status === 'archived').length})
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({lists.length})
          </Button>
        </div>

        {/* Lists grid */}
        {filteredLists.length === 0 ? (
          <div className="rounded-2xl border-2 border-black p-12 flex flex-col items-center justify-center dark:border-white/25">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center font-medium">
              {filter === 'active'
                ? 'No active lists. Create your first list to get started!'
                : `No ${filter} lists`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLists.map((list) => (
              <Link key={list.id} to={`/app/lists/${list.id}`}>
                <div
                  className="rounded-2xl border-2 border-black p-5 cursor-pointer hover:opacity-80 transition-opacity dark:border-white/25"
                  style={{ backgroundColor: getTypeColor(list.type) }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(list.type)}
                      <div>
                        <h3 className="text-lg font-bold text-black">{list.name}</h3>
                        <p className="text-black/60 text-sm font-medium capitalize">{list.type}</p>
                      </div>
                    </div>
                    {getStatusBadge(list.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-black/60 font-medium">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        {itemCounts.get(list.id)?.checked ?? 0} / {itemCounts.get(list.id)?.total ?? 0} items
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
