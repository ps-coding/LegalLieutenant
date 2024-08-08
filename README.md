# [Legal Lieutenant](https://legal-lieutenant.vercel.app)

## Hackathon
### This project won 1<sup>st</sup> Place 🥇
We made this project for the [Empower Hacks 2.0](https://empower-hacks-2-0.devpost.com) hackathon. **This was an international competition with 1,900+ participants!** The hacking period was from July 26 at 6:00 PM EDT to August 3 at 2:45 AM EDT. Judging lasted from August 3 at 12:00 PM EDT to August 7 at 2:45 AM EDT (which is why there were no pushed commits during that period, although I did tinker on my local copy to keep the momentum going and pushed afterward). Our team addressed the following prompt:
> Create a software (website, app, etc.) that addresses an issue in first-generation low-income students, such as financial planning, career opportunities, mental health, community building, or an issue found/experienced in your community.

## Project Description
Our website is designed to assist first-generation, low-income students in navigating complex and dense legal documents, such as immigration forms, employment documents, the FAFSA, and various contracts. Legal counsel is often very expensive, so these students are often alone, wandering through the vast complexities of the U.S. legal system without assistance. This can lead to them signing predatory contracts or filling out forms incorrectly, which could jeopardize their future, especially at critical junctures.
In response to these issues, our website simplifies the process of understanding and creating important legal documents by summarizing sections, defining difficult terms, and generating filled documents from scratch based on provided information (such as personal information or an outline).

## Inspiration
The inspiration for this project stemmed from our personal experiences as first-generation students whose parents immigrated from India. We witnessed firsthand the challenges our families faced in understanding and completing complex forms without adequate guidance. Some of them fell into traps, signing documents they did not understand, which led to issues that they are still suffering from to this day. These experiences highlighted the need for a tool that could bridge the gap and provide much-needed support. By creating this website, we aim to empower students like us, ensuring they have the resources and confidence to navigate the legal system.

## What It Does
- **Definitions:** Helps fill out forms or documents like immigration paperwork, contracts, or the FAFSA by defining complex terms in those documents.
- **Document generation:** Creates legal documents from scratch, tailored to the user’s specific needs and provided information.
- **Document summarization:** Provides summaries of intelligently chunked sections of any given document, ensuring users understand the content and requirements.
- **Automatic clarifications:** Highlights potential areas of concern, including loopholes and confusing sections, in section summaries.

## How We Built It
- Overall, our application is run through an express.js server. We use EJS as the view engine so that we can dynamically populate the page using the response from the server before the page reaches the client. This way, the contents of the page are accurate the moment that it arrives (i.e., no client-side JavaScript is required for the initial rendering, unlike in vanilla React or Angular). EJS also allows the use of “partial” templates, which we use for our head, navbar, and footer. We use multiple CSS style sheets and multiple JavaScript files based on what each page needs. Common styles for the navigation bar and footer are in a core CSS file, form styling is in a form CSS file that is imported in all pages that use forms, etc. Client-side JavaScript is used for several features like text replacement on hover and dynamic size adjustments. We also use asynchronous JavaScript to power our “highlight to define” feature by using fetch on a dictionary API.
- We made the summarize feature using OpenAI’s GPT-4o-mini model. The model is fast, cheap, and intelligent enough for our purposes. The user uploads their file to our server – which we handle using the multer package – and then the contents of the file (PDF, DOC, DOCX, etc.) are read using the any-text package. The file is then marked to be asynchronously deleted. We then break up the document into smaller sections based on common legal section dividers (e.g., "part x," "section x," "article x," "preamble," "definitions," etc.) using a complex and thorough regular expression that allows for various formatting differences (e.g., different types of numerals after different identifiers) yet is still accurate. If that division method does not work, we fall back to chunking based on word count, ensuring that sentences are not split. This way, each section of the document gets its own summary and its own description of common pitfalls. By providing smaller sections of the document to the AI model at a time, we are able to produce more accurate and relevant results.
- For the generate feature, we pass the document title and any accompanying user-provided information to the AI model. Because of OpenAI’s safeguards, we engineered the prompt to clarify that this is only a draft and that it will be manually reviewed later; otherwise, the model refused to generate anything. The resulting document is displayed in a results page, where the user can edit the contents of the document if they want to. Afterward, they can click one button to send their newly generated document off to the summarize page to better understand what the AI created piece by piece.

## Challenges We Ran Into
- **Chunking:** We did not want the AI to summarize the entire document; we wanted a section-by-section summary to enable users to get help right where they need it. However, using gpt-4o-mini to divide the document into sections intelligently would have doubled the input tokens and thus doubled our costs. Thus, we devised a mostly reliable method of chunking the document into pieces without AI using regular expressions (as described above).
- **Model safeguards:** OpenAI is rightfully concerned about the use of its models, so it has put safeguards in place. Unfortunately, those safeguards initially blocked the generation of legal documents. Thus, we used prompt engineering to clarify that the document is only a draft, which made the AI willing to create the document.
- **Resizing boxes:** On the document summary page, the section summaries reveal themselves when the corresponding section is hovered over. However, as the summary is always shorter than the actual text, the section box would usually shrink in size, which led to a jitter effect. To combat this, we now calculate the size of the box before the text is swapped for the summary, and we set that to be the fixed minimum height of the section box. After the hover state is removed, we return the box's minimum height to the "auto" setting.

## Accomplishments That We're Proud Of
- **Intuitive site:** The pages are clearly labeled, and the site is easy to navigate through. The UI is simple, and because we utilize core HTML5 elements, our site is mostly accessible by default. We have added robust `<meta>` tags for SEO and accessibility purposes.
- **No cost for the user:** By optimizing the queries that we send to the model, we have reduced the cost of the website so much that we do not foresee needing to charge the user or place advertisements on the website any time soon.
- **Highly accurate chunking:** The chunking mechanism is generally very accurate. Although some horribly formatted documents do result in slightly less sensible or uneven partitions, which is something we plan to optimize in the future, most documents are grouped into very easy-to-read and logical chunks. These chunks enable the user to only view summaries for the parts that they are actually confused about, and the chunking mechanism that we have developed results in more detail (and a higher accuracy) for each section's summary. Most importantly, this chunking is done very fast and is done without AI to reduce our costs and compute time.
- **Flexibility:** We offer the user the option to upload a document of almost any format or to enter the document text on their own. We also offer the ability for the user to provide as much or as little information as they wish when generating a document: if they do not provide certain pieces of information, we have made sure that the AI model marks dependent sections with an underscore instead of hallucinating data. This makes our website relatively accurate, reliable, and versatile.

## What We Learned
- **Importance of data privacy and security:** We ensure that we delete any documents that the user uploads immediately after we analyze the text within them to ensure that the user's sensitive information stays safe. We also keep our secrets in a .env file, which we have made sure to ignore from Git to prevent abuse. Lastly, we have set rate limits for the same reason of preventing the abuse of our OpenAI API key.
- **Prompt engineering:** As mentioned earlier, we had to skillfully manipulate prompts in order to get back a useful response for the document generation feature. This will become an increasingly important skill as AI becomes more and more prominent.
- **Hosting considerations:** We researched various hosting platforms, including Netlify, Fly.io, Render, and Vercel. We looked at their free tier limits, integration abilities, etc. before settling on Vercel. Even once we linked our GitHub repository to Vercel, there were a lot of things that we needed to tweak to get the site to render properly (we had to change the file-upload directory to /tmp and change the paths of various routes to match what Vercel expects). While learning how to evaluate different hosting options, we also learned how to search through technical documentation and extract relevant information.

## What's Next
- [ ] **UI improvements:** Our UI is simple and mobile compatible, but it is still relatively basic. We felt that it was more important to work on our core system design (to establish a stable foundation), file structure (to make contributing easier), back-end code (to get key features working), and integrations (to link up all APIs elegantly) for the purposes of this hackathon, but we have much grander aspirations for the UI going forward. We plan to use Figma to design an updated user interface over the next month or so.
- [ ] **Performance improvements:** Although there are some inherent limitations posed by the use of AI, we still want to optimize the user experience to make the entire process as fast as possible. We may experiment with using different AI models for different tasks to speed up our various features. We will also continue to refine our prompts.
- [ ] **Accounts:** It would be useful to be able to save generated documents to an account and share documents easily between users through the account system. Thus, this is high on our priority list.
- [ ] **Form walkthroughs:** Currently, the generate feature creates a document based on the AI’s knowledge and the information the user provided about themselves and the document’s sections. However, in the future, we plan to add the ability for the website to help the user step by step through common forms like the FAFSA instead of outputting the entire generated form all at once. This will make it easier for the user to understand every part of what they are doing and verify the form piece by piece.
- [ ] **Document chat:** Although our summarization, clarification, and loophole identification system is quite comprehensive (yet still concise), the user might still have more questions. Thus, we would like to add the ability for the user to chat about the document in a side panel within the website itself if they need any additional information.

## File Structure
- `api/` - API folder
  - `index.js` - Express server
  - `views/` - EJS files
    - `pages` - Pages
    - `partials` - Templates (head, navbar, footer)
- `public` - Resources
  - `css` - CSS files
  - `js` - JavaScript files

## Local Setup
- Clone the respository
- Run `npm install`
- Add your own `OPENAI_API_KEY` to a `.env` file
- Run `node .` in the root directory
- Open `localhost:3000` to preview the application

## User Guide
Visit the [public site](https://legal-lieutenant.vercel.app/).
### Explain Page
- Upload a PDF, DOC, DOCX, etc., or enter the document's text
- Press submit
- Once the explain results screen loads, hover over any section to see a section summary and potential concerning areas
- Press the toggle button to switch between the summary and raw-text views
- In the raw-text view, highlight or double-click on a word to see its definition
  - The definition will appear in a pop-up
  - You must have one and only one word selected; otherwise, we will assume that you are just trying to copy a part of the document
### Generate Page
- Provide the document title
  - If you don't know the specific title, provide the document category, such as "immigration papers," and the document will be inferred
- If you have a sample/template/information document to upload:
  - Upload the document
  - Provide additional information about your situation and/or the document
  - Press submit
  - A new screen will be presented with an outline generated based on your uploaded document and a prompt asking for more information
  - Edit the outline and provide more information if needed (if you do not provide certain pieces of information, the corresponding sections will be left blank in the generated document)
  - Press submit
- Otherwise, if you do not have a sample/template/information document to upload:
  - Provide all applicable information about your situation, and include as much information about the document itself as possible
  - Press submit
- Once the generate results screen loads, edit the document as desired
  - Blanks will be present where the AI model did not have enough information to fill something, so make sure to fill in those parts carefully
  - Press submit
- The explain results page screen will then appear with the generated document already populated

## Contribution Guidelines
- Open an issue with the following:
  - Description of the problem or feature request
  - Explanation of who the issue impacts and why it is important
  - Steps to reproduce (if applicable)
- If you are willing to take on the issue, follow the steps [here](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project)
  1. Fork the respository and clone the fork
  1. Create a new feature branch
  1. Make your changes locally
  1. Push your local commits to the fork
  1. Create a pull request
- After the core contributors review your edits, we will leave feedback or accept the request
  - Please do not be offended or concerned if your pull request is not immediately merged, and be willing to engage in kind, open discussion
