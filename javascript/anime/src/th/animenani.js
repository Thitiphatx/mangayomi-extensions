const mangayomiSources = [{
    "name": "Animenani",
    "lang": "th",
    "baseUrl": "https://animenani.net",
    "apiUrl": "",
    "iconUrl": "https://i.pinimg.com/736x/c4/72/fa/c472fa8bb84f1598a90d63ba669c3e9e.jpg",
    "typeSource": "single",
    "isManga": false,
    "isNsfw": false,
    "version": "0.0.1",
    "apiUrl": "",
    "dateFormat": "",
    "dateFormatLocale": "",
    "pkgName": ""
}];

class DefaultExtension extends MProvider {
    async getItems(page) {
        const res = await new Client().get(this.source.baseUrl);
        const doc = new Document(res.body);
        const items = [];
        const elements = doc.select("#main > div.row.ez-row.ez-bt5.hentry > article");
        for (const element of elements) {
            const title = element.selectFirst("div.movie-box1 > h3 > div.anime-title").text;
            const cover = element.selectFirst('div.movie-box1 > div.img > a > img').attr('src');
            const url = element.selectFirst('div.movie-box1 > div.img > a').attr('href');
            const id = url?.split('/')[3]
            items.push({
                name: title,
                imageUrl: cover,
                link: id + "$" + cover
            })
        }
        return {
            list: items,
            hasNextPage: true
        }
    }
    async getPopular(page) {
        return await this.getItems(page);
    }
    async getLatestUpdates(page) {
        return await this.getItems(page);
    }
    async search(query, page, filters) {
        const res = await new Client().get(this.source.baseUrl + "/page/" + page + "/?s=" + query);
        const doc = new Document(res.body);
        const items = [];
        const elements = doc.select("#main > div.row.ez-row.ez-bt5 > article > div.movie-box1");
        for (const element of elements) {
            const title = element.selectFirst("h3 > div.anime-title").text;
            const cover = element.selectFirst('div.img > a > img').attr('src');
            const url = element.selectFirst('div.img > a').attr('href');
            const id = url?.split('/')[3]
            items.push({
                name: title,
                imageUrl: cover,
                link: id + "$" + cover
            })
        }
        return {
            list: items,
            hasNextPage: true
        }
    }
    async getDetail(url) {
        const id = url.split("$")[0];
        const cover = url.split("$")[1];

        const res = await new Client().get(this.source.baseUrl + "/" + id);
        const doc = new Document(res.body);
        const title = doc.selectFirst("div.anime-flexright > h1").text;
        const desc = doc.selectFirst('article > div.anime > div.container > div:nth-child(4) > blockquote > p:nth-child(1)').text.trim();
        const adddate = doc.selectFirst('article > div.anime > div.container > div:nth-child(2) > div > span:nth-child(13)').text.split(", ")[1];
        const tags = doc.select('div.anime-flex > div.anime-flexright > div.ezmeza:nth-child(3) > span.ez-e-t-second > a').map(e => e.text.split(" ")[0]);
        const eps_ = doc.select('div.all-episode-link > div.collapse.show > div.episode-item');
        const eps = [];
        for (const ep of eps_) {
            const name = ep.selectFirst("a > div.epsiode-title > p > span.ep-name-02").text.trim();
            const url = ep.selectFirst('a').attr("href").split("/")[4];
            eps.push({
                name: name,
                url: url
            })
        }
        eps.reverse();
        return {
            name: title,
            imageUrl: cover,
            genre: tags,
            description: desc,
            episodes: eps,
            link: url
        };
    }
    // For anime episode video list
    async getVideoList(url) {
        const res = await new Client().get(this.source.baseUrl + "/watch/" + url);
        const doc = new Document(res.body);
        const embedAddress = doc.selectFirst('#mpPlayer > div.mpIframe').text.match(/src="([^"]*)"/)[1];

        const res2 = await new Client().get(embedAddress);
        const source = res2.body.match(/hls = '(https:\/\/[^']+)';/)?.[1];

        const res3 = await new Client().get(source);
        const doc3 = new Document(res3.body);
        const playlist = doc3.selectFirst("body").text;
        const pattern = /#EXT-X-STREAM-INF:BANDWIDTH=\d+,\s*RESOLUTION=(\d+x\d+)\s*\n(https:\/\/[^\n]+)/g;

        const matches = [...playlist.matchAll(pattern)];
        const resolutions = matches.map(match => match[1].split("x")[1] + "p");
        const urls = matches.map(match => match[2]);
        const quality = [];
        for (let i = 0; i < resolutions.length; i++) {
            quality.push({
                url: urls[i],
                originalUrl: urls[i],
                quality: resolutions[i],
            })
        }
        quality.reverse();
        return quality
    }
    // For manga chapter pages
    async getPageList() {
        throw new Error("getPageList not implemented");
    }
    getFilterList() {
        throw new Error("getFilterList not implemented");
    }
    getSourcePreferences() {
        throw new Error("getSourcePreferences not implemented");
    }
}
