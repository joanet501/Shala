"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, UserPlus } from "lucide-react";
import {
  approveCancellation,
  declineCancellation,
  offerWaitlistSpot,
  updatePaymentStatus,
} from "@/lib/actions/booking-management";
import { toast } from "sonner";

interface BookingActionsProps {
  teacherId: string;
  booking: {
    id: string;
    status: string;
    paymentStatus: string;
    cancelledReason: string | null;
  };
}

export function BookingActions({ teacherId, booking }: BookingActionsProps) {
  const t = useTranslations("bookingActions");
  const [isPending, startTransition] = useTransition();

  const handleApproveCancel = () => {
    startTransition(async () => {
      const result = await approveCancellation(teacherId, booking.id);
      if (result.error) toast.error(result.error);
      else toast.success(t("cancelled"));
    });
  };

  const handleDeclineCancel = () => {
    startTransition(async () => {
      const result = await declineCancellation(teacherId, booking.id);
      if (result.error) toast.error(result.error);
      else toast.success(t("declined"));
    });
  };

  const handleOfferSpot = () => {
    startTransition(async () => {
      const result = await offerWaitlistSpot(teacherId, booking.id);
      if (result.error) toast.error(result.error);
      else toast.success(t("spotOffered"));
    });
  };

  const handlePaymentChange = (status: string) => {
    startTransition(async () => {
      const result = await updatePaymentStatus(
        teacherId,
        booking.id,
        status as "PENDING" | "PAID" | "REFUNDED" | "WAIVED"
      );
      if (result.error) toast.error(result.error);
      else toast.success(t("paymentUpdated"));
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Cancellation request */}
      {booking.status === "CANCELLATION_REQUESTED" && (
        <div className="flex items-center gap-1">
          {booking.cancelledReason && (
            <span className="mr-2 text-xs text-muted-foreground italic">
              &quot;{booking.cancelledReason}&quot;
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleApproveCancel}
            disabled={isPending}
            className="h-7 text-xs"
          >
            <Check className="mr-1 size-3" />
            {t("approve")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDeclineCancel}
            disabled={isPending}
            className="h-7 text-xs"
          >
            <X className="mr-1 size-3" />
            {t("decline")}
          </Button>
        </div>
      )}

      {/* Waitlist offer */}
      {booking.status === "WAITLISTED" && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleOfferSpot}
          disabled={isPending}
          className="h-7 text-xs"
        >
          <UserPlus className="mr-1 size-3" />
          {t("offerSpot")}
        </Button>
      )}

      {/* Payment status */}
      {booking.status !== "CANCELLED" && booking.status !== "WAITLISTED" && (
        <Select
          value={booking.paymentStatus}
          onValueChange={handlePaymentChange}
          disabled={isPending}
        >
          <SelectTrigger className="h-7 w-[120px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">{t("paymentPending")}</SelectItem>
            <SelectItem value="PAID">{t("paymentPaid")}</SelectItem>
            <SelectItem value="REFUNDED">{t("paymentRefunded")}</SelectItem>
            <SelectItem value="WAIVED">{t("paymentWaived")}</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
