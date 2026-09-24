import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { BrowsingHistory } from '../entities/BrowsingHistory';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const HISTORY_LIMIT = 50;

export const getBrowsingHistory = async (req: AuthenticatedRequest, res: Response) => {
  const historyRepository = AppDataSource.getRepository(BrowsingHistory);
  const histories = await historyRepository.find({
    where: { userId: req.userId },
    relations: ['book', 'book.seller'],
    order: { viewedAt: 'DESC' },
    take: HISTORY_LIMIT,
    select: {
      id: true,
      bookId: true,
      viewedAt: true,
      book: {
        id: true,
        title: true,
        author: true,
        price: true,
        originalPrice: true,
        images: true,
        condition: true,
        category: true,
        status: true,
        seller: {
          id: true,
          name: true,
          department: true,
        },
      },
    },
  });

  res.json(histories);
};

export const removeBrowsingHistory = async (req: AuthenticatedRequest, res: Response) => {
  const { bookId } = req.params;

  const historyRepository = AppDataSource.getRepository(BrowsingHistory);
  await historyRepository.delete({ userId: req.userId, bookId });

  res.json({ message: '已移除' });
};

export const clearBrowsingHistory = async (req: AuthenticatedRequest, res: Response) => {
  const historyRepository = AppDataSource.getRepository(BrowsingHistory);
  await historyRepository.delete({ userId: req.userId });

  res.json({ message: '已清空' });
};
