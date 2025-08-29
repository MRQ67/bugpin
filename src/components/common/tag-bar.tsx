import { Badge } from '@/components/ui/badge'

const tags = [
  'TypeScript',
  'React',
  'Next.js',
  'Zod',
  'Supabase',
  'Tailwind CSS',
  'Prisma',
  'GraphQL',
]

export default function TagBar() {
  return (
    <div className="py-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}
