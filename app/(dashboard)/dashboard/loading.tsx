import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2 opacity-50" />
          <Skeleton className="h-4 w-96 opacity-50" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24 opacity-50" />
                <Skeleton className="h-4 w-4 opacity-50" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2 opacity-50" />
                <Skeleton className="h-3 w-32 opacity-50" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-7 w-40 opacity-50" />
            <Skeleton className="h-9 w-24 opacity-50" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 opacity-50" />
                  <Skeleton className="h-4 w-full mt-2 opacity-50" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-3 w-24 opacity-50" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
