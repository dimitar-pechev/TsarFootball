/* globals module require __dirname process */

const router = require('express').Router(),
    fs = require('fs'),
    path = require('path');

module.exports = (app, data) => {
    fs.readdirSync(__dirname)
        .filter(x => x.includes('-api'))
        .forEach(api => require(path.join(__dirname, api))(app, data));

    router.get('*', (req, res) => {
        let userAgent = req.headers['user-agent'];

        if (/^(facebookexternalhit)/gi.test(userAgent)) {
            if (req.url.indexOf('news') > - 1) {
                let id = req.url.split('/').map(x => x.trim()).filter(x => x != '')[1];
                data.getNewsEntryById(id)
                    .then(article => {
                        article.type = 'article';
                        article.url = `http://tsar-football.herokuapp.com/news/${article._id}/#!/news/details/${article._id}`;
                        res.render('bots', article);
                    });
            } else if (req.url.indexOf('article') > - 1) {
                let id = req.url.split('/').map(x => x.trim()).filter(x => x != '')[1];
                data.getArticleById(id)
                    .then(article => {
                        article.type = 'article';
                        article.url = `http://tsar-football.herokuapp.com/article/${article._id}/#!/articles/details/${article._id}`;
                        res.render('bots', article);
                    });
            } else {
                let siteInfo = {
                    type: 'website',
                    url: 'http://tsar-football.herokuapp.com',
                    imageUrl: 'http://tsar-football.herokuapp.com/public/assets/logo-page.png',
                    description: 'News, analyses, predictions for the English Premier League games and more. Get the latest info about your favourite team and share your opinion about our favourite sport with other supporters.',
                    title: 'TsarFootball'
                };

                res.render('bots', siteInfo);
            }
        } else {
            if (process.env.NODE_ENV) {
                res.status(200).sendFile(path.join(__dirname + '/../../build/index.html'));
            } else {
                res.status(200).sendFile(path.join(__dirname + '/../../client/index.html'));
            }
        }
    });

    app.use(router);
};