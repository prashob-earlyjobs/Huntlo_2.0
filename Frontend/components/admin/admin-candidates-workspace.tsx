"use client";

import { Eye, MoreHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ADMIN_CANDIDATES } from "@/lib/mock-admin";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

export function AdminCandidatesWorkspace() {
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ADMIN_CANDIDATES;
    return ADMIN_CANDIDATES.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(q) ||
        candidate.workspace.toLowerCase().includes(q) ||
        candidate.title.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate index"
        description="Platform-wide candidate records across workspaces. Contact details stay masked."
        actions={
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search candidates…"
            className="w-56 sm:w-72"
          />
        }
      />

      {toast ? (
        <div
          role="status"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm"
        >
          {toast}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={HEAD}>Candidate</TableHead>
              <TableHead className={HEAD}>Workspace</TableHead>
              <TableHead className={HEAD}>Source</TableHead>
              <TableHead className={HEAD}>Status</TableHead>
              <TableHead className={HEAD}>Email reveal</TableHead>
              <TableHead className={HEAD}>Mobile reveal</TableHead>
              <TableHead className={HEAD}>Last activity</TableHead>
              <TableHead className={HEAD}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>
                  <p className="font-medium">{candidate.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {candidate.title}
                  </p>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {candidate.workspace}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {candidate.source}
                </TableCell>
                <TableCell className="text-sm">{candidate.status}</TableCell>
                <TableCell className="text-sm">
                  {candidate.emailRevealed ? "Revealed" : "Masked"}
                </TableCell>
                <TableCell className="text-sm">
                  {candidate.mobileRevealed ? "Revealed" : "Masked"}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {candidate.lastActivity}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Actions for ${candidate.name}`}
                        />
                      }
                    >
                      <MoreHorizontal aria-hidden />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          setToast(
                            `Viewing ${candidate.name} metadata. Contacts stay masked.`
                          )
                        }
                      >
                        <Eye aria-hidden />
                        View metadata
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
