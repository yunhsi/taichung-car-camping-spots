import assert from "node:assert/strict";
import test from "node:test";

import { testDom as dom } from "./testDom";

import { cleanup, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { readAttractions } from "@/features/attractions/data/attractions";
import { PublicReviewsContent } from "@/features/reviews/components/PublicReviewsDialog/PublicReviewsContent";
import type { AttractionReview } from "@/features/reviews/types";

import {
  AUTHENTICATED_USER,
  installAuthenticatedFetchMock,
  resetReviewInteractionEnvironment,
  TestProviders,
} from "./reviewInteractionTestUtils";

test.afterEach(() => {
  cleanup();
  resetReviewInteractionEnvironment();
});

test("評論列表共用檢舉 Dialog，且不能檢舉自己的評論", async () => {
  const attraction = readAttractions()[0];
  const otherReview: AttractionReview = {
    author: {
      id: "4a10a3e4-f975-477f-b7a9-831661de9e0f",
      image: null,
      name: "其他旅人",
    },
    id: "c0de4fc5-9dcb-42e1-9869-7417ec2f7a8c",
    attractionId: attraction.id,
    rating: 2,
    comment: "需要檢舉的評論",
    updatedAt: "2026-08-31T08:00:00.000Z",
  };
  const ownReview: AttractionReview = {
    ...otherReview,
    author: { id: AUTHENTICATED_USER.id, image: null, name: "測試旅人" },
    id: "da3c30b2-af89-4cd2-9544-7757da03b212",
    comment: "自己的評論",
  };
  const requests = installAuthenticatedFetchMock({
    initialPublicReviews: [otherReview, ownReview],
  });
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <TestProviders>
      <PublicReviewsContent
        attractionName={attraction.name}
        canReview
        hasOwnReview
        isOwnReviewLoaded
        reviews={[otherReview, ownReview]}
        onOpenReview={() => undefined}
      />
    </TestProviders>,
  );

  const reportButton = view.getByRole("button", {
    name: "檢舉 其他旅人 的評論",
  });
  assert.equal(
    view.queryByRole("button", { name: "檢舉 測試旅人 的評論" }),
    null,
  );

  await user.click(reportButton);
  const reportDialog = await view.findByRole("dialog", {
    name: "檢舉這則評論",
  });
  assert.equal(
    dom.window.document.querySelectorAll("[data-review-report-dialog]").length,
    1,
  );
  await user.selectOptions(
    within(reportDialog).getByLabelText("檢舉原因"),
    "false_information",
  );
  await user.type(
    within(reportDialog).getByLabelText("補充說明（選填）"),
    "資訊與現場不同",
  );
  await user.click(
    within(reportDialog).getByRole("button", { name: "送出檢舉" }),
  );

  assert.ok(await view.findByText("檢舉已送出"));
  assert.equal(
    requests.some(
      (request) =>
        request.method === "POST" && request.url === "/api/review-reports",
    ),
    true,
  );
  assert.equal(dom.window.document.activeElement, reportButton);
});
