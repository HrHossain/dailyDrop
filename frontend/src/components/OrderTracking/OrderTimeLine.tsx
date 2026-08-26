import { ClockIcon, CheckIcon, TruckIcon, PackageIcon } from "lucide-react";

export default function OrderTimeLine({ order }: { order: any }) {

    const allStatuses = ["Placed", "Confirmed", "Assigned", "Packed", "Out for Delivery", "Delivered"];
    const currentIdx = allStatuses.indexOf(order.status);

    const statusIcons: any = {
        Placed: ClockIcon,
        Confirmed: CheckIcon,
        Assigned: TruckIcon,
        Packed: PackageIcon,
        "Out for Delivery": TruckIcon,
        Delivered: CheckIcon,
    };
console.log(currentIdx)
    return (
          <div className="bg-white rounded-card shadow-card p-6">
      <h2 className="font-display text-lg font-semibold text-forest-700 mb-6">Delivery Progress</h2>
      <div className="space-y-0">
        {allStatuses.map((status: string, i: number) => {
          const Icon = statusIcons[status] || PackageIcon;
          const isCompleted = i <= currentIdx;
          const isCurrent = i === currentIdx;
 
          const historyEntry = order.statusHistory.find((h: any) => h.status === status);
 console.log(order)
          return (
            <div key={status} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`size-9 rounded-full flex items-center justify-center shrink-0 ${
                    isCompleted ? "bg-forest text-white" : "bg-white text-charcoal-400 border border-mist-200"
                  } ${isCurrent ? "ring-4 ring-forest/20" : ""}`}
                >
                  <Icon className="size-4" />
                </div>
                {i < allStatuses.length - 1 && (
                  <div className={`w-0.5 h-12 ${i < currentIdx ? "bg-forest" : "bg-mist-200"}`} />
                )}
              </div>

              <div className="pb-6">
                <p className={`text-sm font-semibold ${isCompleted ? "text-forest-700" : "text-charcoal-400"}`}>
                  {status}
                </p>
                {historyEntry && (
                  <p className="text-xs text-charcoal-400 mt-0.5">
                    {new Date(historyEntry.timestamp).toLocaleString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    )
}
