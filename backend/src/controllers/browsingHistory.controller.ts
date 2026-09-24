import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { BrowsingHistory } from '../entities/BrowsingHistory';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

// 每人最多保留 50 本浏览记录
const HISTORY_LIMIT = 50;

export const getBrowsingHistory = async (req: AuthenticatedRequest, res: Response) => {
  const historyRepository = AppDataSource.getRepository(BrowsingHistory);
  const histories = await historyRepository.find({
    where: { userId: req.userId },
    relations: { book: { seller: true } },
    order: { viewedAt: 'DESC' },
    take: HISTORY_LIMIT,
    select: {
      id: true,
      viewedAt: true,
      book: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        originalPrice: true,
        price: true,
        condition: true,
        images: true,
        tradeMethod: true,
        campus: true,
        category: true,
        description: true,
        status: true,
        sellerId: true,
        createdAt: true,
        updatedAt: true,
        seller: {
          id: true,
          name: true,
          avatarUrl: true,
          department: true,
        },
      },
    },
  });

  // 书籍可能已被删除，过滤掉无效记录
  res.json(histories.filter(item => item.book));
};

export const removeBrowsingHistory = async (req: AuthenticatedRequest, res: Response) => {
  const { bookId } = req.params;

  await AppDataSource.getRepository(BrowsingHistory).delete({
    userId: req.userId,
    bookId,
  });

  res.json({ message: '已移除' });
};

export const clearBrowsingHistory = async (req: AuthenticatedRequest, res: Response) => {
  await AppDataSource.getRepository(BrowsingHistory).delete({ userId: req.userId });

  res.json({ message: '已清空' });
};

// 打开详情页时写入足迹：同一本书只保留一条，反复浏览刷新浏览时间并挪到最前
export const recordBrowsingHistory = async (userId: string, bookId: string) => {
  const historyRepository = AppDataSource.getRepository(BrowsingHistory);
  const viewedAt = new Date();

  await historyRepository.upsert(
    { userId, bookId, viewedAt },
    { conflictPaths: ['userId', 'bookId'] }
  );

  // 超过上限时删除最旧的记录
  await historyRepository
    .createQueryBuilder()
    .delete()
    .where('userId = :userId', { userId })
    .andWhere(
      `id NOT IN (
        SELECT id FROM (
          SELECT id FROM browsing_history
          WHERE userId = :userId
          ORDER BY viewedAt DESC
          LIMIT :limit
        ) AS recent
      )`
    )
    .setParameter('limit', HISTORY_LIMIT)
    .execute();
};
