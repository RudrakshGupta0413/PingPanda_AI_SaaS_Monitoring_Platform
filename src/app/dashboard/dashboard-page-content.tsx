"use client"

import { useQuery } from "@tanstack/react-query"
import { client } from "../lib/client"
import { LoadingSpinner } from "@/components/loading-spinner"

type Category = {
  id: string
  name: string
  color?: number
  emoji?: string
  createdAt?: string | Date
  lastPing?: string | Date
  uniqueFieldCount?: number
  eventsCount?: number
}

export const DashboardPageContent = () => {
  const { data: categories, isPending: isEventCategoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ["user-event-categories"],
    queryFn: async () => {
      const res = await client.category.getEventCategories.$get()
      const json = await res.json()
      console.log("Full response:", json)
      return json.categories as Category[]
    },
  })

  if (isEventCategoriesLoading) {
    return (
      <div className="flex items-center justify-center flex-1 h-full w-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return <div>empty state</div>
  }

  return (
    <ul className="grid max-w-6xl grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {categories.map((category, index) => (
        <li
          key={category.id ?? category.name ?? index}
          className="relative group z-10 transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="absolute z-0 inset-px rounded-lg bg-white" />

          <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm transition-all duration-300 group-hover:shadow-md ring-1 ring-black/5">
            <div className="relative p-6 z-10">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="size-12 rounded-full"
                  style={{
                    backgroundColor: category.color
                      ? `#${category.color.toString(16).padStart(6, "0")}`
                      : "#f3f4f6",
                  }}
                />
                <div>
                  <h3 className="text-lg/7 font-medium tracking-tight text-gray-950">
                    {category.emoji || ""} {category.name} 
                  </h3>{" "}
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
