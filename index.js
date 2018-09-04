var rp = require('request-promise');
var cheerio = require('cheerio');
var express = require('express');
var pretty = require('express-prettify');
var app = express();
app.use(pretty({
  query: 'tag'
}));
module.exports = app;

app.get('/', function(req, res) {
  if (req.query.tag) {
    var options = {
      uri: `http://www.htmldog.com/references/html/tags/` + req.query.tag,
      transform: function(body) {
        return cheerio.load(body);
      }
    };
    rp(options).then(($) => {
      // scrape attributes
      var attributes = [];
      $('tr').each(function(index) {
        if ($(this).children("td").eq(0).text().indexOf("Global attributes") > -1 || !$(this).children("td").eq(0).text()) {
          return;
        } else {
          attributes.push($(this).children("td").eq(0).text().trim());
        }
      });

      // return json
      res.json({
        "tagName": req.query.tag,
        "tagDescription": $("p").eq(1).text(),
        "tagAttributes": attributes.join(", ")
      });

      res.end();
    }).catch((err) => {
      res.write('404');
      res.end();
    });
  } else {
    res.write(`
    <html>
      <head>
        <title>TagScrape</title>

        <style>
        body {
          margin: 40px;
          text-align: center;
        }
        </style>
      </head>
      <body>
        <h1>TagScrape</h1>
        <p>To gain information about a specific HTML tag, input a tag name into the GET parameter <code>tag</code>.<br><br><code>http://james-still.com:3000/?tag=meta</code></p>
      </body>
    </html>
    `);
    res.end();
  }
});


app.listen(3000);
