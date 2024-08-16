require("dotenv").config();

const process = require("process");
const path = require("path");
const fs = require("fs");

const express = require("express");
const session = require("express-session");
const firebase = require("firebase-admin");
const FirestoreStore = require("firestore-store")(session);

const multer = require("multer");
const reader = require("any-text");
const openai = require("openai");
const bcrypt = require("bcrypt");

const app = express();
const port = process.env["PORT"] || 3000;

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (firebase.apps.length === 0) {
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
  });
}

const db = firebase.firestore();

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    store: new FirestoreStore({ database: db }),
    secret: "legal-lieutenant",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

const storage = multer.diskStorage({
  destination: function (_, _, cb) {
    cb(null, "/tmp");
  },
  filename: function (_, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const client = new openai.OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const groupSections = (documentContent) => {
  let splitSections = documentContent
    .replaceAll(/^((\s*((#+.*)|(\*+.*))(\r?\n)+)+)/gm, "[;break;]$1")
    .replaceAll(
      /^((\s*\**\s*(((Part)|(Article)|(Section)|(Preamble)|(Clauses)|(Definitions)|(Clause)|(Definition))\.?\s*((([0-9]+)|([IVXLCDM]+)|([A-Z]+))\.?)?\s*(((:)|(-)|(–)|(—))+\s*.{0,35})?)\**\s*(\r?\n)+)+)/gim,
      "[;break;]$1",
    )
    .replaceAll("\n", " ")
    .split("[;break;]");

  if (splitSections.length == 1) {
    splitSections = splitSections[0]
      .replaceAll(/([\.\?!])/g, "$1\n")
      .split("\n");

    const result = [splitSections[0]];
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

  const groupedSections = splitSections
    .map((section) => section.trim())
    .filter((section) => section != "")
    .filter((section) => /\d/.test(section) || /[a-zA-Z]/.test(section));

  return groupedSections;
};

const summarize = async (section) => {
  const params = {
    messages: [
      {
        role: "user",
        content: `Summarize the following section from a legal document in one simple and concise sentence. If applicable, add one or two simple sentences about important clarifications for the reader/author. If applicable, also include potential loopholes, pitfalls, or issues relating to this section. Here is the section:\n${section}`,
      },
    ],
    model: "gpt-4o-mini",
  };
  const response = await client.chat.completions.create(params);
  return response.choices[0].message.content;
};

const create = async (formName, information) => {
  const params = {
    messages: [
      {
        role: "user",
        content: `Generate a complete and filled draft for a legal form/document for the ${formName}. Try your best; it is just a rough draft. An expert will review this later. Only output the document, and leave fields that you do not know how to fill blank. Use the following information:\n${information}`,
      },
    ],
    model: "gpt-4o-mini",
  };
  const response = await client.chat.completions.create(params);
  return response.choices[0].message.content;
};

const outline = async (formName, scan) => {
  const params = {
    messages: [
      {
        role: "user",
        content: `Generate a detailed outline for a legal form/document for the ${formName} based on the provided sample, template, or information document. Ensure that all relevant fields, paragraphs, and sections are covered in the order that they should appear in the actual legal document with their options and requirements stated. The outline should be detailed enough to guide the generation of the ${formName} from scratch. Only output the useful parts of the outline. Here is the original document:\n${scan}`,
      },
    ],
    model: "gpt-4o-mini",
  };
  const response = await client.chat.completions.create(params);
  return response.choices[0].message.content;
};

const additionalInformation = async (formName, information, template) => {
  const params = {
    messages: [
      {
        role: "user",
        content: `Generate a few sentences asking the user for the additional information that would be required to fill the ${formName}.\n\n\nThe user has already provided the following information:\n${information}\n\n\nHere is a outline of the entire form/document generated from a sample, template, or information document:\n${template}`,
      },
    ],
    model: "gpt-4o-mini",
  };
  const response = await client.chat.completions.create(params);
  return response.choices[0].message.content;
};

const createWithOutline = async (formName, information, template) => {
  const params = {
    messages: [
      {
        role: "user",
        content: `Generate a complete and filled draft for a legal form/document for the ${formName}. Try your best; it is just a rough draft. An expert will review this later. Only output the document, and leave fields that you do not know how to fill blank.\n\n\nHere is an outline generated from a sample, information document, or template for the ${formName}. Note that you must generate the complete legal form/document with detail (do not just fill in the outline; make sure to add all required components):\n${template}\n\n\nHere is some additional information about the document/form/situation:\n${information}`,
      },
    ],
    model: "gpt-4o-mini",
  };
  const response = await client.chat.completions.create(params);
  return response.choices[0].message.content;
};

function ensureAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
}

function isAlphaNumeric(str) {
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (
      !(code > 47 && code < 58) &&
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)
    ) {
      return false;
    }
  }
  return true;
}

app.get("/", (req, res) => {
  res.render("pages/index", { user: req.session.user });
});

app.get("/login", (req, res) => {
  res.render("pages/registration", {
    error: "",
    signup: false,
  });
});

app.get("/signup", (req, res) => {
  res.render("pages/registration", {
    error: "",
    signup: true,
  });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const userRef = await db.collection("users").doc(username).get();

  if (userRef.exists) {
    const user = userRef.data();

    if (await bcrypt.compare(password, user.password)) {
      req.session.user = user;
      res.redirect("/");
    } else {
      res.render("pages/registration", {
        error: "Incorrect password.",
        signup: false,
      });
    }
  } else {
    res.render("pages/registration", {
      error: `Incorrect username ("${username}" does not exist).`,
      signup: false,
    });
  }
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const userRef = await db.collection("users").doc(username).get();

  if (userRef.exists) {
    res.render("pages/registration", {
      error: `The username "${username}" is already taken.`,
      signup: true,
    });
  } else {
    if (!isAlphaNumeric(username)) {
      res.render("pages/registration", {
        error: "The username must be alphanumeric (only letters and numbers).",
        signup: true,
      });
    } else {
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userJSON = { username, password: hashedPassword };
        await db.collection("users").doc(username).set(userJSON);
        req.session.user = userJSON;
        res.redirect("/");
      } catch (err) {
        res.render("pages/registration", {
          error: "An error occurred. Please try again.",
          signup: true,
        });
      }
    }
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

app.get("/explain", ensureAuthenticated, (_, res) => {
  res.render("pages/explain-upload");
});

app.get("/generate", ensureAuthenticated, (_, res) => {
  res.render("pages/generate-upload");
});

app.post(
  "/explain-file",
  ensureAuthenticated,
  upload.single("file"),
  async (req, res) => {
    if (req.file) {
      try {
        const documentContent = await reader.getText(req.file.path);
        const groupedSections = groupSections(documentContent);
        const sections = await Promise.all(
          groupedSections.map(async (section) => ({
            content: section,
            summary: await summarize(section),
          })),
        );
        fs.unlink(req.file.path, (err) => {
          if (err) console.error(err);
        });
        res.render("pages/explain-results", { sections, documentContent });
      } catch (err) {
        res.redirect("/explain");
      }
    } else {
      res.redirect("/explain");
    }
  },
);

app.post("/explain-text", ensureAuthenticated, async (req, res) => {
  const documentContent = req.body.documentContent;
  const groupedSections = groupSections(documentContent);
  const sections = await Promise.all(
    groupedSections.map(async (section) => ({
      content: section,
      summary: await summarize(section),
    })),
  );
  res
    .status(201)
    .render("pages/explain-results", { sections, documentContent });
});

app.post(
  "/generate-text",
  ensureAuthenticated,
  upload.single("template"),
  async (req, res) => {
    const formName = req.body.formName.trim();
    const information = req.body.information.trim();

    if (req.file) {
      const scan = await reader.getText(req.file.path);
      const template = await outline(formName, scan);
      const additionalQuestions = await additionalInformation(
        formName,
        information,
        template,
      );
      res.render("pages/generate-confirm-information", {
        formName,
        template,
        information,
        additionalQuestions,
      });
    } else {
      const documentContent = await create(formName, information);
      res.render("pages/generate-results", { documentContent });
    }
  },
);

app.post("/generate-with-outline", ensureAuthenticated, async (req, res) => {
  const formName = req.body.formName.trim();
  const information = req.body.information.trim();
  const template = req.body.template.trim();

  const documentContent = await createWithOutline(
    formName,
    information,
    template,
  );
  res.render("pages/generate-results", { documentContent });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});
