const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { URL } = require('url');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set viewport width and height
    await page.setViewport({ width: 1280, height: 720 });

    const website_url = 'https://www.gousto.co.uk/cookbook/recipes/10-min-halloumi-brioche-with-chilli-jam-salad';

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

    // Use regex to extract the descriptor after /recipes/
    const regex = /\/recipes\/([^/]+)/;
    const match = website_url.match(regex);
    const descriptor = match && match[1];

    if (descriptor) {
      // Generate the filename using the extracted descriptor
      const filename = `${descriptor}.jpg`;

      // Capture screenshot with the generated filename
      await page.screenshot({ path: filename, fullPage: true });
    } else {
      console.error('Unable to extract descriptor from the URL.');
    }

    // Close the browser instance
    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }
})();
