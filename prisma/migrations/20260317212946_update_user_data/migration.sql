/*
  Warnings:

  - Made the column `age` on table `SurveyResponse` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gender` on table `SurveyResponse` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SurveyResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT,
    "address" TEXT,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL
);
INSERT INTO "new_SurveyResponse" ("address", "age", "completed", "createdAt", "gender", "id", "name", "sessionId", "updatedAt") SELECT "address", "age", "completed", "createdAt", "gender", "id", "name", "sessionId", "updatedAt" FROM "SurveyResponse";
DROP TABLE "SurveyResponse";
ALTER TABLE "new_SurveyResponse" RENAME TO "SurveyResponse";
CREATE UNIQUE INDEX "SurveyResponse_sessionId_key" ON "SurveyResponse"("sessionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
