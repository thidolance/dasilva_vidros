import { cn } from '@/lib/utils'

export function StatusBadge({ status }: { status: 'aberto' | 'fechado' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        status === 'fechado'
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-amber-100 text-amber-700',
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          status === 'fechado' ? 'bg-emerald-500' : 'bg-amber-500',
        )}
      />
      {status === 'fechado' ? 'Fechado' : 'Em aberto'}
    </span>
  )
}
