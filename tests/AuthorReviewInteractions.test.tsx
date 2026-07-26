import assert from "node:assert/strict";
import test from "node:test";

import { testDom as dom } from "./testDom";

import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/Dialog";
import { readAttractions } from "@/features/attractions/data/attractions";
import { PublicReviewsContent } from "@/features/reviews/components/PublicReviewsDialog/PublicReviewsContent";
import type {
  AttractionReview,
  AuthorReview,
} from "@/features/reviews/types";

const ORIGINAL_FETCH = globalThis.fetch;
const TEST_AUTHOR_ID = "25e3af15-8024-427c-8840-4e4f2d2b2149";

test.afterEach(() => {
  cleanup();
  globalThis.fetch = ORIGINAL_FETCH;
});

test("點擊其他旅人的頭像可查看該旅人的所有評論", async () => {
  const [attraction, otherAttraction] = readAttractions();
  const visibleReviews = [
    createReview("visible-review", attraction.id, "露營旅人", TEST_AUTHOR_ID),
  ];
  const authorReviews = [
    visibleReviews[0],
    createReview(
      "other-review",
      otherAttraction.id,
      "露營旅人",
      TEST_AUTHOR_ID,
    ),
  ];
  const requestedUrls: string[] = [];
  globalThis.fetch = async (input) => {
    requestedUrls.push(String(input));
    return Response.json({ hasMore: false, reviews: authorReviews });
  };
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderReviewsInDialog(visibleReviews);
  const trigger = view.getByRole("button", {
    name: "查看 露營旅人 的所有評論",
  });

  await user.click(trigger);

  const authorDialog = view.getByRole("dialog", { name: "露營旅人" });
  const reviewList = await within(authorDialog).findByRole("list", {
    name: "露營旅人 的公開評論列表",
  });

  assert.deepEqual(requestedUrls, [
    `/api/reviews?authorId=${TEST_AUTHOR_ID}`,
  ]);
  assert.ok(within(authorDialog).getByText("共 2 則公開評論"));
  assert.equal(
    within(authorDialog).queryByRole("group", { name: "評論排序" }),
    null,
  );
  assert.ok(within(reviewList).getByText(attraction.name));
  assert.ok(within(reviewList).getByText(otherAttraction.name));
  assert.equal(view.queryByText("traveler@example.com"), null);

  await user.keyboard("{Escape}");

  assert.equal(view.queryByRole("dialog", { name: "露營旅人" }), null);
  assert.equal(dom.window.document.activeElement, trigger);

  await user.click(trigger);
  await waitFor(() => {
    assert.deepEqual(requestedUrls, [
      `/api/reviews?authorId=${TEST_AUTHOR_ID}`,
      `/api/reviews?authorId=${TEST_AUTHOR_ID}`,
    ]);
  });
});

test("同時只開啟一位旅人的資訊，點擊巢狀遮罩可關閉", async () => {
  const attraction = readAttractions()[0];
  const reviews = [
    createReview("first-review", attraction.id, "第一位旅人", TEST_AUTHOR_ID),
    createReview(
      "second-review",
      attraction.id,
      "第二位旅人",
      "9dd12a8d-d31b-4df1-9d39-940baf9fc9ac",
    ),
  ];
  globalThis.fetch = async () =>
    Response.json({ hasMore: false, reviews: [] });
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderReviewsInDialog(reviews);
  const firstTrigger = view.getByRole("button", {
    name: "查看 第一位旅人 的所有評論",
  });

  await user.click(firstTrigger);

  assert.ok(view.getByRole("dialog", { name: "第一位旅人" }));
  assert.equal(view.getAllByRole("dialog", { hidden: true }).length, 2);

  const overlay = dom.window.document.querySelector(
    '[data-slot="dialog-overlay"].z-80',
  );
  assert.ok(overlay instanceof dom.window.HTMLElement);
  fireEvent.pointerDown(overlay);
  fireEvent.click(overlay);

  await waitFor(() => {
    assert.equal(
      view.queryByRole("dialog", { name: "第一位旅人" }),
      null,
    );
  });
  assert.ok(view.getByRole("dialog", { name: "評分與評論" }));
  assert.equal(dom.window.document.activeElement, firstTrigger);

  await user.click(
    view.getByRole("button", {
      name: "查看 第二位旅人 的所有評論",
    }),
  );

  assert.ok(view.getByRole("dialog", { name: "第二位旅人" }));
  assert.equal(view.getAllByRole("dialog", { hidden: true }).length, 2);
});

test("作者評論可分頁載入直到全部顯示", async () => {
  const [attraction, otherAttraction] = readAttractions();
  const visibleReviews = [
    createReview("visible-review", attraction.id, "分頁旅人", TEST_AUTHOR_ID),
  ];
  const requests: string[] = [];
  globalThis.fetch = async (input) => {
    const url = String(input);
    requests.push(url);

    return url.includes("offset=2")
      ? Response.json({
          hasMore: false,
          reviews: [
            createReview(
              "page-2-review",
              otherAttraction.id,
              "分頁旅人",
              TEST_AUTHOR_ID,
            ),
          ],
        })
      : Response.json({
          hasMore: true,
          reviews: [
            createReview("page-1-review-a", attraction.id, "分頁旅人", TEST_AUTHOR_ID),
            createReview("page-1-review-b", attraction.id, "分頁旅人", TEST_AUTHOR_ID),
          ],
        });
  };
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderReviewsInDialog(visibleReviews);

  await user.click(
    view.getByRole("button", { name: "查看 分頁旅人 的所有評論" }),
  );

  const authorDialog = view.getByRole("dialog", { name: "分頁旅人" });
  const loadMoreButton = await within(authorDialog).findByRole("button", {
    name: "載入更多評論",
  });
  assert.ok(within(authorDialog).getByText("已載入 2 則公開評論"));

  await user.click(loadMoreButton);

  assert.ok(await within(authorDialog).findByText("共 3 則公開評論"));
  assert.equal(
    within(authorDialog).queryByRole("button", { name: "載入更多評論" }),
    null,
  );
  assert.deepEqual(requests, [
    `/api/reviews?authorId=${TEST_AUTHOR_ID}`,
    `/api/reviews?authorId=${TEST_AUTHOR_ID}&offset=2`,
  ]);
});

test("重新開啟作者評論時不會合併先前尚未完成的分頁", async () => {
  const [attraction, otherAttraction] = readAttractions();
  const visibleReviews = [
    createReview("visible-review", attraction.id, "競態旅人", TEST_AUTHOR_ID),
  ];
  let resolveStalePage: ((response: Response) => void) | undefined;
  let initialRequestCount = 0;
  globalThis.fetch = async (input) => {
    const url = String(input);

    if (url.includes("offset=1")) {
      return new Promise<Response>((resolve) => {
        resolveStalePage = resolve;
      });
    }

    initialRequestCount += 1;
    return Response.json({
      hasMore: initialRequestCount === 1,
      reviews: [
        createReview(
          initialRequestCount === 1 ? "first-page" : "fresh-page",
          attraction.id,
          "競態旅人",
          TEST_AUTHOR_ID,
        ),
      ],
    });
  };
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderReviewsInDialog(visibleReviews);
  const trigger = view.getByRole("button", {
    name: "查看 競態旅人 的所有評論",
  });

  await user.click(trigger);
  const firstDialog = view.getByRole("dialog", { name: "競態旅人" });
  await user.click(
    await within(firstDialog).findByRole("button", {
      name: "載入更多評論",
    }),
  );
  await user.keyboard("{Escape}");
  await user.click(trigger);

  const reopenedDialog = view.getByRole("dialog", { name: "競態旅人" });
  assert.ok(await within(reopenedDialog).findByText("fresh-page 的評論內容"));

  resolveStalePage?.(
    Response.json({
      hasMore: false,
      reviews: [
        createReview(
          "stale-page",
          otherAttraction.id,
          "競態旅人",
          TEST_AUTHOR_ID,
        ),
      ],
    }),
  );
  await waitFor(() => {
    assert.equal(within(reopenedDialog).queryByText("stale-page 的評論內容"), null);
  });
});

function renderReviewsInDialog(reviews: readonly AttractionReview[]) {
  const attraction = readAttractions()[0];

  return render(
    <Dialog open>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>評分與評論</DialogTitle>
        <PublicReviewsContent
          attractionName={attraction.name}
          canReview={false}
          hasOwnReview={false}
          isOwnReviewLoaded
          reviews={reviews}
          onOpenReview={() => undefined}
        />
      </DialogContent>
    </Dialog>,
  );
}

function createReview(
  id: string,
  attractionId: string,
  authorName: string,
  authorId: string,
): AuthorReview {
  const attractionName =
    readAttractions().find((attraction) => attraction.id === attractionId)?.name ??
    "未知景點";

  return {
    author: { id: authorId, image: null, name: authorName },
    id,
    attractionId,
    attractionName,
    rating: 5,
    comment: `${id} 的評論內容`,
    updatedAt: "2026-08-03T08:00:00.000Z",
  };
}
