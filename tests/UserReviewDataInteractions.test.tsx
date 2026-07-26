import assert from "node:assert/strict";
import test from "node:test";

import { testDom as dom } from "./testDom";

import { act, cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AttractionList } from "@/features/attractions/components/AttractionList/AttractionList";
import { readAttractions } from "@/features/attractions/data/attractions";
import { FavoriteToggleButton } from "@/features/favorites/components/FavoriteToggleButton";
import type { AttractionReview } from "@/features/reviews/types";
import { useOwnAttractionReview } from "@/features/reviews/useAttractionReviews";

import {
  createDeferred,
  installAuthenticatedFetchMock,
  resetReviewInteractionEnvironment,
  TEST_REVIEW_AUTHOR,
  TestProviders,
} from "./reviewInteractionTestUtils";

function OwnReviewsStatusProbe({ attractionId }: { attractionId: string }) {
  const { status } = useOwnAttractionReview(attractionId);

  return <p>本人評論狀態：{status}</p>;
}

test.afterEach(() => {
  cleanup();
  resetReviewInteractionEnvironment();
});

test("本人評論載入完成前不會誤顯示新增評論", async () => {
  const attraction = readAttractions()[0];
  const ownReviewsLoad = createDeferred<Response>();
  const existingReview: AttractionReview = {
    author: TEST_REVIEW_AUTHOR,
    id: "existing-review",
    attractionId: attraction.id,
    rating: 4,
    comment: "已存在的評論。",
    updatedAt: "2026-08-30T08:00:00.000Z",
  };
  installAuthenticatedFetchMock({
    initialPublicReviews: [existingReview],
    ownReviewsLoad,
  });
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <TestProviders>
      <AttractionList attractions={[attraction]} />
    </TestProviders>,
  );

  await user.click(
    await view.findByRole("button", {
      name: `查看「${attraction.name}」的評分與評論`,
    }),
  );
  const reviewsDialog = await view.findByRole("dialog", {
    name: `「${attraction.name}」評分與評論`,
  });
  const loadingButton = within(reviewsDialog).getByRole("button", {
    name: `正在載入「${attraction.name}」的評論狀態`,
  });

  assert.equal((loadingButton as HTMLButtonElement).disabled, true);
  assert.equal(
    within(reviewsDialog).queryByRole("button", {
      name: `為「${attraction.name}」評分`,
    }),
    null,
  );

  await act(async () => {
    ownReviewsLoad.resolve(Response.json({ reviews: [existingReview] }));
  });

  assert.ok(
    await within(reviewsDialog).findByRole("button", {
      name: `修改「${attraction.name}」的評分與評論`,
    }),
  );
});

test("本人評論載入失敗不會清除已載入的收藏", async () => {
  const attraction = readAttractions()[0];
  const ownReviewsLoad = createDeferred<Response>();
  installAuthenticatedFetchMock({ ownReviewsLoad });
  const view = render(
    <TestProviders>
      <FavoriteToggleButton
        attractionId={attraction.id}
        attractionName={attraction.name}
      />
      <OwnReviewsStatusProbe attractionId={attraction.id} />
    </TestProviders>,
  );

  const favoriteButton = await view.findByRole("button", {
    name: `收藏「${attraction.name}」`,
  });
  await waitFor(() => {
    assert.equal((favoriteButton as HTMLButtonElement).disabled, false);
  });

  await act(async () => {
    ownReviewsLoad.resolve(
      Response.json({ error: "failed" }, { status: 500 }),
    );
  });

  assert.ok(await view.findByText("本人評論狀態：error"));
  assert.equal((favoriteButton as HTMLButtonElement).disabled, false);
  assert.ok(view.getByText("我的評論載入失敗"));
});
