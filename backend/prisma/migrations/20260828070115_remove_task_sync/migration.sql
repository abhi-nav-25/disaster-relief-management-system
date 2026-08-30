/*
  Warnings:

  - You are about to drop the `TaskSyncEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TaskSyncEvent" DROP CONSTRAINT "TaskSyncEvent_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskSyncEvent" DROP CONSTRAINT "TaskSyncEvent_userId_fkey";

-- DropTable
DROP TABLE "TaskSyncEvent";
