require('dotenv').config({ path: './.env' });
const defineModel = require('./src/models/sqlModel');
const PageContent = defineModel('PageContent');

(async () => {
  try {
    const page = await PageContent.findOne({ path: '/publications' });
    console.log('Found page:', page);
    if (page) {
      await PageContent.findByIdAndDelete(page._id);
      console.log('Deleted successfully.');
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
})();
