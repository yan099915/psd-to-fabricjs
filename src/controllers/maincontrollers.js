const PSD = require("psd");
const path = require("path");
const fs = require("fs").promises;
const unzipper = require("unzipper");
const application = require("../services/mainservices");
const decompress = require("decompress");

module.exports = {
  maincontroller: async (req, res) => {
    let filename;
    let thumbnail;
    console.log(req.file);

    try {
      const files = await decompress(`${req.file.path}`, req.file.destination);
      for (i = 0; i < files.length; i++) {
        let extractedfiles = files[i].path.split(".");
        if (extractedfiles[extractedfiles.length - 1] === "psd") {
          filename = extractedfiles[extractedfiles.length - 2];
        } else if (
          extractedfiles[extractedfiles.length - 1].toLowerCase() === "jpg"
        ) {
          thumbnail = req.file.destination + files[i].path;
        }
      }
    } catch (err) {
      console.log(err);
    }

    const filepath = req.file.destination + filename + ".psd";
    const psd = PSD.fromFile(filepath);
    psd.parse();
    const tree = psd.tree();
    // console.log(tree);

    const children = tree._children;
    // canvas size
    var data = tree.descendants();
    var w = tree.get("width");
    var h = tree.get("height");
    var sc = 1;
    let keywords = [];
    for (i = 0; i < children.length; i++) {
      // post
      var name = children[i].get("name");
      console.log("toplayer " + name);
      var file = application.define(w * sc, h * sc);
      var grouping = application.group();
      var toplayer = children[i].descendants();
      for (j = 0; j < toplayer.length; j++) {
        if (toplayer[j].isGroup()) {
          var folder = toplayer[j].path();
          const assets = await fs.mkdir(
            "./data/" + filename + "/" + folder,
            { recursive: true },
            function (err) {
              if (err) {
                console.log(err);
              }
            }
          );
        } else {
          var object = toplayer[j].export();
          if (!object.text) {
            var objectName = toplayer[j].get("name");
            var imgLoc =
              "./data/" + filename + "/" + folder + "/" + objectName + ".png";
            const otherObject = await application.format(object, sc, imgLoc);
            if (j == toplayer.length - 1) {
              console.log(toplayer[j].get("name"));
              console.log(imgLoc);
              file.backgroundImage.src = imgLoc;
            } else {
              grouping.objects.push(otherObject);
            }
            const saveImg = await application.savePng(toplayer[j], imgLoc);
          } else {
            var textName = toplayer[j].get("name");
            var textLoc =
              "./data/" + filename + "/" + folder + "/" + textName + ".png";

            //  push text to keywords variable for searching feature
            keywords.push(textName);
            const saveTxt = await application.savePng(toplayer[j], textLoc);
            const textObject = await application.format(object, sc);
            file.objects.push(textObject, sc);
          }
        }
      }
      // grouping
      file.objects.push(grouping, sc);

      //  save data to pouchDB
      const data = [
        {
          filename: filename,
          name: name,
          thumbnail: thumbnail,
          keywords: keywords,
          file: file,
        },
      ];
      const saveJson = await application.getall(data);

      // save data as json file format
      // const json = await application.saveJson(data);
      // fs.writeFile(path.resolve("./output/" + filename + "/" + name + ".json"), JSON.stringify(file));
    }
  },

  search: async (req, res) => {
    const keyword = req.query.keyword;
    const limit = req.query.limit;
    const skip = req.query.skip;

    try {
      const searchdata = await application.search(keyword, limit, skip);

      res.status(201).send(searchdata);
    } catch (err) {
      console.log(err);
    }
  },
};
