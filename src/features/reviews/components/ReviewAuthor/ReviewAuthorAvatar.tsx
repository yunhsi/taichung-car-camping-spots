"use client";

import { useState } from "react";

import Image from "next/image";
import { UserRound } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface ReviewAuthorAvatarProps {
  image: string | null;
  name: string;
  onOpen: (trigger: HTMLButtonElement) => void;
}

export function ReviewAuthorAvatar({
  image,
  name,
  onOpen,
}: ReviewAuthorAvatarProps) {
  const [didImageFail, setDidImageFail] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-10 rounded-full p-0"
      aria-label={`查看 ${name} 的所有評論`}
      onClick={(event) => onOpen(event.currentTarget)}
    >
      <ReviewAuthorImage
        image={didImageFail ? null : image}
        name={name}
        onImageError={() => setDidImageFail(true)}
      />
    </Button>
  );
}

interface ReviewAuthorImageProps {
  image: string | null;
  name: string;
  onImageError?: () => void;
  size?: "default" | "large";
}

export function ReviewAuthorImage({
  image,
  name,
  onImageError,
  size = "default",
}: ReviewAuthorImageProps) {
  const sizeClassName = size === "large" ? "size-12" : "size-10";

  if (image) {
    return (
      <Image
        src={image}
        alt={`${name} 的頭像`}
        width={size === "large" ? 48 : 40}
        height={size === "large" ? 48 : 40}
        className={`${sizeClassName} shrink-0 rounded-full border border-primary/20 bg-muted object-cover`}
        onError={onImageError}
      />
    );
  }

  return (
    <span
      aria-label={`${name} 的預設頭像`}
      className={`flex ${sizeClassName} shrink-0 items-center justify-center rounded-full border border-primary/20 bg-secondary text-primary`}
    >
      <UserRound
        aria-hidden="true"
        className={size === "large" ? "size-6" : "size-5"}
      />
    </span>
  );
}
