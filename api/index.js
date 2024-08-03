require("dotenv").config();

const process = require("process");
const path = require("path");
const fs = require("fs")
const express = require("express");
const multer = require("multer");
const reader = require("any-text");
const openai = require("openai");

const app = express();
const port = process.env["PORT"] || 3000;

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: true }))
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const storage = multer.diskStorage({
  destination: function (_, _, cb) {
    cb(null, "/tmp");
  },
  filename: function (_, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const client = new openai.OpenAI({
  apiKey: process.env['OPENAI_API_KEY']
});

const groupSections = (documentContent) => {
  let splitSections = documentContent.replaceAll(/^((#+.*)|(\*+.*))\r?\n/gm, "[;break;]").replaceAll(/^\s*\**\s*((Part)|(Article)|(Section)|(Preamble)|(Definitions)|(Clauses))\.?\s*((([0-9]+)|([IVXLCDM]+)|([A-Z]+))\.?)?\s*.{0,35}\**\s*\r?\n/gmi, "[;break;]").replaceAll("\n", " ").split("[;break;]");

  if (splitSections.length == 1) {
    splitSections = splitSections[0].replaceAll(/([\.\?!])/g, "$1\n").split("\n");

    let result = [splitSections[0]];
    for (let i = 1; i < splitSections.length; i++) {
      const last = result[result.length - 1];
      if (last.length < 800) {
        result[result.length - 1] = last + splitSections[i];
      } else {
        result.push(splitSections[i]);
      }
    }

    splitSections = result;
  }

  const groupedSections = splitSections.map((section) => section.trim()).filter((section) => section != "").filter((section) => /\d/.test(section) || /[a-zA-Z]/.test(section));

  return groupedSections;
}


const groupGeneratedSections = (documentContent) => {
  let splitSections = documentContent.replaceAll(/^((#+.*)|(\*+.*))\r?\n/gm, "[;break;]").replaceAll(/\s*\**\s*((Part)|(Article)|(Section)|(Preamble)|(Definitions)|(Clauses))\.?\s*((([0-9]+)|([IVXLCDM]+)|([A-Z]+))\.?)?\s*.{0,35}\**\s*\r?\n/gi, "[;break;]").split("[;break;]");

  if (splitSections.length == 1) {
    splitSections = splitSections[0].split("\n\n");
  }

  if (splitSections.length == 1) {
    splitSections = splitSections[0].split("\n");
  }

  if (splitSections.length == 1) {
    splitSections = splitSections[0].replaceAll(/([\.\?!])/g, "$1\n").split("\n");

    let result = [splitSections[0]];
    for (let i = 1; i < splitSections.length; i++) {
      const last = result[result.length - 1];
      if (last.length < 800) {
        result[result.length - 1] = last + splitSections[i];
      } else {
        result.push(splitSections[i]);
      }
    }

    splitSections = result;
  }

  const groupedSections = splitSections.map((section) => section.trim()).filter((section) => section != "")

  return groupedSections;
}

const summarize = async (section) => {
  const params = {
    messages: [{ role: 'user', content: `Summarize the following section from a legal document in one simple and concise sentence. If and only if it is applicable, add one or two simple sentences about important clarifications for the reader/author. If applicable, also include potential loopholes, pitfalls, or issues relating to this section. Here is the section:\n${section}` }],
    model: 'gpt-4o-mini',
  };
  const response = await client.chat.completions.create(params);
  return response.choices[0].message.content;
}

const create = async (formName, information) => {
  const params = {
    messages: [{ role: 'user', content: `Generate a complete and filled draft for a legal form/document for the ${formName}. Try your best; it is just a rough draft. An expert will review this later. Only output the document, and leave fields that you do not know how to fill blank. Use the following information:\n${information}` }],
    model: 'gpt-4o-mini',
  };
  const response = await client.chat.completions.create(params);
  return response.choices[0].message.content;
}

app.get("/", (_, res) => {
  res.render("pages/index");
});

app.get("/explain", (_, res) => {
  res.render("pages/explain-upload");
});

app.get("/generate", (_, res) => {
  res.render("pages/generate-upload");
});

app.post("/explain-file", upload.single("file"), async (req, res) => {
  if (req.file) {
    const documentContent = await reader.getText(req.file.path);
    const groupedSections = groupSections(documentContent);
    const sections = await Promise.all(groupedSections.map(async (section) => ({ content: section, summary: await summarize(section) })));
    fs.unlink(req.file.path, (err) => {
      if (err) console.error(err)
    })
    res.render("pages/explain-results", { sections, documentContent });
  } else {
    res.redirect("/explain");
  }
});

app.post("/explain-text", async (req, res) => {
  const documentContent = req.body.documentContent;
  const groupedSections = groupSections(documentContent);
  const sections = await Promise.all(groupedSections.map(async (section) => ({ content: section, summary: await summarize(section) })));
  res.status(201).render("pages/explain-results", { sections, documentContent });
});

app.post("/generate-text", async (req, res) => {
  const formName = req.body.formName.trim();
  const information = req.body.information.trim();
  const documentContent = await create(formName, information)
  res.render("pages/generate-results", { documentContent })
})

app.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});

