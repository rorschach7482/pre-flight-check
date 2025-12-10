import { Star, MoreVertical, Pencil, Trash2, Copy } from 'lucide-react';
import { Prompt } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface PromptCardProps {
  prompt: Prompt;
  onToggleFavorite: (id: string) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onUse: (prompt: Prompt) => void;
}

export function PromptCard({
  prompt,
  onToggleFavorite,
  onEdit,
  onDelete,
  onUse,
}: PromptCardProps) {
  return (
    <Card className="group">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              {prompt.category}
            </Badge>
          </div>
          <CardTitle className="text-base">{prompt.title}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleFavorite(prompt.id)}
          >
            <Star
              className={cn(
                'h-4 w-4',
                prompt.isFavorite && 'fill-yellow-400 text-yellow-400'
              )}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUse(prompt)}>
                <Copy className="mr-2 h-4 w-4" />
                Use Prompt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(prompt)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(prompt)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{prompt.content}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={() => onUse(prompt)}
        >
          <Copy className="mr-2 h-3 w-3" />
          Use Prompt
        </Button>
      </CardContent>
    </Card>
  );
}
