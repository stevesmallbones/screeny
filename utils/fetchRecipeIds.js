const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Read the configuration from config.json
const configPath = path.join(__dirname, '..', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

async function getCoreRecipeIds() {
  const DATE = config.date;
  const apiUrl = 'https://production-api.gousto.co.uk/menu/v2/menus?date=' + DATE;

  try {
    const response = await axios.get(apiUrl);
    const responseData = response.data;

    if (responseData.data && Array.isArray(responseData.data)) {
      const coreRecipeIds = responseData.data
        .map((item) => item.relationships.recipes.data.map((recipe) => recipe.meta.core_recipe_id))
        .flat();
      return coreRecipeIds;
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    throw error;
  }
}

module.exports = getCoreRecipeIds;