"use client";

import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@repo/ui/table";
import { Badge } from "@repo/ui/badge";
import { Button, buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";

interface EquipmentRow {
  id: string;
  name: string;
  category: string;
  subType?: string | null;
  pricing: { hourly: number; daily: number };
  images: string[];
}

interface EquipmentTableProps {
  readonly items: EquipmentRow[];
  readonly onEdit: (id: string) => void;
  readonly onDelete: (id: string) => void;
}

export function EquipmentTable({ items, onEdit, onDelete }: EquipmentTableProps) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No equipment found. Add your first machine.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-charcoal/5">
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Daily Rate</TableHead>
          <TableHead className="text-right">Hourly Rate</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              <Badge variant="secondary">{item.category}</Badge>
              {item.subType && (
                <Badge variant="outline" className="ml-1">
                  {item.subType}
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              ₹{(item.pricing.daily / 100).toLocaleString("en-IN")}
            </TableCell>
            <TableCell className="text-right">
              ₹{(item.pricing.hourly / 100).toLocaleString("en-IN")}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Link
                  href={`/fleet/${item.id}/health`}
                  className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                >
                  Health
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(item.id)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(item.id)}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
