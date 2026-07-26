import assert from "node:assert/strict";
import test from "node:test";

import { testDom as dom } from "./testDom";

import type { ReactNode } from "react";

import {
  act,
  cleanup,
  render,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ToastProvider } from "@/components/ui/Toast";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { AttractionList } from "@/features/attractions/components/AttractionList/AttractionList";
import { readAttractions } from "@/features/attractions/data/attractions";
import {
  getAttractionReviewsSnapshot,
  getOwnAttractionReviewSnapshot,
  replaceAttractionReviews,
} from "@/features/reviews/data/reviewsStore";
import { PublicReviewsContent } from "@/features/reviews/components/PublicReviewsDialog/PublicReviewsContent";
import type { AttractionReview } from "@/features/reviews/types";
import { useUserData } from "@/features/user/components/UserDataProvider";

import {
  createDeferred,
  installAuthenticatedFetchMock,
  resetReviewInteractionEnvironment,
  TEST_REVIEW_AUTHOR,
  TestProviders as SharedTestProviders,
} from "./reviewInteractionTestUtils";

function UserStatusProbe() {
  const { user } = useUserData();

  return <p>{user ? "authenticated" : "unauthenticated"}</p>;
}

function DeleteReviewControl({
  attractionId,
  onDeleted,
}: {
  attractionId: string;
  onDeleted: () => void;
}) {
  const { deleteReview } = useUserData();

  return (
    <button
      type="button"
      onClick={() => {
        void deleteReview(attractionId).then(onDeleted);
      }}
    >
      刪除測試評論
    </button>
  );
}

function TestProviders({ children }: { children: ReactNode }) {
  return (
    <SharedTestProviders>
      <UserStatusProbe />
      {children}
    </SharedTestProviders>
  );
}

test.afterEach(() => {
  cleanup();
  resetReviewInteractionEnvironment();
});

test("未登入可閱讀所有公開評論與平均評分但不會看到編輯控制", () => {
  const attraction = readAttractions()[0];
  const reviews: AttractionReview[] = [
    {
      author: {
        id: "4a10a3e4-f975-477f-b7a9-831661de9e0f",
        image: "/avatar.jpg",
        name: "有頭像旅人",
      },
      id: "public-review-1",
      attractionId: attraction.id,
      rating: 5,
      comment: "公開可見的評論",
      updatedAt: "2026-08-02T08:00:00.000Z",
    },
    {
      author: {
        id: "c0de4fc5-9dcb-42e1-9869-7417ec2f7a8c",
        image: null,
        name: "無頭像旅人",
      },
      id: "public-review-2",
      attractionId: attraction.id,
      rating: 3,
      comment: "另一則公開評論",
      updatedAt: "2026-08-01T08:00:00.000Z",
    },
  ];

  act(() => {
    replaceAttractionReviews(attraction.id, reviews);
  });

  const view = render(
    <TooltipProvider>
      <ToastProvider>
        <PublicReviewsContent
          attractionName={attraction.name}
          canReview={false}
          hasOwnReview={false}
          isOwnReviewLoaded
          reviews={reviews}
          onOpenReview={() => undefined}
        />
      </ToastProvider>
    </TooltipProvider>,
  );

  assert.ok(view.getByText("公開可見的評論"));
  assert.ok(view.getByText("另一則公開評論"));
  assert.ok(view.getByRole("img", { name: "有頭像旅人 的頭像" }));
  assert.ok(view.getByLabelText("無頭像旅人 的預設頭像"));
  assert.ok(view.getByText("4.0"));
  assert.ok(view.getByText("共 2 則公開評論"));
  assert.equal(view.getAllByRole("listitem").length, 2);
  assert.equal(
    view.queryByRole("button", {
      name: `修改「${attraction.name}」的評分與評論`,
    }),
    null,
  );
});

test("評論送出期間避免重複請求，成功後直接更新畫面", async () => {
  const attraction = readAttractions()[0];
  const reviewSave = createDeferred<Response>();
  const requests = installAuthenticatedFetchMock({ reviewSave });
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <TestProviders>
      <AttractionList attractions={[attraction]} />
    </TestProviders>,
  );

  await view.findByText("authenticated");
  await user.click(
    await view.findByRole("button", {
      name: `查看「${attraction.name}」的評分與評論`,
    }),
  );
  const reviewsDialog = await view.findByRole("dialog", {
    name: `「${attraction.name}」評分與評論`,
  });
  await user.click(
    within(reviewsDialog).getByRole("button", {
      name: `為「${attraction.name}」評分`,
    }),
  );
  const dialog = await view.findByRole("dialog", {
    name: `新增「${attraction.name}」的評分`,
  });
  await user.click(within(dialog).getByRole("radio", { name: "4 顆星" }));
  await user.type(
    within(dialog).getByLabelText("留言評論"),
    "停車方便，環境安靜。",
  );
  await user.click(
    within(dialog).getByRole("button", { name: "送出評論" }),
  );

  const pendingButton = within(dialog).getByRole("button", {
    name: "送出中…",
  });
  assert.equal(pendingButton.getAttribute("aria-busy"), "true");
  assert.equal((pendingButton as HTMLButtonElement).disabled, true);
  pendingButton.click();
  assert.equal(
    requests.filter((request) => request.method === "POST").length,
    1,
  );

  const savedReview: AttractionReview = {
    author: TEST_REVIEW_AUTHOR,
    id: "review-1",
    attractionId: attraction.id,
    rating: 4,
    comment: "停車方便，環境安靜。",
    updatedAt: "2026-08-29T08:00:00.000Z",
  };
  await act(async () => {
    reviewSave.resolve(Response.json({ review: savedReview }));
  });

  await waitFor(() => {
    assert.equal(
      view.queryByRole("dialog", {
        name: `新增「${attraction.name}」的評分`,
      }),
      null,
    );
  });
  assert.equal(view.getAllByText("4.0").length, 2);
  assert.equal(getOwnAttractionReviewSnapshot(attraction.id)?.id, savedReview.id);
  assert.deepEqual(getAttractionReviewsSnapshot(attraction.id), [savedReview]);
  assert.equal(
    requests.filter(
      (request) =>
        request.method === "GET" &&
        request.url.startsWith("/api/reviews?attractionId="),
    ).length,
    1,
  );
});

test("評論包含不適當用語時會在送出前阻擋", async () => {
  const attraction = readAttractions()[0];
  const requests = installAuthenticatedFetchMock();
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <TestProviders>
      <AttractionList attractions={[attraction]} />
    </TestProviders>,
  );

  await view.findByText("authenticated");
  await user.click(
    await view.findByRole("button", {
      name: `查看「${attraction.name}」的評分與評論`,
    }),
  );
  const reviewsDialog = await view.findByRole("dialog", {
    name: `「${attraction.name}」評分與評論`,
  });
  await user.click(
    within(reviewsDialog).getByRole("button", {
      name: `為「${attraction.name}」評分`,
    }),
  );
  const editorDialog = await view.findByRole("dialog", {
    name: `新增「${attraction.name}」的評分`,
  });

  await user.click(
    within(editorDialog).getByRole("radio", { name: "4 顆星" }),
  );
  await user.type(
    within(editorDialog).getByLabelText("留言評論"),
    "你這個白-癡",
  );
  await user.click(
    within(editorDialog).getByRole("button", { name: "送出評論" }),
  );

  assert.ok(
    within(editorDialog).getByText(
      "評論包含不適當用語，請修改後再送出。",
    ),
  );
  assert.equal(
    requests.filter((request) => request.method === "POST").length,
    0,
  );
});

test("評論更新失敗時會解除 pending 並保留表單", async () => {
  const attraction = readAttractions()[0];
  const reviewSave = createDeferred<Response>();
  const existingReview: AttractionReview = {
    author: TEST_REVIEW_AUTHOR,
    id: "review-1",
    attractionId: attraction.id,
    rating: 4,
    comment: "原本的評論。",
    updatedAt: "2026-08-28T08:00:00.000Z",
  };
  installAuthenticatedFetchMock({
    initialOwnReviews: [existingReview],
    initialPublicReviews: [existingReview],
    reviewSave,
  });
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <TestProviders>
      <AttractionList attractions={[attraction]} />
    </TestProviders>,
  );

  await view.findByText("authenticated");
  await user.click(
    await view.findByRole("button", {
      name: `查看「${attraction.name}」的評分與評論`,
    }),
  );
  const reviewsDialog = await view.findByRole("dialog", {
    name: `「${attraction.name}」評分與評論`,
  });
  await user.click(
    within(reviewsDialog).getByRole("button", {
      name: `修改「${attraction.name}」的評分與評論`,
    }),
  );
  const dialog = await view.findByRole("dialog", {
    name: `修改「${attraction.name}」的評分`,
  });
  await user.click(
    within(dialog).getByRole("button", { name: "更新評論" }),
  );
  assert.ok(
    within(dialog).getByRole("button", { name: "更新中…" }),
  );

  await act(async () => {
    reviewSave.resolve(Response.json({ error: "failed" }, { status: 500 }));
  });

  await waitFor(() => {
    const updateButton = within(dialog).getByRole("button", {
      name: "更新評論",
    });
    assert.equal((updateButton as HTMLButtonElement).disabled, false);
  });
  assert.ok(view.getByText("更新失敗").closest('[data-slot="toast"]'));
  assert.ok(view.getByRole("dialog"));
});

test("評論刪除成功後會直接更新本人評論與公開摘要", async () => {
  const attraction = readAttractions()[0];
  let didDelete = false;
  const existingReview: AttractionReview = {
    author: TEST_REVIEW_AUTHOR,
    id: "review-1",
    attractionId: attraction.id,
    rating: 4,
    comment: "準備刪除的評論。",
    updatedAt: "2026-08-28T08:00:00.000Z",
  };
  installAuthenticatedFetchMock({
    initialOwnReviews: [existingReview],
    initialPublicReviews: [existingReview],
  });
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <TestProviders>
      <DeleteReviewControl
        attractionId={attraction.id}
        onDeleted={() => {
          didDelete = true;
        }}
      />
    </TestProviders>,
  );

  await view.findByText("authenticated");
  await waitFor(() => {
    assert.equal(
      getOwnAttractionReviewSnapshot(attraction.id)?.id,
      existingReview.id,
    );
  });
  await user.click(
    view.getByRole("button", { name: "刪除測試評論" }),
  );

  await waitFor(() => {
    assert.equal(didDelete, true);
  });
  assert.equal(getOwnAttractionReviewSnapshot(attraction.id), undefined);
  assert.deepEqual(getAttractionReviewsSnapshot(attraction.id), []);
  assert.equal(view.queryByRole("alert"), null);
});
