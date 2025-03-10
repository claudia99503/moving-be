import { serviceRegion } from '@prisma/client';
import { serviceType } from '@prisma/client';
import * as moverService from '../services/moverService';
import { Request, Response, NextFunction } from 'express';

const getMoverListController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = (req as any).user as { id: number };
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize as string, 10)
      : 10;
    const keyword = req.query.keyword as string | undefined;
    const sortBy =
      (req.query.sortBy as
        | 'reviewCount'
        | 'averageScore'
        | 'career'
        | 'confirmationCount'
        | undefined) || 'reviewCount';
    const sortOrder =
      (req.query.sortOrder as 'asc' | 'desc' | undefined) || 'desc';
    const selectedServiceType = req.query.selectedServiceType as
      | serviceType
      | undefined;
    const selectedServiceRegion = req.query.selectedServiceRegion as
      | serviceRegion
      | undefined;

    const movers = await moverService.getMoverList({
      id,
      page,
      pageSize,
      keyword,
      sortBy,
      sortOrder,
      selectedServiceType,
      selectedServiceRegion,
    });
    res.status(200).json(movers);
  } catch (err) {
    next(err);
  }
};

const getMoverDetailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = (req as any).user as { id: number };
    const moverId = parseInt(req.params.moverId, 10);
    const mover = await moverService.getMoverDetail(id, moverId);
    res.status(200).json(mover);
  } catch (err) {
    next(err);
  }
};

const getMoverController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      !req.user ||
      typeof req.user === 'string' ||
      typeof req.user.id !== 'number'
    ) {
      throw new Error('권한이 없습니다');
    }

    const { id } = (req as any).user as { id: number };
    const mover = await moverService.getMover(id);
    res.status(200).json(mover);
  } catch (err) {
    next(err);
  }
};

const patchMoverProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      !req.user ||
      typeof req.user === 'string' ||
      typeof req.user.id !== 'number'
    ) {
      throw new Error('권한이 없습니다');
    }
    const { id } = (req as any).user as { id: number };
    const { career } = req.body;
    const careerNumber = parseInt(career);
    const profileImage = req.file ? (req.file as any).location : undefined;

    const updateData = {
      ...req.body,
      profileImage: profileImage,
      career: careerNumber,
    };
    const data = await moverService.patchMoverProfile(id, updateData);
    if (data?.type === 'nickname') {
      res.status(400).json(data);
      return;
    }
    res.status(200).json({ message: '수정 완료' });
  } catch (err) {
    next(err);
  }
};

const patchMoverInfoController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      !req.user ||
      typeof req.user === 'string' ||
      typeof req.user.id !== 'number'
    ) {
      throw new Error('권한이 없습니다');
    }
    const { id } = (req as any).user as { id: number };
    const data = await moverService.patchMoverInfo(id, req.body);
    res.status(data.status).json(data);
  } catch (err) {
    next(err);
  }
};

export {
  patchMoverProfileController,
  getMoverController,
  getMoverDetailController,
  getMoverListController,
  patchMoverInfoController,
};
