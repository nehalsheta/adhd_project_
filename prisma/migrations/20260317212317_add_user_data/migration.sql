-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT,
    "address" TEXT,
    "age" INTEGER,
    "gender" TEXT
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "surveyId" TEXT NOT NULL,
    "symptomId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "impactAreas" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    CONSTRAINT "Answer_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "SurveyResponse" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_sessionId_key" ON "SurveyResponse"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_surveyId_symptomId_key" ON "Answer"("surveyId", "symptomId");
