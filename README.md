# [Legal Lieutenant](https://legal-lieutenant.vercel.app)

## Contributors

- Prasham Shah ([ps-coding](https://github.com/ps-coding)): Team Lead and Chief Coder/Writer
- Samik Shah ([samik-py](https://github.com/samik-py)): Back-End Coder
- Aniketh Chadive ([ani369chad](https://github.com/ani369chad)): Front-End Coder
- Pahul Virk: Writer

## Project Description

Our website is designed to assist first-generation, low-income (FGLI) students, as well as anyone in need of cheap legal assistance, in navigating complex and dense legal documents, such as immigration forms, employment documents, the FAFSA, rental agreements, various contracts, and more. Legal counsel is often very expensive, so FGLI students and low/middle-class individuals are often alone, wandering through the vast complexities of the U.S. legal system without assistance. This can lead to them signing predatory contracts or filling out forms incorrectly, which could jeopardize their future, especially at critical junctures.

In response to these issues, our website simplifies the process of understanding and creating important legal documents by summarizing sections, defining difficult terms, and generating filled documents from scratch based on provided information (such as personal information or an outline). We also allow users to save documents, edit them, collaborate through shared accounts, and chat with them.

## Inspiration

The inspiration for this project stemmed from our personal experiences as first-generation students whose parents immigrated from India. We witnessed firsthand the challenges our families faced in understanding and completing complex forms without adequate guidance. Some of them fell into traps, signing documents they did not understand, which led to issues that they are still suffering from to this day. These experiences highlighted the need for a tool that could bridge the gap and provide much-needed support. By creating this website, we aim to empower students like us and anyone in need of legal help, ensuring they have the resources and confidence to navigate the legal system.

## What It Does

- **Definitions:** Helps fill out forms or documents like immigration paperwork, contracts, or the FAFSA by defining complex terms in those documents.
- **Document generation:** Creates legal documents from scratch, tailored to the user’s specific needs and provided information.
- **Document summarization:** Provides summaries of intelligently chunked sections of any given document, ensuring users understand the content and requirements.
- **Automatic clarifications:** Highlights potential areas of concern, including loopholes and confusing sections, in section summaries.
- **Document chat:** Allows users to ask questions about their saved documents and receive answers in real-time.

## How We Built It

- **Overall,** our application is run through an express.js server. We use EJS as the view engine so that we can dynamically populate the page using the response from the server before the page reaches the client. This way, the contents of the page are accurate the moment that it arrives (i.e., no client-side JavaScript is required for the initial rendering, unlike in vanilla React or Angular). This rendering method significantly enhances our site's performance, as evidenced by our [perfect Lighthouse score](https://pagespeed.web.dev/analysis/https-legal-lieutenant-vercel-app/9bcmh6aaaj?form_factor=desktop). The EJS template engine also allows the use of “partial” templates, which we use for our head, navbar, and footer. We use multiple CSS style sheets and multiple JavaScript files based on what each page needs. Common styles for the navigation bar and footer are in a core CSS file, form styling is in a form CSS file that is imported in all pages that use forms, the accordion CSS and JS files are independently imported only on pages that use our custom accordion, etc. Client-side JavaScript is used for several features like text replacement on hover and dynamic size adjustments. We also use asynchronous JavaScript to power our “highlight to define” feature by using fetch on a dictionary API. We also use JavaScript to initiate our fancy modals, which are powered by SweetAlert2. Overall, we have developed a very performant site by using server-side rendering and by chunking our CSS and JS files based on what different pages need (which also reduces code repetition).
- **For the summarize feature,** we use OpenAI’s GPT-4o-mini model. The model is fast, cheap, and intelligent enough for our purposes. The user uploads their file to our server – which we handle using the multer package – and then the contents of the file (PDF, DOC, DOCX, etc.) are read using the any-text package. The uploaded file is then marked to be asynchronously deleted to save space, but the text is preserved in a variable. We then break up the text of the document into smaller sections based on common legal section dividers (e.g., "part x," "section x," "article x," "preamble," "definitions," etc.) using a complex and thorough regular expression that allows for various formatting differences (e.g., different types of numerals after different identifiers) yet is still accurate. Each chunked section starts with the section identifier from the document (e.g., "Part 3" or Section IV"), which is followed by the content. If two identifiers are used one immediately after another, they are placed at the top of the same section block to keep things neat. If this section-indentifier-based division method does not work for any reason (e.g., poor document formatting), we fall back to chunking based on word count, ensuring that sentences are not split. Overall, our chunking strategies enable each section of the document to get its own summary and its own description of common pitfalls, which is much more useful than a vague overall summary as it can target specific problematic points. By providing smaller sections of the document to the AI model at a time, we are able to produce more accurate and relevant results.
- **For the generate feature,** we pass the document title and any accompanying user-provided information to the AI model. Because of OpenAI’s safeguards, we engineered the prompt to clarify that this is only a draft and that it will be manually reviewed later; otherwise, the model refused to generate anything. The resulting document is displayed in a results page, where the user can edit the contents of the document if they want to. Afterward, they can click one button to send their newly generated document off to the summarize page to better understand what the AI created piece by piece.
  - **In case the user has a template/information file they would like to use as the basis for the generation,** we have added the ability for the user to upload a custom template/sample/information document to provide a specific structure for the generated document. If they upload a file, the steps are slightly different. Because it takes too much time and is often ineffective to both analyze the provided document and generate a new one all in one request, we break it up. First, the template document is processed, and an outline is created using AI (we use any-text to scan the document before passing it off to GPT-4o-mini to create the outline). Then, in another prompt, we feed the AI model the newly created outline and the user's provided information and ask it to output a friendly request asking the user for specific pieces of additional information that would be helpful in generating the document. After this initial processing is done, the user is presented a page that still has the document title and the personal information that they entered. However, the page now also has an outline box that contains the AI-generated outline, which they can edit. The page also includes the AI-generated prompt asking for specific pieces of additional information. The more information the user enters, the more complete the final document will be, but everything is up to the user. Once the user confirms the format of the outline and their information, the document is fully generated on the server, and the user is taken to the generate results page (the same page they would normally go to if they did not upload a template). As generating a document based on a template is a lot more computationally intensive, involves a lot more steps, and takes a bit longer than the standard generate feature, we warn the user that it will take longer and that this feature is often unnecessary. However, uploading a file as a template does provide a much more accurate result, which we also note on the generate page. Overall, we provide flexibility: the user can decide for themselves whether they want to prioritize speed or accuracy.
- **For our custom-built authentication and document-access feature,** we use hashing and salting to make user passwords verifiable yet unrecognizable. If a hacker got their hands on all of our user data, they would still never be able to find out any user's password, and they would thus not be able to access any user's account. We store all user data in a Firebase database. We researched a variety of different options like PostgreSQL, MySQL, and MongoDB. In the end, we decided to use Firebase as it is free to get started with, provides in-depth information for developers, has a great API, and offers state-of-the-art security tools. In Firebase, we blocked all read and write access to all data except through the admin SDK with a special API key, which only our express.js server has. In our Firestore database, we have created three collections: users, sessions, and documents. The users collection stores the username and hashed/salted password of each user. The sessions collection stores session/cookie data so that users do not have to sign in each time they visit our page (we make sure to delete sessions when the user signs out and only create sessions once the user signs in to save space and make things more secure; only the server can edit the actual session data like the authentication status to prevent any malicious attacks). Lastly, the documents collection in our Firestore database stores the saved documents of each user. The only way to access documents is through our API, so we are able to make certain that only users who created a document can access or delete it. By tightly integrating the document-access feature with the rest of our website, we enable the user to quickly access explanations of their documents through the click of a button.
- **For our document chat feature,** we send the contents of the saved document and the user's question to the GPT-4o-mini model through an API request and update the UI with the results. Because we do not re-render the page each time (as most of the HTML just needs to stay the same), the user experience is a lot smoother.

## Challenges We Ran Into

- **Chunking:** We did not want the AI to summarize the entire document; we wanted a section-by-section summary to enable users to get help right where they need it. However, using gpt-4o-mini to divide the document into sections intelligently would have doubled the input tokens and thus doubled our costs. Thus, we devised a mostly reliable method of chunking the document into pieces without AI using regular expressions (as described above).
- **Model safeguards:** OpenAI is rightfully concerned about the use of its models, so it has put safeguards in place. Unfortunately, those safeguards initially blocked the generation of legal documents. Thus, we used prompt engineering to clarify that the document is only a draft, which made the AI willing to create the document.
- **Resizing boxes:** On the document summary page, the section summaries reveal themselves when the corresponding section is hovered over. However, as the summary is always shorter than the actual text, the section box would usually shrink in size, which led to a jitter effect. To combat this, we now calculate the size of the box before the text is swapped for the summary, and we set that to be the fixed minimum height of the section box. After the hover state is removed, we return the box's minimum height to the "auto" setting.
- **Storing data securely:** In the initial development stages, we stored user data like usernames and passwords as plain, unencrypted text in memory. This had several problems. First, the data was insecure. If anyone gained access to the data, they would immediately know the username and password of every user. Second, the data was not persistent. A server restart would wipe all user data. Thus, we refactored our code to use a database to store user data and sessions, and we used bcrypt to hash and salt passwords (described earlier).

## Accomplishments That We're Proud Of

- **Intuitive site:** The pages are clearly labeled, and the site is easy to navigate through. The UI is very stylish, yet because we try to utilize core HTML5 elements and use "aria" and "alt" attributes wherever they are needed, our site is still highly accessible. Moreover, we have added robust <meta> tags for SEO purposes. We have also added an app manifest, favicons, theme colors, etc. to make our website perform optimally in all browsers and integrate well with all operating systems. Our attention to detail is evidenced by our [perfect Lighthouse score](https://pagespeed.web.dev/analysis/https-legal-lieutenant-vercel-app/9bcmh6aaaj?form_factor=desktop).
- **No cost for the user:** By optimizing the queries that we send to the model, we have reduced the cost of the website so much that we do not foresee needing to charge the user or place advertisements on the website any time soon. If we do have to add a pricing plan later on to cover our costs, we are committed to making the price as low as possible.
- **Highly accurate chunking:** The chunking mechanism is generally very accurate. These chunks enable the user to only view summaries for the parts that they are actually confused about, and the chunking mechanism that we have developed results in more detail (and a higher accuracy) for each section's summary. Most importantly, this chunking is done very fast and is done without AI (it instead uses a custom-developed algorithm) to reduce our costs and compute time.
- **Flexibility:** We offer the user the option for the user to upload a document of almost any format or to enter the document text on their own. We also offer the ability for the user to provide as much or as little information as they wish when generating a document: if they do not provide certain pieces of information, we have made sure that the AI model marks dependent sections with an underscore instead of hallucinating data. We allow the user to upload a template document for the generate feature if they want, or to skip that step if they want to get the document more quickly. We allow the user to save each document to the cloud, locally, or nowhere. This makes our website accurate, reliable, and versatile.
- **Account/document system:** We developed a custom secure account system to reduce our dependence on third-party authentication providers (we do not want to force the user to have a Facebook, Google, or even email account to access our features). We do, however, require the user to be logged in to a _Legal Lieutenant account_ in order to access the generate, explain, and document pages. This helps prevent bot spam. Users can make an account or log in through our registration page. We also give the user the option to log out and switch accounts, which allows for someone to have multiple accounts for different purposes. Moreover, by creating an account, users can save any documents that they create or upload to our database for future reference. This system is fully secure, as document access is regulated both on the database server and main server.

## What We Learned

- **Importance of data privacy and security:** We ensure that we delete any documents that the user uploads immediately after we analyze the text within them to ensure that the user's sensitive information stays safe. We use hashing and salting to store passwords securely. We also keep our secrets in a .env file, which we have made sure to ignore from Git to prevent abuse. We have set rate limits to prevent the abuse of our OpenAI API key.
- **Prompt engineering:** As mentioned earlier, we had to skillfully manipulate prompts in order to get back a useful response for the document generation feature. This will become an increasingly important skill as AI becomes more and more prominent.
- **Hosting considerations:** We researched various hosting platforms, including Netlify, Fly.io, Render, and Vercel. We looked at their free tier limits, integration abilities, etc. before settling on Vercel. Even once we linked our GitHub repository to Vercel, there were a lot of things that we needed to tweak to get the site to render properly (we had to change the file-upload directory to /tmp and change the paths of various routes to match what Vercel expects). While learning how to evaluate different hosting options, we also learned how to search through technical documentation and extract relevant information.
- **Routing and safely storing user data:** In order to create a working account system for our app to use, all of the usernames and passwords that people provide to us must be safely
  stored in a database. In order to do this, we hash/salt passwords with bcrypt and store all of our user data in Firebase, which we learned is a very powerful and secure platform when configured correctly. We ensure that the user has been successfully authenticated before rendering any pages; otherwise, we redirect them to the sign-in page. We learned to pass error states across renders so that if a log-in or sign-up attempt fails, the user can understand why. Everything is fully secure, and the database can only be accessed/modified via our server.
- **Sending API requests thoughtfully with and without refreshing the page:** We learned how to send API requests using fetch and how to update the UI with the results without refreshing the page. This is useful for the document chat feature, as it allows the user to ask questions about their document and receive answers without having to navigate away from the page. This is also used for the dictionary definitions feature on the explain page, which runs an API request asynchronously and produces a pop-up when the definitions load. At the same time, when the _whole HTML_ needed to be re-rendered anyway, we thoughtfully preferred to have the server send the full HTML to the browser so that the user does not need to rely on client-side JavaScript features to see their basic results.

## What's Next

- [ ] **Performance improvements:** Although there are some inherent limitations posed by the use of AI, we still want to optimize the user experience to make the entire process as fast as possible. We may experiment with using different AI models for different tasks to speed up our various features. We will also continue to refine our prompts.
- [ ] **Form walkthroughs:** Currently, the generate feature creates a document based on the AI’s knowledge and the information the user provided about themselves and the document’s sections. However, in the future, we plan to add the ability for the website to help the user step by step through common forms like the FAFSA instead of outputting the entire generated form all at once. This will make it easier for the user to understand every part of what they are doing and verify the form piece by piece.
- [ ] **Google account compatability:** Currently, the only way to sign into our website is through a Legal Lieutenant account, which you can create through our registration page. While this reduces our dependence on third-party providers, which is a benefit as some people might not have a Google or Facebook account, it could be helpful to make alternate sign-in options available. In order to make the sign-in process more simple and accessible for people to use, we intend on adding compatability for users to sign-in with a Google account as well.

## File Structure

- `api/` - API folder
  - `index.js` - Express server
  - `views/` - EJS files
    - `pages/` - Pages
    - `partials/` - Templates (head, navbar, footer)
- `public/` - Resources
  - `css/` - CSS files
  - `js/` - JavaScript files
  - `media/` - Images, icons, and manifests

## Local Setup

- Clone the respository
- Run `npm install`
- Set up a `.env` file
  - Add your own `OPENAI_API_KEY` to a `.env` file
  - Add your own `FIREBASE_SERVICE_ACCOUNT_KEY` to the `.env` file
- Run `node .` in the root directory
- Open `localhost:3000` to preview the application

## User Guide

Visit the [public site](https://legal-lieutenant.vercel.app/).

### Explain Page

- Provide a document title
- Upload a PDF, DOC, DOCX, etc., or enter the document's text
- Press submit
- Once the explain results screen loads, hover over any section to see a section summary and potential concerning areas
- Press the toggle button to switch between the summary and raw-text views
- In the raw-text view, highlight or double-click on a word to see its definition
  - The definition will appear in a pop-up
  - You must have one and only one word selected; otherwise, we will assume that you are just trying to copy a part of the document
- Download a document or save it to your account using the buttons at the top of the page

### Generate Page

- Provide the document title
  - If you don't know the specific title, provide the document category, such as "immigration papers," and the document will be inferred
- If you have a sample/template/information document to upload:
  - Upload the document
  - Provide additional information about your situation and/or the document
  - Press submit
  - A new screen will be presented with an outline generated based on your uploaded document and a prompt asking for more information
  - At the bottom of the page, there is an option to download the generated document to your local storage as a .txt file.
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
