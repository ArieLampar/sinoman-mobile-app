// Read from app.json but expose projectId at root level for EAS
const appJson = require('./app.json');

module.exports = {
  ...appJson.expo,
  // Move projectId to root level for EAS CLI
  projectId: appJson.expo.extra.eas.projectId,
};
