const mangayomiSources = [{
    "name": "Animehit",
    "lang": "th",
    "baseUrl": "https://anime-hit.com",
    "apiUrl": "",
    "iconUrl": "https://i.imgur.com/H1jmEzW.png",
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
    async getItems(page, query) {
        let res;
        if (query != "") {
            res = await new Client().get(`${this.source.baseUrl}page/${page}/?s=${query}`);
        } else {
            res = await new Client().get(`${this.source.baseUrl}page/${page}`);
        }
        const doc = new Document(res.body);
        const items = [];
        const elements = doc.select("#main > div.row.ez-row.ez-bt5 > article > div.indy-post-thumb");
        for (const element of elements) {
            if (element.selectFirst("div.categories-elm").text.includes("จีน")) continue;
            const title = element.selectFirst("header > a > h2").text.trim();
            const cover = element.selectFirst('div.child-indy-post-thumb > div > div > a > img').attr('data-src');
            const url = element.selectFirst('header > a').attr('href').replace(`${this.source.baseUrl}/`, "");
            items.push({
                name: title,
                imageUrl: encodeURI(cover),
                link: url + "$" + cover
            })
        }
        return {
            list: items,
            hasNextPage: items.length < 20
        }
    }
    async getPopular(page) {
        return await this.getItems(page, "");
    }
    async getLatestUpdates(page) {
        return await this.getItems(page, "");
    }
    async search(query, page, filters) {
        return await this.getItems(page, query);
    }
    async getDetail(url) {
        const id = url.split("$")[0];
        const cover = url.split("$")[1];

        const res = await new Client().get(id);
        const doc = new Document(res.body);
        const main = doc.selectFirst("#main > div.ez-row-post.text-dark > div > div > div > div");

        const title = main.selectFirst("div.card.header-episode > h2").text.trim();
        const desc = main.selectFirst('div.col-lg-8.px-0 > div.ez-entry-content').text.trim();

        const eps_ = main.select('#MVP > li.mvp > a');
        const eps = [];
        for (const ep of eps_) {
            const name = ep.attr("title").trim();
            const url = ep.attr("href");
            eps.push({
                name: name,
                url: url
            })
        }
        eps.reverse();
        return {
            name: title,
            imageUrl: cover,
            genre: [],
            description: desc,
            episodes: eps,
            link: url
        };
    }
    // For anime episode video list
    async getVideoList(url) {
        const res = await new Client().get(url);
        const doc = new Document(res.body);
        const source = doc.selectFirst("#mpPlayer > div.mpIframe > iframe").attr("data-src").split("/")[4];
        const stream = `https://hls.animeindy.com:8443/vid/${source}/video.mp4/playlist.m3u8`
        
        const res2 = await new Client().get(stream);
        const doc2 = new Document(res2.body);
        console.log(doc2)

        
        return [
            {
                url: stream,
                originalUrl: stream,
                quality: "Original",
            }
        ]
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
