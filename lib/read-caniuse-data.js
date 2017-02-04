export default {

  /**
  * Read caniuse-data.jso file and return an object
  */
  readJsonFile() {
    const fs = require('fs');
    const jsonObject = JSON.parse(fs.readFileSync('../caniuse-data.json', 'utf8'));
    return jsonObject;
  },

  /**
  * get support information from an json object
  * Input: jsonObject: a json object
  * Output: supportJson: a json object
  */
  getSupportInfo(jsonObject) {
    const supportJson = jsonObject['data'];
    return supportJson;
  },

  /**
  * get all attributes name from a json object
  * Input: supportJson: a json object
  * Output: attributes: an array of strings
  */
  getAttributeName(supportJson) {
    let attributesName = [];
    Object.keys(supportJson).forEach((keys) => {
      attributesName.push(keys);
    });
    return attributesName;
  },

  /**
  * get support information of an input attribute
  * Input: attribute: String
  * Output: supportObject: Object
  */
  getSupport(attribute, supportJson) {
    let supportObject = {};
    try {
      const stats = supportJson[attribute]['stats'];
      Object.keys(stats).forEach((explorer) => {
        Object.keys(stats[explorer]).forEach((version) => {
          if (Object.keys(supportObject).includes(stats[explorer][version]) === false) {
            supportObject[stats[explorer][version]] = version;
          }
        });
      });
    } catch (e) {
      console.log(`${e} does not exist`);
      supportObject = { notexist: 'notexist' };
    }
    return supportObject;
  }

};
