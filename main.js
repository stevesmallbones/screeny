const getCoreRecipeIds = require('./utils/fetchRecipeIds');
const getRecipeUrls = require('./utils/fetchRecipeUrls');

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

(async () => {
  try {
    console.log('Getting core recipe IDs...');
    const coreRecipeIds = await getCoreRecipeIds();
    console.log(`Core recipe IDs retrieved: ${coreRecipeIds.length} items`);

    console.log('Getting recipe URLs...');
    const recipeUrls = await getRecipeUrls(coreRecipeIds);
    console.log(`Recipe URLs retrieved: ${Object.keys(recipeUrls).length} items`);

    // Create the output folder
    const currentDate = moment().format('YYYY-MM-DD');
    const outputFolder = path.join(__dirname, 'screenshots', currentDate);

    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder);
    }

    const browser = await puppeteer.launch();

    for (const recipeId in recipeUrls) {
      const website_url = recipeUrls[recipeId];
      const page = await browser.newPage();

      await page.setViewport({ width: 1280, height: 720 });
      await page.goto(website_url, { waitUntil: 'networkidle0' });

      // Selectors to remove
      const selectorsToRemove = [
        ".CookieBanner_wrapper__1PF4k",
        ".CookbookHeader_desktopContainer__32lJL",
        ".SimilarRecipesPanel_similarRecipesPanel__24bGt",
        ".Footer_footerContainer__1s-3l"
      ];

      // Remove elements by selectors
      for (const selector of selectorsToRemove) {
        await page.evaluate((sel) => {
          const elements = document.querySelectorAll(sel);
          for (const element of elements) {
            element.parentNode.removeChild(element);
          }
        }, selector);
      }

      await page.evaluate(() => {
        function remove_style(all) {
          var i = all.length;
          var j, is_hidden;

          // Presentational attributes.
          var attr = [
            'height',
            'style',
            'visibility'
          ];

          var attr_len = attr.length;

          while (i--) {
            is_hidden = (all[i].style.display === 'none');

            j = attr_len;

            while (j--) {
              all[i].removeAttribute(attr[j]);
            }

            // Re-hide display:none elements,
            // so they can be toggled via JS.
            if (is_hidden) {
              all[i].style.display = 'none';
              is_hidden = false;
            }
          }
        }

        // ExpandableSection_contentContainer__qmyRP
        var set = document.querySelectorAll('.ExpandableSection_contentContainer__qmyRP');
        remove_style(set);
      });

      // Use regex to extract the descriptor after /cookbook/
      const regex = /\/cookbook\/([^/]+)/;
      const match = website_url.match(regex);
      const descriptor = match && match[1];

      if (descriptor) {
        // Generate the filename using the extracted descriptor
        const filename = path.join(outputFolder, `${website_url.split('/').pop()}.jpg`);

        // Capture a screenshot with the generated filename
        await page.screenshot({ path: filename, fullPage: true });
      } else {
        console.error('Unable to extract descriptor from the URL:', website_url);
      }

      // Close the page
      await page.close();
    }

    // Close the browser instance
    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }
})();
