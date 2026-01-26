"use client"

interface PageHeaderProps {
  title: string
  description: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">{description}</p>
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  )
}
