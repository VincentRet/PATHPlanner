const functions = require('firebase-functions');
const axios = require('axios');
const cors = require('cors')({ origin: true });  // Allows all origins, or you can specify the origin

exports.getPathData = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { data } = await axios.get('https://panynj.gov/bin/portauthority/ridepath.json');
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching PATH data:', error);
      res.status(500).json({ error: 'Error fetching data' });
    }
  });
});




