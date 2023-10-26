// fetchRecipeUrl.js
const axios = require('axios');

async function getRecipeUrls(recipeIds) {
  const baseApiUrl = 'https://production-api.gousto.co.uk/cmsreadbroker/v1/recipe-by-id/';

  const recipeUrls = {};

  for (const id of recipeIds) {
    const apiUrl = `${baseApiUrl}${id}`;
    try {
      const response = await axios.get(apiUrl);
      const responseData = response.data;

      if (responseData.data && responseData.data.entry) {
        const entry = responseData.data.entry;
        const recipeUrl = `https://www.gousto.co.uk/cookbook${entry.categories[0].url}${entry.url}`;
        recipeUrls[id] = recipeUrl;
      }
    } catch (error) {
      console.error(`Error fetching recipe with ID ${id}:`, error.message);
    }
  }

  return recipeUrls;
}

module.exports = getRecipeUrls;