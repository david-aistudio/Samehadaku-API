import { Request, Response } from 'express';
import { 
    scrapeHome, 
    scrapeRecentAnime, 
    scrapeAnimeList, 
    scrapeBatchList,
    scrapeAnimeDetail,
    scrapeEpisode,
    scrapeSearch
} from '../services/AnimeService';

export const getHome = async (req: Request, res: Response) => {
  const data = await scrapeHome();
  res.json(data);
};

export const getRecentAnime = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const data = await scrapeRecentAnime(page);
    res.json(data);
};

export const getAnimeList = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const data = await scrapeAnimeList(page);
    res.json(data);
};

export const getBatchList = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const data = await scrapeBatchList(page);
    res.json(data);
};

export const getAnimeDetail = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const data = await scrapeAnimeDetail(slug);
    res.json(data);
};

export const getEpisode = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const data = await scrapeEpisode(slug);
    res.json(data);
};

export const getSearch = async (req: Request, res: Response) => {
    const keyword = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    
    if (!keyword) {
        return res.status(400).json({ error: 'Query param "q" is required' });
    }

    const data = await scrapeSearch(keyword, page);
    res.json(data);
};