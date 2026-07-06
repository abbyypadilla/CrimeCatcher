import { Banknote, Building2, Landmark, Users, Globe2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Entities } from "@/types/investigation";

interface EntitiesPanelProps {
  entities: Entities;
}

const GROUPS: { key: keyof Entities; label: string; icon: typeof Users }[] = [
  { key: "people", label: "People", icon: Users },
  { key: "companies", label: "Companies", icon: Building2 },
  { key: "countries", label: "Countries", icon: Globe2 },
  { key: "banks", label: "Banks", icon: Banknote },
  { key: "government_agencies", label: "Government Agencies", icon: Landmark },
];

export function EntitiesPanel({ entities }: EntitiesPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {GROUPS.map(({ key, label, icon: Icon }) => {
        const values = entities[key] ?? [];
        return (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5" /> {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {values.length === 0 ? (
                <p className="text-sm text-ink-faint">None identified</p>
              ) : (
                <ul className="space-y-1.5">
                  {values.map((value) => (
                    <li
                      key={value}
                      className="truncate rounded-md bg-surface-raised px-2.5 py-1.5 text-sm text-ink"
                      title={value}
                    >
                      {value}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
