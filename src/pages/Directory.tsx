import { useCoaches } from "@/hooks/useCoaches";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const Directory = () => {
  const { data: coaches = [], isLoading, error } = useCoaches();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Coach Directory</h1>
            <p className="text-muted-foreground">
              Complete list of verified coaches in our network
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Error loading coaches. Please try again later.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead>Expertise</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coaches.map((coach) => (
                    <TableRow key={coach.id}>
                      <TableCell className="font-medium">{coach.name}</TableCell>
                      <TableCell>{coach.email}</TableCell>
                      <TableCell>{coach.specialization}</TableCell>
                      <TableCell>{coach.rating.toFixed(1)}/5.0</TableCell>
                      <TableCell>{coach.clients}</TableCell>
                      <TableCell>
                        {coach.hourlyRate ? `$${coach.hourlyRate}/hr` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {coach.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && !error && coaches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No coaches found in the directory.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Directory;
