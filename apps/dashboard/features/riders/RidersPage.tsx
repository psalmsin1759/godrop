'use client'

import { Bike, MapPin, Info } from 'lucide-react'

export default function RidersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#283c50]">Riders</h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">Delivery rider management and tracking</p>
        </div>
      </div>

      <div className="card p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#eef1fb] flex items-center justify-center mx-auto">
          <Bike className="w-8 h-8 text-[#3454d1]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#283c50]">Rider Management</h2>
          <p className="text-sm text-[#6b7885] mt-1 max-w-md mx-auto">
            The rider management API is under development. Once available, you'll be able to view online
            status, locations, ratings, and delivery history for all registered riders.
          </p>
        </div>
        <div className="flex items-center justify-center gap-6 pt-2">
          <div className="flex items-center gap-2 text-xs text-[#6b7885]">
            <MapPin className="w-4 h-4 text-[#3454d1]" />
            Live rider map
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6b7885]">
            <Bike className="w-4 h-4 text-[#17c666]" />
            Online status tracking
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6b7885]">
            <Info className="w-4 h-4 text-[#ffa21d]" />
            Performance analytics
          </div>
        </div>
      </div>
    </div>
  )
}
