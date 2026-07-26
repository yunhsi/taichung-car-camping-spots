"use client";

import { BadgeDollarSign, CircleParking, Info, Toilet } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

const SELECTION_CRITERIA = [
  {
    icon: CircleParking,
    label: "設有停車場",
  },
  {
    icon: Toilet,
    label: "設有公廁",
  },
  {
    icon: BadgeDollarSign,
    label: "免門票或未標示門票收費",
  },
] as const;

export function AttractionSelectionCriteriaDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label="景點收錄說明"
          />
        }
      >
        <Info aria-hidden="true" data-icon="inline-start" />
        <span className="sm:hidden">收錄說明</span>
        <span className="hidden sm:inline">景點收錄說明</span>
      </DialogTrigger>

      <DialogContent className="overflow-hidden p-0">
        <header className="border-b border-border bg-linear-to-r from-secondary to-card px-6 py-5">
          <DialogTitle className="text-xl">景點收錄說明</DialogTitle>
          <DialogDescription className="mt-2 leading-6">
            景點取自臺中市觀光景點開放資料，保留具備基本停留條件的地點，並排除夜市、商圈、展館等較不適合車泊的場域。
          </DialogDescription>
        </header>
        <ul
          aria-label="景點入選條件"
          className="space-y-3 px-6 py-5"
        >
          {SELECTION_CRITERIA.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3 text-sm font-medium text-primary"
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </li>
          ))}
        </ul>

        <footer className="border-t border-border bg-muted px-6 py-4">
          <p className="text-sm leading-6 text-muted-foreground">
            此清單僅供行前探索，不代表場地允許過夜或車泊；出發前請查看景點資訊，並向管理單位確認現場規定。
          </p>
          <div className="mt-4 flex justify-end">
            <DialogClose render={<Button variant="outline" />}>
              關閉
            </DialogClose>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
