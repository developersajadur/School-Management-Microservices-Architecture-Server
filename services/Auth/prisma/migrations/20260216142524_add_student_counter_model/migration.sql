-- CreateTable
CREATE TABLE "StudentCounter" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "year" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StudentCounter_pkey" PRIMARY KEY ("id")
);
