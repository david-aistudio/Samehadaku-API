import { load } from 'cheerio';
import { fetchHTML, postAjax } from '../utils/scraper';

const BASE_URL = 'https://v1.samehadaku.how';

// Helper function to extract common anime list items
const extractAnimeList = ($: any, selector: string) => {
    const items: any[] = [];
    $(selector).each((i: any, el: any) => {
        // Try multiple selectors for title and link
        let title = $(el).find('.entry-title a').text().trim();
        let link = $(el).find('.entry-title a').attr('href');

        // Fallback: direct anchor in article or other common patterns
        if (!title) title = $(el).find('a').first().attr('title') || $(el).find('.title').text().trim() || '';
        if (!link) link = $(el).find('a').first().attr('href');

        const thumbnail = $(el).find('img').attr('src');
        
        const episode = $(el).find('span[itemprop="name"] i').text().trim() || $(el).find('.dtla span').last().text().trim() || ''; 
        const releasedTime = $(el).find('span[itemprop="datePublished"]').text().trim() || $(el).find('.dtla span').first().text().trim() || '';
        const rating = $(el).find('.rating').text().trim() || '';

        if (title && link) {
            items.push({
                title,
                thumbnail,
                episode,
                released_time: releasedTime,
                rating,
                link_endpoint: link.replace(BASE_URL, ''),
            });
        }
    });
    return items;
};

// Helper untuk extract pagination
const extractPagination = ($: any) => {
    const pagination: any = {};
    const nextLink = $('.pagination .next').attr('href');
    const prevLink = $('.pagination .prev').attr('href');
    
    // Ambil angka page terakhir kalau ada (biasanya di tombol angka terakhir)
    const lastPageText = $('.pagination .page-numbers:not(.next):not(.prev)').last().text().trim();
    
    if (nextLink) pagination.next_page = nextLink.replace(BASE_URL, '');
    if (prevLink) pagination.prev_page = prevLink.replace(BASE_URL, '');
    if (lastPageText) pagination.total_pages = parseInt(lastPageText) || 0;

    return pagination;
};

export const scrapeHome = async () => {
  try {
    const html = await fetchHTML(BASE_URL);
    const $ = load(html);
    
    // 1. Recent Anime (Episodes)
    const recentEpisodes = extractAnimeList($, '.post-show ul li');

    // 2. Recent Released (Sidebar widget)
    const recentReleased: any[] = [];
    $('.widget_senction .widget-title:contains("Anime Terbaru")').parent().find('ul li').each((i, el) => {
        const title = $(el).find('a').text().trim();
        const link = $(el).find('a').attr('href');
        if(title && link) {
             recentReleased.push({
                title,
                link_endpoint: link.replace(BASE_URL, '')
             });
        }
    });

    return {
        recent_episodes: recentEpisodes,
        recent_released: recentReleased
    };
  } catch (error) {
    console.error('Error scraping home:', error);
    return { error: 'Failed to scrape home' };
  }
};

export const scrapeRecentAnime = async (page: number = 1) => {
    try {
        const url = page === 1 
            ? `${BASE_URL}/anime-terbaru/` 
            : `${BASE_URL}/anime-terbaru/page/${page}/`;
        
        console.log(`Scraping Recent Anime: ${url}`);
        const html = await fetchHTML(url);
        const $ = load(html);

        const data = extractAnimeList($, '.post-show ul li');
        const pagination = extractPagination($);

        return { data, pagination };
    } catch (error) {
        console.error('Error scraping recent anime:', error);
        return { error: 'Failed to scrape recent anime' };
    }
};

export const scrapeAnimeList = async (page: number = 1) => {
    try {
        const url = page === 1 
            ? `${BASE_URL}/daftar-anime-2/` 
            : `${BASE_URL}/daftar-anime-2/page/${page}/`;

        console.log(`Scraping Anime List: ${url}`);
        const html = await fetchHTML(url);
        const $ = load(html);

        // Try standard list first
        let data = extractAnimeList($, '.post-show ul li');
        
        // If empty, try 'article' which is common for archive pages
        if (data.length === 0) data = extractAnimeList($, 'article');
        
        // If still empty, try specific class for list mode
        if (data.length === 0) data = extractAnimeList($, '.animepost');

        if (data.length === 0) {
             console.log('Anime List empty. Body classes:', $('body').attr('class'));
        }

        const pagination = extractPagination($);

        return { data, pagination };
    } catch (error) {
        console.error('Error scraping anime list:', error);
        return { error: 'Failed to scrape anime list' };
    }
};

export const scrapeBatchList = async (page: number = 1) => {
    try {
        const url = page === 1 
            ? `${BASE_URL}/daftar-batch/` 
            : `${BASE_URL}/daftar-batch/page/${page}/`;

        console.log(`Scraping Batch List: ${url}`);
        const html = await fetchHTML(url);
        const $ = load(html);

        // Batch list often uses standard post structure or specific batch classes
        let data = extractAnimeList($, '.post-show ul li');
        
        if (data.length === 0) data = extractAnimeList($, 'article');
        
        if (data.length === 0) {
             console.log('Batch List empty. Body classes:', $('body').attr('class'));
        }

        const pagination = extractPagination($);

        return { data, pagination };
    } catch (error) {
        console.error('Error scraping batch list:', error);
        return { error: 'Failed to scrape batch list' };
    }
};

export const scrapeAnimeDetail = async (slug: string) => {
    try {
        const url = `${BASE_URL}/anime/${slug}/`;
        console.log(`Scraping Anime Detail: ${url}`);
        const html = await fetchHTML(url);
        const $ = load(html);

        // 1. Info Utama
        const title = $('h1.entry-title').text().trim();
        const thumbnail = $('.thumb img').attr('src');
        const synopsis = $('.entry-content').text().trim();
        
        // 2. Detail Info (Genre, Studio, dll) - Biasanya di tabel atau list
        const details: any = {};
        $('.infox .spe span').each((i: any, el: any) => {
            const key = $(el).find('b').text().replace(':', '').trim().toLowerCase().replace(/\s/g, '_');
            const value = $(el).text().replace($(el).find('b').text(), '').trim();
            if (key) details[key] = value;
        });
        
        // Ambil genre terpisah biasanya ada class genre-info
        const genres: string[] = [];
        $('.genre-info a').each((i: any, el: any) => {
            genres.push($(el).text().trim());
        });

        // 3. List Episode
        const episodeList: any[] = [];
        $('.lstepsiode ul li').each((i: any, el: any) => {
            const epTitle = $(el).find('.eps a').text().trim();
            const epLink = $(el).find('.eps a').attr('href');
            const epDate = $(el).find('.date').text().trim();
            
            if (epTitle && epLink) {
                episodeList.push({
                    title: epTitle,
                    link_endpoint: epLink.replace(BASE_URL, ''),
                    date: epDate
                });
            }
        });

        // Fallback untuk list episode jika class .lstepsiode tidak ada (misal format lama)
        if (episodeList.length === 0) {
             $('.episodelist ul li').each((i: any, el: any) => {
                const epTitle = $(el).find('a').text().trim();
                const epLink = $(el).find('a').attr('href');
                const epDate = $(el).find('.date').text().trim();
                
                if (epTitle && epLink) {
                    episodeList.push({
                        title: epTitle,
                        link_endpoint: epLink.replace(BASE_URL, ''),
                        date: epDate
                    });
                }
            });
        }

        return {
            title,
            thumbnail,
            synopsis,
            details,
            genres,
            episode_list: episodeList
        };

    } catch (error) {
        console.error('Error scraping anime detail:', error);
        return { error: 'Failed to scrape anime detail' };
    }
};

export const scrapeEpisode = async (slug: string) => {
    try {
        const url = `${BASE_URL}/${slug}/`;
        console.log(`Scraping Episode: ${url}`);
        const html = await fetchHTML(url);
        const $ = load(html);

        const title = $('h1.entry-title').text().trim();
        const releaseTime = $('span.time-post').text().trim();
        
        // 1. Get Server List
        const serverList: any[] = [];
        $('.east_player_option').each((i: any, el: any) => {
            const name = $(el).find('span').text().trim();
            const post = $(el).attr('data-post');
            const nume = $(el).attr('data-nume');
            const type = $(el).attr('data-type');
            
            if (post && nume && type) {
                serverList.push({ name, post, nume, type });
            }
        });

        // 2. Resolve Default Stream (First Server)
        let defaultStreamUrl = '';
        if (serverList.length > 0) {
            const firstServer = serverList[0];
            const ajaxUrl = `${BASE_URL}/wp-admin/admin-ajax.php`;
            const postData = `action=player_ajax&post=${firstServer.post}&nume=${firstServer.nume}&type=${firstServer.type}`;
            
            try {
                const responseHtml = await postAjax(ajaxUrl, postData);
                // Extract src from iframe
                const $iframe = load(responseHtml);
                defaultStreamUrl = $iframe('iframe').attr('src') || '';
            } catch (err) {
                console.error('Failed to resolve default stream:', err);
            }
        }

        // 3. Download Links
        const downloadLinks: any[] = [];
        $('.download-eps ul li').each((i: any, el: any) => {
             const quality = $(el).find('strong').text().trim();
             const links: any[] = [];
             $(el).find('a').each((j: any, linkEl: any) => {
                 links.push({
                     host: $(linkEl).text().trim(),
                     url: $(linkEl).attr('href')
                 });
             });
             if(quality) {
                 downloadLinks.push({ quality, links });
             }
        });

        return {
            title,
            release_time: releaseTime,
            server_list: serverList,
            stream_url: defaultStreamUrl,
            download_links: downloadLinks
        };

    } catch (error) {
        console.error('Error scraping episode:', error);
        return { error: 'Failed to scrape episode' };
    }
};

export const scrapeSearch = async (keyword: string, page: number = 1) => {
    try {
        const url = page === 1 
            ? `${BASE_URL}/?s=${keyword}` 
            : `${BASE_URL}/page/${page}/?s=${keyword}`;

        console.log(`Scraping Search: ${url}`);
        const html = await fetchHTML(url);
        const $ = load(html);

        // Search results usually use standard post structure
        let data = extractAnimeList($, '.post-show ul li');
        
        if (data.length === 0) data = extractAnimeList($, 'article');
        if (data.length === 0) data = extractAnimeList($, '.animepost');
        
        if (data.length === 0) {
             console.log('Search results empty. Body classes:', $('body').attr('class'));
        }

        const pagination = extractPagination($);

        return { data, pagination };
    } catch (error) {
        console.error('Error scraping search:', error);
        return { error: 'Failed to scrape search' };
    }
};