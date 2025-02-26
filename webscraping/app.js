import puppeteer from "puppeteer";
import fs from "fs";
import getbrandkoname from "./brandName.js";

const scrapdata = async () => {
  const url_web = "https://www.daraz.com.np/catalog/?page=32&q=mobile";

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });
  const page = await browser.newPage();

  let allProductDetails = [];

  await page.goto(url_web, {
    waitUntil: "networkidle2",
  });

  await page.waitForSelector(".Bm3ON", { timeout: 6000 });

  let divs = await page.$$(".Bm3ON");
  let length = divs.length;

  let specsvalue = {};
  let ramandstoragevalue = {};
  let pricevalue = {};
  let brandname = {};

  for (let i = 0; i < length; i++) {
    try {
      console.log("doing for ", i);

      await divs[i].click();
      await new Promise((resolve) => setTimeout(resolve, 5000));

      await page.waitForSelector(".notranslate", { timeout: 10000 });

      const title = await page.evaluate(() => {
        const titleElement = document.querySelector(
          ".pdp-mod-product-badge-title"
        );
        return titleElement ? titleElement.innerText.trim() : "No Brand";
      });

      brandname = getbrandkoname(title);

      console.log("Current selector for title:", brandname);

      const price = await page.evaluate(() => {
        const priceamount = document.querySelector(".notranslate");
        return priceamount ? priceamount.innerText : "No Price";
      });

      const ramandstorage = await page.evaluate(() => {
        const divs = document.querySelectorAll(".pdp-mod-product-info-section");

        let ram = null;
        let storage = null;

        divs.forEach((div) => {
          const textvalue = div.innerText || "";

          if (textvalue.includes("RAM Memory")) {
            const ramText = textvalue.split("RAM Memory")[1]?.trim();
            if (ramText) {
              const ramMatch = ramText.match(/\d+GB/);
              ram = ramMatch ? ramMatch[0] : ramText;
            }
          }

          if (textvalue.includes("Storage Capacity")) {
            const storageText = textvalue.split("Storage Capacity")[1]?.trim();
            if (storageText) {
              const storageMatch = storageText.match(/\d+\s*(GB|TB)/i);
              storage = storageMatch ? storageMatch[0] : storageText;
            }
          }
        });

        return { ram, storage };
      });

      if (!ramandstorage.ram || !ramandstorage.storage) {
        console.log("Skipping product due to missing RAM or Storage");

        await page.goto(url, {
          waitUntil: "networkidle2",
        });

        await new Promise((resolve) => setTimeout(resolve, 3000));

        divs = await page.$$(".Bm3ON");

        continue;
      }

      await new Promise((resolve) => setTimeout(resolve, 10000));

      const scrollthewindowdown = await page.evaluate(() => {
        window.scrollTo(0, 700);
      });
      await new Promise((resolve) => setTimeout(resolve, 5000));

      //   await page.waitForSelector(".pdp-mod-specification");

      console.log("in second page for product mod");

      const specskovalue = await page.evaluate(() => {
        let extractedvalue = {};
        const viewmorebtn = document.querySelector(".pdp-view-more-btn");

        if (viewmorebtn) {
          viewmorebtn.click();
        }

        const specdiv = document.querySelectorAll(
          ".specification-keys .key-li"
        );

        const requiredSpecs = [
          "Battery Capacity",
          "Ram",
          "Storage",
          "Model Year",
          "Camera Front (Megapixels)",
          "Number Of Cameras",
          "Camera Back (Megapixels)",
          "Screen Size (inches)",
        ];

        specdiv.forEach((item) => {
          const keyElement = item.querySelector(".key-title");
          const valueElement = item.querySelector(".key-value");

          if (keyElement && valueElement) {
            const key = keyElement.textContent.trim();
            const value = valueElement.textContent.trim();

            if (requiredSpecs.includes(key)) {
              extractedvalue[key] = value;
            }
          }
        });
        return extractedvalue;
      });

      specsvalue = specskovalue;
      ramandstoragevalue = ramandstorage;
      pricevalue = price;
    } catch (error) {
      console.log("error entcountered and that is ", error.message);
      continue;
    }

    const productdetails = {
      brandname,
      ...specsvalue,
      ram: ramandstoragevalue.ram,
      storage: ramandstoragevalue.storage,
      pricevalue,
    };
    console.log("iteration is ", i);
    console.log("product details are ", productdetails);

    await page.goBack({ waitUntil: "networkidle2" });
    await new Promise((resolve) => setTimeout(resolve, 3000));

    allProductDetails.push(productdetails);

    divs = await page.$$(".Bm3ON");
  }

  fs.writeFileSync("page32.json", JSON.stringify(allProductDetails, null, 2));
  console.log("Data saved to page32.json");

  // await browser.close();
  console.log("browser is closed now ");
};

scrapdata();
