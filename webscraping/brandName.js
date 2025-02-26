const getbrandkoname = (title) => {
  const mobileBrands = {
    apple: "Apple",
    samsung: "Samsung",
    vivo: "Vivo",
    oppo: "Oppo",
    xiaomi: "Xiaomi",
    realme: "Realme",
    redmi: "Redmi",
    nothing: "Nothing",
    tecno: "Tecno",
    infinix: "Infinix",
    poco: "Poco",
    nokia: "Nokia",
    oneplus: "OnePlus",
    huawei: "Huawei",
    motorola: "Motorola",
    lenovo: "Lenovo",
    sony: "Sony",
    lg: "LG",
    google: "Google",
    honor: "Honor",
    asus: "Asus",
  };

  const lowercasetitle = title.toLowerCase();

  if (lowercasetitle.includes("no brand")) {
    return "No Brand";
  }

  for (const [key, brand] of Object.entries(mobileBrands)) {
    if (lowercasetitle.includes(key)) {
      return brand;
    }
  }

  return "No Brand";
};

export default getbrandkoname;
