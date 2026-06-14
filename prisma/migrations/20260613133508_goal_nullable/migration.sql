-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Petition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "goal" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "audience" TEXT NOT NULL DEFAULT 'ALL',
    "rejectReason" TEXT,
    "officialResponse" TEXT,
    "officialResponseAt" DATETIME,
    "relatedToId" TEXT,
    "categoryId" TEXT,
    "organizationId" TEXT,
    "authorId" TEXT NOT NULL,
    "closesAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Petition_relatedToId_fkey" FOREIGN KEY ("relatedToId") REFERENCES "Petition" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Petition_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Petition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Petition_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Petition" ("audience", "authorId", "categoryId", "closesAt", "createdAt", "description", "goal", "id", "officialResponse", "officialResponseAt", "organizationId", "rejectReason", "relatedToId", "status", "title", "updatedAt") SELECT "audience", "authorId", "categoryId", "closesAt", "createdAt", "description", "goal", "id", "officialResponse", "officialResponseAt", "organizationId", "rejectReason", "relatedToId", "status", "title", "updatedAt" FROM "Petition";
DROP TABLE "Petition";
ALTER TABLE "new_Petition" RENAME TO "Petition";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
