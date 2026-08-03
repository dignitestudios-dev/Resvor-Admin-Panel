'use client';

import { use } from 'react';
import { useFlyer } from '@/hooks/use-flyers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileImage, Mail, Phone, Building2, Calendar, Radio } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function FlyerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: flyer, isLoading, isError } = useFlyer(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 md:col-span-1" />
          <Skeleton className="h-96 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (isError || !flyer) {
    return (
      <EmptyState
        title="Flyer campaign not found"
        description="This campaign may have been archived."
        icon={<FileImage className="h-8 w-8 text-muted-foreground" />}
      />
    );
  }

  const sender = flyer.senderId;
  const isManager = flyer.senderModel === 'LoungeManager';
  const senderName = isManager
    ? sender?.name ?? flyer.loungeId?.name ?? 'Lounge Manager'
    : [sender?.firstName, sender?.lastName].filter(Boolean).join(' ') || 'User Campaign';

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/flyers">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaign Details</h1>
          <p className="text-muted-foreground text-sm">
            Sent on {formatDate(flyer.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flyer Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Flyer Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={flyer.image?.url}
                  alt="Flyer Campaign Media"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 30vw"
                />
              </div>
              <div className="border-t pt-4">
                <span className="text-xs text-muted-foreground block uppercase font-medium mb-1">Campaign Message</span>
                <p className="text-sm bg-muted/30 p-3 rounded border text-foreground/90 font-medium">
                  {flyer.additionalInfo ?? 'No message provided.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sender details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Radio className="h-4 w-4" /> Campaign Sender
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-medium">Name</span>
                <span className="font-semibold">{senderName}</span>
              </div>
              {isManager && flyer.loungeId ? (
                <>
                  <div>
                    <span className="text-xs text-muted-foreground block uppercase font-medium">Lounge Source</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{flyer.loungeId.name}</span>
                    </div>
                  </div>
                  {flyer.loungeId.businessEmail && (
                    <div>
                      <span className="text-xs text-muted-foreground block uppercase font-medium">Business Email</span>
                      <span>{flyer.loungeId.businessEmail}</span>
                    </div>
                  )}
                  {flyer.loungeId.location && (
                    <div>
                      <span className="text-xs text-muted-foreground block uppercase font-medium">Address</span>
                      <span>{flyer.loungeId.location}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {sender?.email && (
                    <div>
                      <span className="text-xs text-muted-foreground block uppercase font-medium">Email</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{sender.email}</span>
                      </div>
                    </div>
                  )}
                  {sender?.phoneNumber && (
                    <div>
                      <span className="text-xs text-muted-foreground block uppercase font-medium">Phone</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{sender.phoneNumber}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-medium">Broadcast Channel</span>
                <span className="capitalize font-semibold">{flyer.channel}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recipients delivery logs */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaign Delivery Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {!flyer.recipients?.length ? (
                <EmptyState
                  title="No logs found"
                  description="Detailed logs are only populated upon broadcast dispatch completion."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Recipient Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Attempts</TableHead>
                        <TableHead>Last Attempt Date</TableHead>
                        <TableHead>Failure Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flyer.recipients.map((rec, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-sm font-semibold truncate max-w-40" title={rec.value}>
                            {rec.value}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={rec.status} />
                          </TableCell>
                          <TableCell className="text-sm text-center">
                            {rec.attempts}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {rec.lastAttemptedAt ? new Date(rec.lastAttemptedAt).toLocaleString() : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-destructive font-medium max-w-44 truncate" title={rec.failureReason ?? ''}>
                            {rec.failureReason ?? '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
