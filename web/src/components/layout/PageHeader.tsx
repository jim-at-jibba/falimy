interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  color?: 'blue' | 'purple' | 'orange' | 'green' | 'pink'
}

const colorMap = {
  blue: 'bg-[#b4dbfa]',
  purple: 'bg-[#dad4fc]',
  orange: 'bg-[#fadeaf]',
  green: 'bg-[#b2ecca]',
  pink: 'bg-[#f8d5f4]',
}

export function PageHeader({ title, description, children, color }: PageHeaderProps) {
  const bgClass = color ? colorMap[color] : 'bg-muted/30'

  return (
    <div className={`border-b-2 border-black dark:border-white/25 ${bgClass}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-black">{title}</h1>
            {description && (
              <p className="text-black/60 mt-2 font-medium">{description}</p>
            )}
          </div>
          {children && <div>{children}</div>}
        </div>
      </div>
    </div>
  )
}
