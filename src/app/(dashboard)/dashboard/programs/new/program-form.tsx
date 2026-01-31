"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  MapPin,
  Video,
  DollarSign,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProgram } from "@/lib/actions/programs";
import { SLUG_REGEX } from "@/lib/validations/programs";

interface TemplateSession {
  dayOffset: number;
  startTime: string;
  endTime: string;
  label: string;
}

interface Template {
  id: string;
  name: string;
  formatType: string;
  defaultSessions: TemplateSession[];
  defaultCapacity: number | null;
  defaultNotes: string | null;
  defaultWhatToBring: string | null;
  defaultPreparation: string | null;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
}

interface ProgramFormProps {
  teacherId: string;
  templates: Template[];
  venues: Venue[];
}

interface SessionData {
  date: string;
  startTime: string;
  endTime: string;
  title: string;
}

export function ProgramForm({ teacherId, templates, venues }: ProgramFormProps) {
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(1);
  const slugManuallyEdited = useRef(false);

  // Step 1: Template
  const [templateId, setTemplateId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  // Step 2: Basic Info
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  // Step 3: Venue
  const [venueType, setVenueType] = useState<"IN_PERSON" | "ONLINE" | "HYBRID">(
    "IN_PERSON"
  );
  const [venueMode, setVenueMode] = useState<"existing" | "new">("existing");
  const [venueId, setVenueId] = useState("");
  const [newVenueName, setNewVenueName] = useState("");
  const [newVenueAddress, setNewVenueAddress] = useState("");
  const [newVenueCity, setNewVenueCity] = useState("");
  const [newVenueCountry, setNewVenueCountry] = useState("");
  const [saveVenue, setSaveVenue] = useState(true);
  const [onlineMeetingProvider, setOnlineMeetingProvider] = useState<
    "ZOOM" | "GOOGLE_MEET" | "CUSTOM"
  >("ZOOM");
  const [onlineMeetingUrl, setOnlineMeetingUrl] = useState("");

  // Step 4: Schedule
  const [startDate, setStartDate] = useState("");
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [registrationDeadline, setRegistrationDeadline] = useState("");

  // Step 5: Capacity & Pricing
  const [capacity, setCapacity] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [priceAmount, setPriceAmount] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("USD");
  const [allowPayAtVenue, setAllowPayAtVenue] = useState(false);

  // Step 6: Additional Details
  const [notes, setNotes] = useState("");
  const [whatToBring, setWhatToBring] = useState("");
  const [preparationInstructions, setPreparationInstructions] = useState("");
  const [requiresHealthForm, setRequiresHealthForm] = useState(true);

  // Auto-derive slug from name
  useEffect(() => {
    if (slugManuallyEdited.current) return;
    const derived = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(derived);
  }, [name]);

  // Debounced slug availability check
  useEffect(() => {
    if (!slug || slug.length < 3 || !SLUG_REGEX.test(slug)) {
      setSlugStatus("idle");
      return;
    }

    setSlugStatus("checking");
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/programs/check-slug?slug=${encodeURIComponent(slug)}&teacherId=${teacherId}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setSlugStatus(data.available ? "available" : "taken");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSlugStatus("idle");
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [slug, teacherId]);

  // Calculate sessions when template or start date changes
  useEffect(() => {
    if (!selectedTemplate || !startDate) return;

    const start = new Date(startDate);
    const calculated = selectedTemplate.defaultSessions.map((ts) => {
      const sessionDate = new Date(start);
      sessionDate.setDate(sessionDate.getDate() + ts.dayOffset);
      return {
        date: sessionDate.toISOString().split("T")[0],
        startTime: ts.startTime,
        endTime: ts.endTime,
        title: ts.label,
      };
    });
    setSessions(calculated);
  }, [selectedTemplate, startDate]);

  // Prefill defaults when template is selected
  useEffect(() => {
    if (!selectedTemplate) return;

    setCapacity(
      selectedTemplate.defaultCapacity?.toString() || ""
    );
    setNotes(selectedTemplate.defaultNotes || "");
    setWhatToBring(selectedTemplate.defaultWhatToBring || "");
    setPreparationInstructions(selectedTemplate.defaultPreparation || "");

    // Set default venue type based on format
    if (
      selectedTemplate.formatType.includes("ONLINE") &&
      !selectedTemplate.formatType.includes("MULTI")
    ) {
      setVenueType("ONLINE");
    }
  }, [selectedTemplate]);

  function handleTemplateSelect(template: Template) {
    setTemplateId(template.id);
    setSelectedTemplate(template);
    setCurrentStep(2);
  }

  function handleNext() {
    if (currentStep === 2) {
      if (!name || name.length < 3) {
        toast.error("Program name must be at least 3 characters");
        return;
      }
      if (slugStatus === "taken") {
        toast.error("Please choose a different slug");
        return;
      }
      if (slugStatus === "checking") {
        toast.error("Please wait for slug availability check");
        return;
      }
    }

    if (currentStep === 3) {
      if (
        (venueType === "IN_PERSON" || venueType === "HYBRID") &&
        venueMode === "existing" &&
        !venueId
      ) {
        toast.error("Please select a venue");
        return;
      }
      if (
        (venueType === "IN_PERSON" || venueType === "HYBRID") &&
        venueMode === "new"
      ) {
        if (!newVenueName || !newVenueAddress || !newVenueCity || !newVenueCountry) {
          toast.error("Please fill in all venue details");
          return;
        }
      }
      if (venueType === "ONLINE" || venueType === "HYBRID") {
        if (!onlineMeetingUrl) {
          toast.error("Please provide a meeting URL");
          return;
        }
      }
    }

    if (currentStep === 4) {
      if (!startDate) {
        toast.error("Please select a start date");
        return;
      }
      if (sessions.length === 0) {
        toast.error("At least one session is required");
        return;
      }
    }

    if (currentStep === 5) {
      if (!isFree && !priceAmount) {
        toast.error("Please enter a price or mark as free");
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  }

  function handleBack() {
    setCurrentStep(currentStep - 1);
  }

  function handleSubmit(status: "DRAFT" | "PUBLISHED") {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("templateId", templateId);
      formData.set("name", name);
      formData.set("slug", slug);
      formData.set("description", description);

      formData.set("venueType", venueType);
      if (venueMode === "existing" && venueId) {
        formData.set("venueId", venueId);
      } else if (venueMode === "new") {
        formData.set(
          "newVenue",
          JSON.stringify({
            name: newVenueName,
            address: newVenueAddress,
            city: newVenueCity,
            country: newVenueCountry,
            saveForReuse: saveVenue,
          })
        );
      }

      if (venueType === "ONLINE" || venueType === "HYBRID") {
        formData.set("onlineMeetingProvider", onlineMeetingProvider);
        formData.set("onlineMeetingUrl", onlineMeetingUrl);
      }

      formData.set("sessions", JSON.stringify(sessions));
      if (registrationDeadline) {
        formData.set("registrationDeadline", registrationDeadline);
      }

      if (capacity) formData.set("capacity", capacity);
      formData.set("isFree", isFree.toString());
      if (!isFree && priceAmount) {
        formData.set("priceAmount", priceAmount);
      }
      formData.set("priceCurrency", priceCurrency);
      formData.set("allowPayAtVenue", allowPayAtVenue.toString());

      formData.set("notes", notes);
      formData.set("whatToBring", whatToBring);
      formData.set("preparationInstructions", preparationInstructions);
      formData.set("requiresHealthForm", requiresHealthForm.toString());

      formData.set("status", status);

      const result = await createProgram(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4, 5, 6, 7].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                step < currentStep
                  ? "bg-green-600 text-white"
                  : step === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step < currentStep ? <Check className="size-4" /> : step}
            </div>
            {step < 7 && (
              <div
                className={`h-0.5 w-8 ${step < currentStep ? "bg-green-600" : "bg-muted"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Template Selection */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose a schedule template</CardTitle>
            <CardDescription>
              Select the format that matches your program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:border-primary ${
                    templateId === template.id ? "border-primary ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{template.formatType}</Badge>
                      <Badge variant="secondary">
                        <Calendar className="mr-1 size-3" />
                        {template.defaultSessions.length} sessions
                      </Badge>
                      {template.defaultCapacity && (
                        <Badge variant="secondary">
                          <Users className="mr-1 size-3" />
                          {template.defaultCapacity}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Basic Info */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic information</CardTitle>
            <CardDescription>
              Give your program a name and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Program name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Isha Kriya Weekend — February 2026"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL slug</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    slugManuallyEdited.current = true;
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "")
                    );
                  }}
                  placeholder="isha-kriya-feb-2026"
                  maxLength={50}
                />
                <div className="flex shrink-0 items-center">
                  {slugStatus === "checking" && (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  )}
                  {slugStatus === "available" && (
                    <Check className="size-4 text-green-600" />
                  )}
                  {slugStatus === "taken" && (
                    <X className="size-4 text-destructive" />
                  )}
                </div>
              </div>
              {slugStatus === "taken" && (
                <p className="text-xs text-destructive">
                  This slug is already in use
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this program"
                maxLength={2000}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/2000 characters
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Venue */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Venue configuration</CardTitle>
            <CardDescription>
              Choose how this program will be conducted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Venue Type Tabs */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={venueType === "IN_PERSON" ? "default" : "outline"}
                onClick={() => setVenueType("IN_PERSON")}
              >
                <MapPin className="mr-2 size-4" />
                In Person
              </Button>
              <Button
                type="button"
                variant={venueType === "ONLINE" ? "default" : "outline"}
                onClick={() => setVenueType("ONLINE")}
              >
                <Video className="mr-2 size-4" />
                Online
              </Button>
              <Button
                type="button"
                variant={venueType === "HYBRID" ? "default" : "outline"}
                onClick={() => setVenueType("HYBRID")}
              >
                <MapPin className="mr-2 size-4" />
                <Video className="mr-2 size-4" />
                Hybrid
              </Button>
            </div>

            {/* In-Person or Hybrid: Venue Selection */}
            {(venueType === "IN_PERSON" || venueType === "HYBRID") && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={venueMode === "existing" ? "default" : "outline"}
                    onClick={() => setVenueMode("existing")}
                    disabled={venues.length === 0}
                  >
                    Select existing venue
                  </Button>
                  <Button
                    type="button"
                    variant={venueMode === "new" ? "default" : "outline"}
                    onClick={() => setVenueMode("new")}
                  >
                    Create new venue
                  </Button>
                </div>

                {venueMode === "existing" && venues.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select venue</Label>
                    <Select value={venueId} onValueChange={setVenueId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a venue" />
                      </SelectTrigger>
                      <SelectContent>
                        {venues.map((venue) => (
                          <SelectItem key={venue.id} value={venue.id}>
                            {venue.name} — {venue.city}, {venue.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {venueMode === "existing" && venues.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    You don&apos;t have any saved venues yet. Create your first
                    venue below.
                  </p>
                )}

                {venueMode === "new" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="venueName">Venue name</Label>
                      <Input
                        id="venueName"
                        value={newVenueName}
                        onChange={(e) => setNewVenueName(e.target.value)}
                        placeholder="e.g., Community Hall, Main Street"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venueAddress">Address</Label>
                      <Input
                        id="venueAddress"
                        value={newVenueAddress}
                        onChange={(e) => setNewVenueAddress(e.target.value)}
                        placeholder="Street address"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="venueCity">City</Label>
                        <Input
                          id="venueCity"
                          value={newVenueCity}
                          onChange={(e) => setNewVenueCity(e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="venueCountry">Country</Label>
                        <Input
                          id="venueCountry"
                          value={newVenueCountry}
                          onChange={(e) => setNewVenueCountry(e.target.value)}
                          placeholder="Country"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="saveVenue"
                        checked={saveVenue}
                        onChange={(e) => setSaveVenue(e.target.checked)}
                        className="size-4"
                      />
                      <Label htmlFor="saveVenue" className="cursor-pointer">
                        Save this venue for future programs
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Online or Hybrid: Meeting Details */}
            {(venueType === "ONLINE" || venueType === "HYBRID") && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Meeting provider</Label>
                  <Select
                    value={onlineMeetingProvider}
                    onValueChange={(val) =>
                      setOnlineMeetingProvider(
                        val as "ZOOM" | "GOOGLE_MEET" | "CUSTOM"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZOOM">Zoom</SelectItem>
                      <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
                      <SelectItem value="CUSTOM">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingUrl">Meeting URL</Label>
                  <Input
                    id="meetingUrl"
                    type="text"
                    value={onlineMeetingUrl}
                    onChange={(e) => setOnlineMeetingUrl(e.target.value)}
                    placeholder="zoom.us/j/123... or https://meet.google.com/..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the meeting link (https:// is optional)
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Schedule */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>
              Configure your program sessions - add, remove, or edit as needed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date (auto-fills first session)</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {sessions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Sessions ({sessions.length})</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const lastSession = sessions[sessions.length - 1];
                      const nextDate = new Date(lastSession.date);
                      nextDate.setDate(nextDate.getDate() + 1);
                      setSessions([
                        ...sessions,
                        {
                          date: nextDate.toISOString().split("T")[0],
                          startTime: lastSession.startTime,
                          endTime: lastSession.endTime,
                          title: `Session ${sessions.length + 1}`,
                        },
                      ]);
                    }}
                  >
                    <Plus className="mr-2 size-4" />
                    Add Session
                  </Button>
                </div>
                {sessions.map((session, index) => (
                  <div
                    key={index}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <Label htmlFor={`session-${index}-title`}>
                          Session title
                        </Label>
                        <Input
                          id={`session-${index}-title`}
                          value={session.title}
                          onChange={(e) => {
                            const updated = [...sessions];
                            updated[index].title = e.target.value;
                            setSessions(updated);
                          }}
                          placeholder={`Session ${index + 1}`}
                          maxLength={100}
                        />
                      </div>
                      {sessions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-destructive hover:text-destructive"
                          onClick={() => {
                            setSessions(sessions.filter((_, i) => i !== index));
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`session-${index}-date`}>Date</Label>
                      <Input
                        id={`session-${index}-date`}
                        type="date"
                        value={session.date}
                        onChange={(e) => {
                          const updated = [...sessions];
                          updated[index].date = e.target.value;
                          setSessions(updated);
                        }}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`session-${index}-start`}>
                          Start time
                        </Label>
                        <Input
                          id={`session-${index}-start`}
                          type="time"
                          value={session.startTime}
                          onChange={(e) => {
                            const updated = [...sessions];
                            updated[index].startTime = e.target.value;
                            setSessions(updated);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`session-${index}-end`}>
                          End time
                        </Label>
                        <Input
                          id={`session-${index}-end`}
                          type="time"
                          value={session.endTime}
                          onChange={(e) => {
                            const updated = [...sessions];
                            updated[index].endTime = e.target.value;
                            setSessions(updated);
                          }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-muted-foreground">
                      {new Date(session.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {" • "}
                      {session.startTime} - {session.endTime}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="registrationDeadline">
                Registration deadline (optional)
              </Label>
              <Input
                id="registrationDeadline"
                type="datetime-local"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Capacity & Pricing */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Capacity & pricing</CardTitle>
            <CardDescription>
              Set participant limits and program fees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (optional)</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFree"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="size-4"
              />
              <Label htmlFor="isFree" className="cursor-pointer">
                This is a free program
              </Label>
            </div>

            {!isFree && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceAmount}
                      onChange={(e) => setPriceAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={priceCurrency}
                      onValueChange={setPriceCurrency}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(venueType === "IN_PERSON" || venueType === "HYBRID") && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allowPayAtVenue"
                      checked={allowPayAtVenue}
                      onChange={(e) => setAllowPayAtVenue(e.target.checked)}
                      className="size-4"
                    />
                    <Label htmlFor="allowPayAtVenue" className="cursor-pointer">
                      Allow payment at venue
                    </Label>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 6: Additional Details */}
      {currentStep === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional details</CardTitle>
            <CardDescription>
              Provide helpful information for participants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any important notes for participants"
                maxLength={2000}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {notes.length}/2000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatToBring">What to bring (optional)</Label>
              <Textarea
                id="whatToBring"
                value={whatToBring}
                onChange={(e) => setWhatToBring(e.target.value)}
                placeholder="Items participants should bring"
                maxLength={2000}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {whatToBring.length}/2000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparation">
                Preparation instructions (optional)
              </Label>
              <Textarea
                id="preparation"
                value={preparationInstructions}
                onChange={(e) => setPreparationInstructions(e.target.value)}
                placeholder="How participants should prepare"
                maxLength={2000}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {preparationInstructions.length}/2000 characters
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requiresHealthForm"
                checked={requiresHealthForm}
                onChange={(e) => setRequiresHealthForm(e.target.checked)}
                className="size-4"
              />
              <Label htmlFor="requiresHealthForm" className="cursor-pointer">
                Require health form for registration
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 7: Review & Publish */}
      {currentStep === 7 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & publish</CardTitle>
            <CardDescription>
              Check your program details before publishing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Basic Information</h3>
              <p className="text-sm">
                <strong>Name:</strong> {name}
              </p>
              <p className="text-sm">
                <strong>Slug:</strong> {slug}
              </p>
              {description && (
                <p className="text-sm">
                  <strong>Description:</strong> {description}
                </p>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Venue</h3>
              <p className="text-sm">
                <strong>Type:</strong> {venueType}
              </p>
              {(venueType === "IN_PERSON" || venueType === "HYBRID") && (
                <p className="text-sm">
                  <strong>Venue:</strong>{" "}
                  {venueMode === "existing"
                    ? venues.find((v) => v.id === venueId)?.name
                    : newVenueName}
                </p>
              )}
              {(venueType === "ONLINE" || venueType === "HYBRID") && (
                <p className="text-sm">
                  <strong>Meeting:</strong> {onlineMeetingProvider}
                </p>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Schedule</h3>
              <p className="text-sm">
                <strong>Sessions:</strong> {sessions.length}
              </p>
              <p className="text-sm">
                <strong>First session:</strong>{" "}
                {sessions[0]
                  ? new Date(sessions[0].date).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Pricing</h3>
              <p className="text-sm">
                <strong>Price:</strong>{" "}
                {isFree
                  ? "Free"
                  : `${priceAmount} ${priceCurrency}`}
              </p>
              {capacity && (
                <p className="text-sm">
                  <strong>Capacity:</strong> {capacity}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isPending}
          >
            <ChevronLeft className="mr-2 size-4" />
            Back
          </Button>
        )}
        {currentStep < 7 && (
          <Button
            type="button"
            onClick={handleNext}
            className="ml-auto"
            disabled={isPending}
          >
            Next
            <ChevronRight className="ml-2 size-4" />
          </Button>
        )}
        {currentStep === 7 && (
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit("DRAFT")}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save as Draft"
              )}
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit("PUBLISHED")}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Program"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
