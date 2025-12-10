import { useState, useMemo } from 'react';
import { Plus, Search, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Prompt, PromptCategory, PROMPT_CATEGORIES } from '@/types';
import { PromptCard } from '@/components/PromptCard';
import { CreatePromptModal } from '@/components/CreatePromptModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function PromptLibrary() {
  const {
    prompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    projects,
  } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | 'all'>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<Prompt | null>(null);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      const matchesSearch =
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || prompt.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [prompts, searchQuery, selectedCategory]);

  const handleCreateSubmit = (title: string, content: string, category: PromptCategory) => {
    if (editingPrompt) {
      updatePrompt(editingPrompt.id, { title, content, category });
    } else {
      createPrompt(title, content, category);
    }
    setEditingPrompt(null);
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setCreateOpen(true);
  };

  const handleDelete = (prompt: Prompt) => {
    setDeletingPrompt(prompt);
  };

  const handleDeleteConfirm = () => {
    if (deletingPrompt) {
      deletePrompt(deletingPrompt.id);
      setDeletingPrompt(null);
    }
  };

  const handleUsePrompt = (prompt: Prompt) => {
    if (projects.length === 0) {
      toast({
        title: 'No projects available',
        description: 'Create a project first to use this prompt.',
      });
      return;
    }
    // Navigate to the first project and use the prompt
    navigator.clipboard.writeText(prompt.content);
    toast({
      title: 'Prompt copied!',
      description: 'The prompt has been copied to your clipboard.',
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Prompt Library</h1>
          <p className="text-muted-foreground">
            Reusable templates for compliance questions
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Prompt
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs
          value={selectedCategory}
          onValueChange={v => setSelectedCategory(v as PromptCategory | 'all')}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {PROMPT_CATEGORIES.map(cat => (
              <TabsTrigger key={cat} value={cat}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filteredPrompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-semibold text-lg mb-2">
            {searchQuery || selectedCategory !== 'all'
              ? 'No prompts found'
              : 'No prompts yet'}
          </h2>
          <p className="text-muted-foreground mb-4 max-w-sm">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first prompt template to get started.'}
          </p>
          {!searchQuery && selectedCategory === 'all' && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Prompt
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map(prompt => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onToggleFavorite={toggleFavorite}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUse={handleUsePrompt}
            />
          ))}
        </div>
      )}

      <CreatePromptModal
        open={createOpen}
        onOpenChange={open => {
          setCreateOpen(open);
          if (!open) setEditingPrompt(null);
        }}
        onSubmit={handleCreateSubmit}
        editingPrompt={editingPrompt}
      />
      <DeleteConfirmModal
        open={!!deletingPrompt}
        onOpenChange={open => !open && setDeletingPrompt(null)}
        title="Delete Prompt"
        description={`Are you sure you want to delete "${deletingPrompt?.title}"?`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
