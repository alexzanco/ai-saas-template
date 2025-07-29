'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchIcon, XIcon, FilterIcon } from 'lucide-react'
import { useState, useCallback, useMemo } from 'react'
import { categories } from '@/lib/blocks-registry'

interface ComponentSearchProps {
  locale: string
  onCategoryFilter?: (categoryId: string | null) => void
  className?: string
}

export function ComponentSearch({
  locale,
  onCategoryFilter,
  className,
}: ComponentSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleCategoryToggle = (categoryId: string) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId
    setSelectedCategory(newCategory)
    onCategoryFilter?.(newCategory)
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedCategory(null)
    onCategoryFilter?.(null)
  }

  const hasFilters = searchTerm || selectedCategory

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 搜索框 */}
      <div className="relative">
        <Input
          placeholder={
            locale === 'zh'
              ? '搜索组件名称或描述...'
              : 'Search components by name or description...'
          }
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 分类过滤 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium">
            <FilterIcon className="h-4 w-4" />
            {locale === 'zh' ? '按分类筛选' : 'Filter by category'}
          </label>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              {locale === 'zh' ? '清除筛选' : 'Clear filters'}
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const IconComponent = category.icon
            return (
              <Badge
                key={category.id}
                variant={
                  selectedCategory === category.id ? 'default' : 'outline'
                }
                className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground flex items-center gap-1"
                onClick={() => handleCategoryToggle(category.id)}
              >
                <IconComponent className="h-3 w-3" />
                {category.name}
                <span className="ml-1 text-xs opacity-70">
                  ({category.count})
                </span>
              </Badge>
            )
          })}
        </div>
      </div>

      {/* 快速筛选按钮 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleCategoryToggle('')}
          className="text-xs"
        >
          {locale === 'zh' ? '全部' : 'All'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => {
            // 这里可以添加最新组件的逻辑
          }}
        >
          {locale === 'zh' ? '最新' : 'Latest'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => {
            // 这里可以添加热门组件的逻辑
          }}
        >
          {locale === 'zh' ? '热门' : 'Popular'}
        </Button>
      </div>

      {/* 搜索结果统计 */}
      {hasFilters && (
        <div className="text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            {locale === 'zh' ? '已应用筛选条件' : 'Filters applied'}
            {selectedCategory && (
              <Badge variant="secondary" className="text-xs">
                {categories.find(c => c.id === selectedCategory)?.name}
              </Badge>
            )}
          </span>
        </div>
      )}
    </div>
  )
}
