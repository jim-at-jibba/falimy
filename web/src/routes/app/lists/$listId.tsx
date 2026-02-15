import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, MoreVertical, Trash2, Archive, Check, Plus } from 'lucide-react'
import { useListItems } from '@/hooks/useListItems'
import { useLists } from '@/hooks/useLists'
import { useListsRealtime, useListItemsRealtime } from '@/hooks/useListsRealtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export const Route = createFileRoute('/app/lists/$listId')({
  component: ListDetailPage,
})

function ListDetailPage() {
  const { listId } = Route.useParams()
  const navigate = useNavigate()
  const { lists } = useLists()
  const {
    uncheckedItems,
    checkedItems,
    isLoading,
    createItem,
    isCreating,
    toggleChecked,
    deleteItem,
  } = useListItems(listId)

  // Enable realtime updates for lists and items
  useListsRealtime()
  useListItemsRealtime(listId)

  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)

  // Find the current list
  const list = lists.find((l) => l.id === listId)

  const handleAddItem = () => {
    if (!newItemName.trim()) return

    createItem(
      {
        name: newItemName.trim(),
        quantity: newItemQuantity.trim() || undefined,
      },
      {
        onSuccess: () => {
          setNewItemName('')
          setNewItemQuantity('')
        },
      }
    )
  }

  const handleToggleItem = (itemId: string, checked: boolean | string) => {
    toggleChecked({ itemId, checked: checked as boolean })
  }

  const handleDeleteItem = () => {
    if (!itemToDelete) return
    deleteItem(itemToDelete, {
      onSuccess: () => {
        setItemToDelete(null)
        setDeleteDialogOpen(false)
      },
    })
  }

  const handleArchiveList = () => {
    // TODO: Implement archiveList mutation
    toast.success('List archived')
    setArchiveDialogOpen(false)
    navigate({ to: '/app/lists' })
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Loading list...</div>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="p-6">
        <div className="text-destructive">List not found</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/app/lists' })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{list.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="capitalize">
                {list.type}
              </Badge>
              <Badge
                variant={list.status === 'active' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {list.status}
              </Badge>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setArchiveDialogOpen(true)}>
              <Archive className="h-4 w-4 mr-2" />
              Archive List
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Add item form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddItem()
              }}
              className="flex-1"
            />
            <Input
              placeholder="Qty (optional)"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddItem()
              }}
              className="w-32"
            />
            <Button onClick={handleAddItem} disabled={isCreating || !newItemName.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items list */}
      <div className="space-y-4">
        {/* Unchecked items */}
        {uncheckedItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items ({uncheckedItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {uncheckedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={(checked) => handleToggleItem(item.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      {item.quantity && (
                        <div className="text-sm text-muted-foreground">{item.quantity}</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setItemToDelete(item.id)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checked items */}
        {checkedItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-muted-foreground">
                Completed ({checkedItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {checkedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group opacity-60"
                  >
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={(checked) => handleToggleItem(item.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="font-medium line-through">{item.name}</div>
                      {item.quantity && (
                        <div className="text-sm text-muted-foreground line-through">
                          {item.quantity}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setItemToDelete(item.id)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {uncheckedItems.length === 0 && checkedItems.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Check className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No items yet. Add your first item above!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete item dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive list dialog */}
      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive List</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this list? You can view archived lists in the lists
              overview page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleArchiveList}>Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
