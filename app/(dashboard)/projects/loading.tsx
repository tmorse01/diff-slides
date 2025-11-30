import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-9 w-32 mb-2 opacity-50" />
            <Skeleton className="h-4 w-64 opacity-50" />
          </div>
          <Skeleton className="h-10 w-32 opacity-50" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-3/4 opacity-50" />
                  <Skeleton className="h-8 w-8 rounded opacity-50" />
                </div>
                <Skeleton className="h-4 w-full mt-2 opacity-50" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-16 opacity-50" />
                  <Skeleton className="h-3 w-20 opacity-50" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
