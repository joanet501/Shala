"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Camera, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { completeOnboarding } from "@/lib/actions/onboarding";
import {
  AVAILABLE_LANGUAGES,
  SLUG_REGEX,
} from "@/lib/validations/onboarding";

interface OnboardingFormProps {
  teacher: {
    id: string;
    name: string;
    slug: string;
    city: string;
    country: string;
    languages: string[];
    photoUrl: string | null;
    bio: string;
  };
}

export function OnboardingForm({ teacher }: OnboardingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const [name, setName] = useState(teacher.name);
  const [slug, setSlug] = useState(teacher.slug);
  const [city, setCity] = useState(teacher.city);
  const [country, setCountry] = useState(teacher.country);
  const [languages, setLanguages] = useState<string[]>(teacher.languages);
  const [bio, setBio] = useState(teacher.bio);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(teacher.photoUrl);

  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >(teacher.slug ? "available" : "idle");

  const slugManuallyEdited = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-derive slug from name (unless manually edited)
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

    if (slug === teacher.slug) {
      setSlugStatus("available");
      return;
    }

    setSlugStatus("checking");
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/teachers/check-slug?slug=${encodeURIComponent(slug)}&teacherId=${teacher.id}`,
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
  }, [slug, teacher.slug, teacher.id]);

  // Clean up photo preview blob URL
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function handleFileSelect(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    const preview = URL.createObjectURL(file);
    setPhotoFile(file);
    setPhotoPreview(preview);
  }

  async function uploadPhoto(): Promise<string | null> {
    if (!photoFile) return photoUrl;

    const supabase = createClient();
    const ext = photoFile.name.split(".").pop() || "jpg";
    const path = `${teacher.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, photoFile, { cacheControl: "3600", upsert: false });

    if (error) {
      toast.error("Photo upload failed. Please try again.");
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    return publicUrl;
  }

  function handleSubmit() {
    if (slugStatus === "taken") {
      toast.error("Please choose a different URL — this one is taken");
      return;
    }
    if (slugStatus === "checking") {
      toast.error("Please wait for URL availability check to complete");
      return;
    }
    if (languages.length === 0) {
      toast.error("Select at least one language");
      return;
    }

    startTransition(async () => {
      setIsUploading(true);
      const uploadedUrl = await uploadPhoto();
      setIsUploading(false);

      if (photoFile && !uploadedUrl) return; // upload failed, error already shown

      const formData = new FormData();
      formData.set("name", name);
      formData.set("slug", slug);
      formData.set("city", city);
      formData.set("country", country);
      formData.set("languages", JSON.stringify(languages));
      formData.set("photoUrl", uploadedUrl || "");
      formData.set("bio", bio);

      const result = await completeOnboarding(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  const isSubmitting = isPending || isUploading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Complete your profile</CardTitle>
        <CardDescription>
          Set up your teaching profile to get started with Shala
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photo upload */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="group relative cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files[0];
              if (file) handleFileSelect(file);
            }}
          >
            <Avatar className="size-24">
              <AvatarImage src={photoPreview || photoUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-6 text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Click or drag to upload photo
          </p>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">Your URL</Label>
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
              placeholder="your-name"
              required
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
          <p className="text-xs text-muted-foreground">
            shala.com/t/<span className="font-medium">{slug || "..."}</span>
          </p>
          {slugStatus === "taken" && (
            <p className="text-xs text-destructive">
              This URL is already taken
            </p>
          )}
        </div>

        {/* City & Country */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Bangalore"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. India"
              required
            />
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <Label>Languages you teach in</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_LANGUAGES.map((lang) => {
              const isSelected = languages.includes(lang.code);
              return (
                <Badge
                  key={lang.code}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer select-none"
                  onClick={() => {
                    if (isSelected) {
                      if (languages.length === 1) {
                        toast.error("Select at least one language");
                        return;
                      }
                      setLanguages(languages.filter((l) => l !== lang.code));
                    } else {
                      setLanguages([...languages, lang.code]);
                    }
                  }}
                >
                  {lang.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio (optional)</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Brief description shown on your public page"
            maxLength={500}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            {bio.length}/500 characters
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting || slugStatus === "taken"}
        >
          {isUploading
            ? "Uploading photo..."
            : isPending
              ? "Saving..."
              : "Complete setup"}
        </Button>
      </CardFooter>
    </Card>
  );
}
