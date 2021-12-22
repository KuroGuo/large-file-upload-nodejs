import formidable from "formidable";
import { rename } from "fs";
import { join } from "path";
import express from "express";
import { selectDbUploadedFiles, insertDbFileInfo } from "./lib/dbService.js";
import { logWrite } from "./lib/logService.js";
import { fileUpload } from "./lib/s3FileUploaderService.js";
await import("dotenv-flow/config.js");

const app = express();

app.use(express.static("browser"));


app.get("/files", (req, res) => {
  selectDbUploadedFiles()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      console.log(err);
      res.send("hata");
    });
});

app.post("/upload", (req, res, next) => {
  const form = formidable({
    multiples: true,
    uploadDir: 'F:\\games\\PS2',
    maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
  });

  form.parse(req, async (err, fields, files) => {
    if (err) next(err);
    else {
      res.json({ fields, files });
      fileUpload(files["my-file"].path, files["my-file"].name);
      console.log('filepath', files["my-file"].path)
      rename(
        files["my-file"].path,
        join('F:\\games\\PS2\\', files["my-file"].name),
        renameErr => {
          if (renameErr) console.error(renameErr)
        }
      );
    }
  });
});


app.listen(8080, () => {
  logWrite(`Server running at http://localhost:${8080}`)
})
