import { Router } from 'express';
import { 
    getHome, 
    getRecentAnime, 
    getAnimeList, 
    getBatchList,
    getAnimeDetail,
    getEpisode,
    getSearch
} from '../controllers/AnimeController';

const router = Router();

router.get('/home', getHome);
router.get('/anime/recent', getRecentAnime);
router.get('/anime/list', getAnimeList);
router.get('/batch', getBatchList);
router.get('/anime/:slug', getAnimeDetail);
router.get('/episode/:slug', getEpisode);
router.get('/search', getSearch);

export default router;