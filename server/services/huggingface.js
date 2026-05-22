const axios = require("axios");
const fs = require("fs");

const query = async (imagePath) => {

  try {

    const imageData = fs.readFileSync(imagePath);

    const response = await axios({
      method: "POST",

      url: "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",

      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/octet-stream",
      },

      data: imageData,
    });

    return response.data;

  } catch (error) {

    console.log(error.response?.data || error.message);

    throw error;

  }

};

module.exports = query;