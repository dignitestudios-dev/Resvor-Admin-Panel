'use client';

import { useState } from 'react';
import { use } from 'react';
import { useFlyer } from '@/hooks/use-flyers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  FileImage,
  Mail,
  Phone,
  Building2,
  Radio,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatLocation(loc?: any): string {
  if (!loc) return '—';
  if (typeof loc === 'string') return loc;
  if (typeof loc === 'object') {
    return loc.address || (loc.coordinates ? `${loc.coordinates.lat}, ${loc.coordinates.lng}` : '—');
  }
  return '—';
}

function getFlyerImageUrl(image?: any): string | null {
  if (!image) return null;
  if (typeof image === 'string') {
    const trimmed = image.trim();
    return trimmed.length > 0 && !trimmed.includes('undefined') && !trimmed.includes('null') ? trimmed : null;
  }
  if (typeof image === 'object') {
    const url =
      image.url ||
      image.secure_url ||
      image.path ||
      image.location ||
      image.fileUrl ||
      image.src ||
      image.mediaUrl ||
      image.image ||
      null;
    if (typeof url === 'string') {
      const trimmed = url.trim();
      return trimmed.length > 0 && !trimmed.includes('undefined') && !trimmed.includes('null') ? trimmed : null;
    }
  }
  return null;
}

function FlyerMediaPreview({ image }: { image?: any }) {
  const imageUrl = getFlyerImageUrl(image);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!imageUrl) {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border-2 border-dashed border-border/80 bg-muted/30 flex flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground shadow-2xs">
        <div className="h-14 w-14 rounded-full bg-background flex items-center justify-center border shadow-xs">
          <FileImage className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">No Image Available</p>
          <p className="text-xs text-muted-foreground max-w-[220px]">
            No flyer media or attachment was uploaded for this campaign
          </p>
        </div>
      </div>
    );
  }

  if (imageError) {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center gap-3 p-6 text-center text-destructive shadow-2xs">
        <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-xs">
          <AlertCircle className="h-7 w-7 text-destructive" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-destructive">Failed to Load Image</p>
          <p className="text-xs text-muted-foreground max-w-[220px]">
            The flyer image could not be loaded from the remote server
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs px-3 mt-1 shadow-2xs cursor-pointer hover:bg-destructive/10 hover:text-destructive border-destructive/30"
          onClick={() => {
            setImageError(false);
            setImageLoading(true);
          }}
        >
          Retry Loading
        </Button>
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border bg-muted/20 flex items-center justify-center group shadow-2xs">
      {imageLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/40 backdrop-blur-[1px]">
          <FileImage className="h-8 w-8 text-muted-foreground/40 animate-pulse" />
          <span className="text-xs text-muted-foreground animate-pulse">Loading preview...</span>
        </div>
      )}
      <img
        src={imageUrl}
        alt="Flyer Campaign Media"
        className={cn(
          'w-full h-full object-contain transition-opacity duration-200',
          imageLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => {
          setImageLoading(false);
          setImageError(false);
        }}
        onError={() => {
          setImageLoading(false);
          setImageError(true);
        }}
      />
      {!imageLoading && !imageError && (
        <a
          href={imageUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 hover:bg-black text-white text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Full View
        </a>
      )}
    </div>
  );
}

function RecipientRow({ rec, index }: { rec: any; index: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (rec.value) {
      navigator.clipboard.writeText(rec.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <TableRow key={index}>
      <TableCell className="text-sm font-medium py-3">
        <div className="flex items-center gap-2 max-w-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="font-mono text-xs text-foreground select-all break-all cursor-pointer hover:text-primary transition-colors"
                title={rec.value}
              >
                {rec.value}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs break-all font-mono text-xs">
              {rec.value}
            </TooltipContent>
          </Tooltip>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-60 hover:opacity-100 shrink-0 text-muted-foreground hover:bg-muted cursor-pointer"
            title="Copy recipient"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span className="sr-only">Copy</span>
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={rec.status} />
      </TableCell>
      <TableCell className="text-sm text-center">
        {rec.attempts}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {rec.lastAttemptedAt ? new Date(rec.lastAttemptedAt).toLocaleString() : '—'}
      </TableCell>
      <TableCell className="text-xs text-destructive font-medium max-w-xs break-words" title={rec.failureReason ?? ''}>
        {rec.failureReason ?? '—'}
      </TableCell>
    </TableRow>
  );
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
    ? (typeof sender === 'object' && (sender?.name || sender?.fullName || [sender?.firstName, sender?.lastName].filter(Boolean).join(' '))) ||
      flyer.loungeId?.name ||
      'Lounge Manager'
    : (typeof sender === 'object' && ([sender?.firstName, sender?.lastName].filter(Boolean).join(' ') || sender?.name || sender?.fullName)) ||
      'User Campaign';

  const senderEmail = (typeof sender === 'object' ? sender?.email : undefined) || flyer.loungeId?.businessEmail;
  const senderPhone = typeof sender === 'object' ? sender?.phoneNumber : undefined;

  // Resolve message from all possible properties
  const campaignMessage =
    flyer.additionalInfo ||
    flyer.message ||
    flyer.campaignMessage ||
    flyer.description ||
    flyer.content ||
    flyer.text ||
    flyer.body ||
    flyer.caption ||
    flyer.title;

  const isHtmlMessage = Boolean(campaignMessage && /<[a-z][\s\S]*>/i.test(campaignMessage));

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
              <FlyerMediaPreview image={flyer.image} />
              <div className="border-t pt-4">
                <span className="text-xs text-muted-foreground block uppercase font-medium mb-1.5">Campaign Message</span>
                {campaignMessage ? (
                  isHtmlMessage ? (
                    <div
                      className="text-sm bg-muted/30 p-3.5 rounded-lg border text-foreground/90 font-normal break-words [overflow-wrap:anywhere] leading-relaxed [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_.ql-align-center]:text-center [&_.ql-align-right]:text-right [&_.ql-align-justify]:text-justify [&_strong]:font-semibold"
                      dangerouslySetInnerHTML={{ __html: campaignMessage }}
                    />
                  ) : (
                    <p className="text-sm bg-muted/30 p-3.5 rounded-lg border text-foreground font-normal break-words [overflow-wrap:anywhere] whitespace-pre-wrap leading-relaxed">
                      {campaignMessage}
                    </p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-lg border">
                    No message provided.
                  </p>
                )}
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
                      <div className="flex items-center gap-1.5 mt-1">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="break-all cursor-pointer hover:text-primary transition-colors text-foreground">
                              {flyer.loungeId.businessEmail}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs break-all text-xs font-mono">
                            {flyer.loungeId.businessEmail}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  )}
                  {flyer.loungeId.location && (
                    <div>
                      <span className="text-xs text-muted-foreground block uppercase font-medium">Address</span>
                      <span className="break-words">{formatLocation(flyer.loungeId.location)}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {senderEmail && (
                    <div>
                      <span className="text-xs text-muted-foreground block uppercase font-medium">Email</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="break-all cursor-pointer hover:text-primary transition-colors text-foreground">
                              {senderEmail}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs break-all text-xs font-mono">
                            {senderEmail}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  )}
                  {senderPhone && (
                    <div>
                      <span className="text-xs text-muted-foreground block uppercase font-medium">Phone</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{senderPhone}</span>
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
                        <TableHead className="text-center">Attempts</TableHead>
                        <TableHead>Last Attempt Date</TableHead>
                        <TableHead>Failure Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flyer.recipients.map((rec, index) => (
                        <RecipientRow key={index} rec={rec} index={index} />
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
