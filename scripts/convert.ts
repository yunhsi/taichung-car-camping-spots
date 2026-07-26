import { readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import Papa from "papaparse";

import {
  convertAttractionRows,
  type CsvRow,
  validateCsvColumns,
  validateCsvRows,
} from "./convertAttractions";

const DATA_DIRECTORY = path.resolve(
  process.cwd(),
  "src/features/attractions/data",
);
const INPUT_PATH = path.join(DATA_DIRECTORY, "taichung-attraction.csv");
const ATTRACTION_LIST_OUTPUT_PATH = path.join(
  DATA_DIRECTORY,
  "taichung-attraction-list.json",
);
const ATTRACTION_DETAILS_OUTPUT_PATH = path.join(
  DATA_DIRECTORY,
  "taichung-attraction-details.json",
);
const THEME_CATEGORY_LIST_OUTPUT_PATH = path.join(
  DATA_DIRECTORY,
  "taichung-theme-categories.json",
);

async function convertCsvToJson(): Promise<void> {
  const rows = await readAndValidateCsv();
  const { attractionList, attractionDetails, themeCategories } =
    convertAttractionRows(rows);

  await Promise.all([
    writeJsonFile(ATTRACTION_LIST_OUTPUT_PATH, attractionList),
    writeJsonFile(ATTRACTION_DETAILS_OUTPUT_PATH, attractionDetails),
    writeJsonFile(THEME_CATEGORY_LIST_OUTPUT_PATH, themeCategories),
  ]);

  process.stdout.write(
    [
      `已產生 ${attractionList.length} 筆景點列表至 ${ATTRACTION_LIST_OUTPUT_PATH}`,
      `已產生 ${Object.keys(attractionDetails).length} 筆景點詳細至 ${ATTRACTION_DETAILS_OUTPUT_PATH}`,
      `已產生 ${themeCategories.length} 筆主題分類清單至 ${THEME_CATEGORY_LIST_OUTPUT_PATH}`,
    ].join("\n") + "\n",
  );
}

async function readAndValidateCsv(): Promise<CsvRow[]> {
  const csv = await readFile(INPUT_PATH, "utf8");
  const result = Papa.parse<CsvRow>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    const messages = result.errors
      .map(({ code, message, row }) => {
        const rowLabel = row === undefined ? "" : `（第 ${row + 1} 列）`;
        return `${code}${rowLabel}: ${message}`;
      })
      .join("\n");

    throw new Error(`CSV 解析失敗：\n${messages}`);
  }

  validateCsvColumns(result.meta.fields ?? []);
  validateCsvRows(result.data);

  return result.data;
}

async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  const json = `${JSON.stringify(data, null, 2)}\n`;
  const temporaryFilePath = `${filePath}.tmp`;

  try {
    await writeFile(temporaryFilePath, json, "utf8");
    await rename(temporaryFilePath, filePath);
  } catch (writeError: unknown) {
    try {
      await rm(temporaryFilePath, { force: true });
    } catch (cleanupError: unknown) {
      throw new AggregateError(
        [writeError, cleanupError],
        "無法更新 JSON，且暫存檔清理失敗",
      );
    }

    throw writeError;
  }
}

convertCsvToJson().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`轉換失敗：${message}\n`);
  process.exitCode = 1;
});
