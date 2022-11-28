var express = require("express");
const internal = require("stream");
var app = express();
require("dotenv").config();
var client_id = process.env.client_id;
var client_secret = process.env.client_secret;
const connect = require("./schemas");
connect();
const port = 1000;
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const User = require("./schemas/user");
const Word = require("./schemas/word");

app.engine("ejs", require("ejs").__express);
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

io.on("connection", (socket) => {
  // io.emit("tryAgain", { url: "/search/sex?query=산양", startNum: 200 });
  let count = 0;
  app.post("/hello", () => {
    console.log("hello");
  });
  app.post("/search/sex", function (req, res) {
    console.log(req.body.word);
    var api_url =
      "https://openapi.naver.com/v1/search/encyc?query=" +
      encodeURI(req.body.word) +
      `&display=100&start=${req.body.start}`; // JSON 결과
    //   var api_url = 'https://openapi.naver.com/v1/search/blog.xml?query=' + encodeURI(req.query.query); // XML 결과
    var request = require("request");
    var options = {
      url: api_url,
      headers: {
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret,
      },
    };

    //
    count = count + 1;
    request.get(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
        const totalNum = JSON.parse(body).total;
        const info = JSON.parse(body);
        console.log(totalNum);
        if (count === 1) {
          if (totalNum > 100) {
            setTimeout(() => {
              count = 0;
            }, 3000);
            for (let i = 1; i < totalNum / 100; i++) {
              count += 1;
              console.log(count);
              if (count === 11) {
                return res.end(body);
              } else {
                io.emit("tryAgain", {
                  url: `/search/sex`,
                  startNum: `${i}00`,
                  word: req.body.word,
                });
                const result = info.items.reduce((acc, cur) => {
                  Word.create({
                    title: cur.title,
                    description: cur.description,
                  });
                  acc.push({
                    title: cur.title,
                    description: cur.description,
                  });
                  return acc;
                }, []);

                console.log(result);
              }
            }
          } else if (totalNum < 100) {
            const result = info.items.reduce((acc, cur) => {
              Word.create({
                title: cur.title,
                description: cur.description,
              });
              acc.push({
                title: cur.title,
                description: cur.description,
              });
              return acc;
            }, []);
            console.log(result);
          }
        }
        res.end(body);
      } else {
        res.status(response.statusCode).end();
        console.log("error = " + response.statusCode);
      }
    });
  });
});

var elasticsearch = require("elasticsearch");
var client = new elasticsearch.Client({
  host: "http://ws-study.shop:9200/",
  log: "trace",
});

// client.ping(
//   {
//     // ping usually has a 3000ms timeout
//     requestTimeout: 3000,
//   },
//   function (error) {
//     if (error) {
//       console.trace("elasticsearch cluster is down!");
//     } else {
//       console.log("All is well");
//     }
//   }
// );

// 엘라스틱서치에 데이터 넣기
// client.index(
//   {
//     index: "myindex",
//     type: "mytype",
//     id: "1",
//     body: {
//       title: "Test 1",
//       tags: ["y", "z"],
//       published: true,
//       published_at: "2013-01-01",
//       counter: 1,
//     },
//   },
//   function (err, resp, status) {
//     console.log(resp);
//   }
// );

// 엘라스틱서치에서 데이터 가져오기
// client.get(
//   {
//     index: "myindex",
//     type: "mytype",
//     id: "1",
//   },
//   function (error, response) {
//     // ...
//   }
// );
// for (let i = 0; i < 100; i++) {}
// client.indices.delete({ index: "*" }, (err, data) => {
//   if (err) {
//     console.log(err);
//   }
//   console.log(data);
// });

const words = client.search({
  index: "[test].ang",
  body: {
    query: {
      match: { ang: "angang" },
    },
  },
});

// console.log(words.title);

// client.delete({
//   index: "boot-logs",
// });
server.listen(port, () => {
  console.log("listening on:3000");
});
