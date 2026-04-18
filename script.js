const tripStart = new Date("2026-04-29T00:00:00-04:00");

const flightData = {
  outbound: {
    label: "Apr 29 - Apr 30",
    title: "多伦多出发，经纽约转机飞罗马",
    note: "抵达 FCO 后直接转火车去佛罗伦萨，第一天不用硬塞罗马景点。",
    codes: ["YYZ", "NYC", "FCO"],
    progress: "34%"
  },
  return: {
    label: "May 8",
    title: "罗马返程，经底特律转机回多伦多",
    note: "早上从罗马出发，前一晚建议住在去机场交通方便的位置。",
    codes: ["FCO", "DTW", "YYZ"],
    progress: "66%"
  }
};

const weatherCities = [
  { name: "佛罗伦萨", lat: 43.7696, lon: 11.2558 },
  { name: "威尼斯", lat: 45.4408, lon: 12.3155 },
  { name: "罗马", lat: 41.9028, lon: 12.4964 }
];

const cityPlans = {
  florence: [
    {
      date: "4 月 30 日",
      label: "抵达 + 适应时差",
      title: "FCO 入境后坐火车去佛罗伦萨",
      body: "到 Firenze Santa Maria Novella 后先放行李，下午轻松走圣母百花大教堂外观、共和国广场和领主广场。",
      tip: "第一天别安排重博物馆。晚一点去米开朗基罗广场，日落会很值。",
      map: "https://www.google.com/maps/search/?api=1&query=Piazzale+Michelangelo+Florence",
      ticket: "https://www.trenitalia.com/en.html"
    },
    {
      date: "5 月 1 日",
      label: "乌菲兹 + 老桥",
      title: "把文艺复兴主菜先吃掉",
      body: "上午安排乌菲兹美术馆，下午沿阿诺河走老桥、奥特拉诺区和皮蒂宫附近的小街。",
      tip: "乌菲兹建议预约上午早场；馆内时间很容易超过 2.5 小时。",
      map: "https://www.google.com/maps/search/?api=1&query=Uffizi+Gallery+Florence",
      ticket: "https://www.uffizi.it/en/tickets"
    },
    {
      date: "5 月 2 日",
      label: "大卫 + 大教堂",
      title: "学院美术馆、穹顶或钟楼",
      body: "早上看学院美术馆的《大卫》，之后根据体力选圣母百花大教堂穹顶、乔托钟楼或中央市场。",
      tip: "穹顶名额紧，能订就提前订；如果没有票，外观和周边广场也足够好看。",
      map: "https://www.google.com/maps/search/?api=1&query=Galleria+dell%27Accademia+Firenze",
      ticket: "https://www.galleriaaccademiafirenze.it/en/tickets/"
    },
    {
      date: "5 月 3 日早上",
      label: "北上威尼斯",
      title: "佛罗伦萨到威尼斯",
      body: "上午从 Firenze SMN 出发去 Venezia Santa Lucia。抵达后先别急着坐船，出站那一眼的大运河就是开场。",
      tip: "高铁票看 Trenitalia 和 Italo 两边；行李多的话优先选少换乘。",
      map: "https://www.google.com/maps/dir/Florence/Venice/",
      ticket: "https://www.italotreno.com/en"
    }
  ],
  venice: [
    {
      date: "5 月 3 日",
      label: "抵达水城",
      title: "里亚托桥、大运河和 cicchetti",
      body: "入住后沿着小巷往里亚托桥方向走，傍晚找 bacaro 吃 cicchetti，再看大运河夜色。",
      tip: "威尼斯最好的安排常常是迷路。把地图当备份，不要每十分钟查一次。",
      map: "https://www.google.com/maps/search/?api=1&query=Rialto+Bridge+Venice",
      ticket: "https://actv.avmspa.it/en/content/actv-fares"
    },
    {
      date: "5 月 4 日",
      label: "圣马可核心区",
      title: "圣马可广场、总督宫和慢逛",
      body: "早上趁人少去圣马可广场，白天看总督宫和叹息桥，下午在 Castello 或 Dorsoduro 放慢脚步。",
      tip: "总督宫可以买 St. Mark's Square Museums Ticket；圣马可区午后人多，早晚体验更好。",
      map: "https://www.google.com/maps/search/?api=1&query=Doge%27s+Palace+Venice",
      ticket: "https://www.visitmuve.it/en/visit/tickets/"
    },
    {
      date: "5 月 5 日早上",
      label: "南下罗马",
      title: "离开前再走一段水边",
      body: "早起看一眼安静的运河，再从 Venezia Santa Lucia 出发去 Roma Termini。",
      tip: "水上巴士到火车站的时间要留余量；威尼斯桥多，拖箱会比地图上看起来更慢。",
      map: "https://www.google.com/maps/dir/Venice/Rome/",
      ticket: "https://www.trenitalia.com/en.html"
    }
  ],
  rome: [
    {
      date: "5 月 5 日",
      label: "抵达罗马",
      title: "万神殿、纳沃纳广场、许愿池夜景",
      body: "下午到罗马后先轻松走市中心。晚上去许愿池和西班牙广场，比白天更有旅行感。",
      tip: "罗马石板路多，第一天别把脚走废。好鞋比好相机重要。",
      map: "https://www.google.com/maps/search/?api=1&query=Pantheon+Rome",
      ticket: "https://www.museiitaliani.it/"
    },
    {
      date: "5 月 6 日",
      label: "古罗马日",
      title: "斗兽场、古罗马广场、帕拉蒂尼山",
      body: "上午安排斗兽场入场，之后把古罗马广场和帕拉蒂尼山连在一起。下午可去卡比托利欧或 Monti。",
      tip: "斗兽场是实名和时段票，官网通常提前 30 天开放相应日期票。",
      map: "https://www.google.com/maps/search/?api=1&query=Colosseum+Rome",
      ticket: "https://ticketing.colosseo.it/en"
    },
    {
      date: "5 月 7 日",
      label: "梵蒂冈 + 告别晚餐",
      title: "梵蒂冈博物馆、西斯廷礼拜堂、圣彼得",
      body: "把梵蒂冈安排在最后一个完整白天。晚上去 Trastevere 或 Campo de' Fiori 周边吃告别晚餐。",
      tip: "梵蒂冈博物馆官网提醒只通过 tickets.museivaticani.va 购买，注意避开相似域名。",
      map: "https://www.google.com/maps/search/?api=1&query=Vatican+Museums",
      ticket: "https://tickets.museivaticani.va/"
    },
    {
      date: "5 月 8 日早上",
      label: "返程",
      title: "罗马到机场，飞回多伦多",
      body: "早上从罗马出发，经底特律转机回多伦多。前一晚把退税、行李重量和机场交通确认好。",
      tip: "国际航班当天不要安排景点。留出机场路上、退税和安检的缓冲。",
      map: "https://www.google.com/maps/dir/Rome/Fiumicino+Airport/",
      ticket: "https://www.trenitalia.com/en/services/leonardo-express.html"
    }
  ]
};

const weatherCodeText = {
  0: "晴",
  1: "大致晴朗",
  2: "局部多云",
  3: "多云",
  45: "有雾",
  48: "雾凇",
  51: "小毛毛雨",
  53: "毛毛雨",
  55: "较强毛毛雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  80: "阵雨",
  81: "阵雨",
  82: "强阵雨",
  95: "雷暴"
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const now = new Date();
  const diff = tripStart - now;
  const title = document.querySelector("#countdownTitle");

  if (diff <= 0) {
    title.textContent = "旅行已经开始";
    document.querySelector("#days").textContent = "00";
    document.querySelector("#hours").textContent = "00";
    document.querySelector("#minutes").textContent = "00";
    document.querySelector("#seconds").textContent = "00";
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.querySelector("#days").textContent = pad(days);
  document.querySelector("#hours").textContent = pad(hours);
  document.querySelector("#minutes").textContent = pad(minutes);
  document.querySelector("#seconds").textContent = pad(seconds);
}

function switchFlight(key) {
  const data = flightData[key];
  document.querySelector("#flightLabel").textContent = data.label;
  document.querySelector("#flightTitle").textContent = data.title;
  document.querySelector("#flightNote").textContent = data.note;
  document.querySelector("#originCode").textContent = data.codes[0];
  document.querySelector("#midCode").textContent = data.codes[1];
  document.querySelector("#destCode").textContent = data.codes[2];
  document.querySelector("#flightProgress").style.width = data.progress;

  document.querySelectorAll("[data-flight]").forEach((button) => {
    button.classList.toggle("active", button.dataset.flight === key);
  });
}

function renderTimeline(city) {
  const container = document.querySelector("#timeline");
  container.innerHTML = cityPlans[city]
    .map(
      (item) => `
        <article class="timeline-item">
          <div class="timeline-date">
            <strong>${item.date}</strong>
            <span>${item.label}</span>
          </div>
          <div class="timeline-body">
            <h3>${item.title}</h3>
            <p>${item.body}</p>
            <div class="tips">${item.tip}</div>
          </div>
          <div class="timeline-actions">
            <a href="${item.map}" target="_blank" rel="noreferrer">地图</a>
            <a href="${item.ticket}" target="_blank" rel="noreferrer">官网</a>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelectorAll("[data-city]").forEach((button) => {
    button.classList.toggle("active", button.dataset.city === city);
  });
}

async function fetchWeather() {
  const grid = document.querySelector("#weatherGrid");
  grid.innerHTML = weatherCities
    .map(
      (city) => `
        <article class="weather-card">
          <span>${city.name}</span>
          <strong>--°</strong>
          <p>正在获取天气...</p>
        </article>
      `
    )
    .join("");

  const cards = [...grid.querySelectorAll(".weather-card")];

  await Promise.all(
    weatherCities.map(async (city, index) => {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.search = new URLSearchParams({
        latitude: city.lat,
        longitude: city.lon,
        current: "temperature_2m,weather_code,wind_speed_10m",
        timezone: "Europe/Rome"
      });

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("weather request failed");
        const data = await response.json();
        const current = data.current;
        const text = weatherCodeText[current.weather_code] || "天气更新";
        cards[index].innerHTML = `
          <span>${city.name}</span>
          <strong>${Math.round(current.temperature_2m)}°C</strong>
          <p>${text} · 风速 ${Math.round(current.wind_speed_10m)} km/h</p>
        `;
      } catch (error) {
        cards[index].innerHTML = `
          <span>${city.name}</span>
          <strong>--°</strong>
          <p>暂时无法获取天气，出门前再刷新一次。</p>
        `;
      }
    })
  );
}

function handlePhotos(files) {
  const wall = document.querySelector("#photoWall");
  wall.innerHTML = "";

  [...files].slice(0, 9).forEach((file) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const tile = document.createElement("article");
      tile.className = "photo-tile";
      tile.innerHTML = `<img src="${reader.result}" alt="上传的旅途照片" />`;
      wall.appendChild(tile);
    });
    reader.readAsDataURL(file);
  });
}

function getMessages() {
  try {
    return JSON.parse(localStorage.getItem("italyTripMessages") || "[]");
  } catch (error) {
    return [];
  }
}

function saveMessages(messages) {
  localStorage.setItem("italyTripMessages", JSON.stringify(messages.slice(-8)));
}

function renderMessages() {
  const list = document.querySelector("#messageList");
  const messages = getMessages();

  if (!messages.length) {
    list.innerHTML = '<article><strong>还没有留言</strong><p>第一句留给出发前的期待。</p></article>';
    return;
  }

  list.innerHTML = messages
    .map(
      (message) => `
        <article>
          <strong>${message.name}</strong>
          <p>${message.text}</p>
        </article>
      `
    )
    .join("");
}

function sanitize(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function guideAnswer(question) {
  const q = question.toLowerCase();

  if (q.includes("票") || q.includes("预订") || q.includes("官网")) {
    return "优先订：乌菲兹、学院美术馆、圣母百花穹顶、总督宫、斗兽场、梵蒂冈博物馆。斗兽场留意 30 天放票，梵蒂冈只认 tickets.museivaticani.va。";
  }

  if (q.includes("佛罗伦萨") || q.includes("florence") || q.includes("firenze")) {
    return "佛罗伦萨建议把乌菲兹放 5 月 1 日上午，学院美术馆和大教堂放 5 月 2 日。日落去米开朗基罗广场，轻松又出片。";
  }

  if (q.includes("威尼斯") || q.includes("venice") || q.includes("venezia")) {
    return "威尼斯别排太满。5 月 3 日抵达后走里亚托和大运河，5 月 4 日早上圣马可，白天总督宫，下午给小巷和 Dorsoduro。";
  }

  if (q.includes("罗马") || q.includes("rome") || q.includes("roma")) {
    return "罗马三天建议：5 月 5 日市中心夜景，5 月 6 日斗兽场和古罗马广场，5 月 7 日梵蒂冈和 Trastevere 告别晚餐。";
  }

  if (q.includes("吃") || q.includes("餐") || q.includes("咖啡")) {
    return "简单吃法：佛罗伦萨找 bistecca 和 lampredotto，威尼斯吃 cicchetti，罗马试 cacio e pepe、carbonara、suppli。热门店尽量提前订。";
  }

  if (q.includes("火车") || q.includes("交通")) {
    return "三段城际移动都适合高铁。查 Trenitalia 和 Italo，两边都看；站名重点记：Firenze SMN、Venezia S. Lucia、Roma Termini。";
  }

  return "这趟路线的原则是：佛罗伦萨先解决艺术预约，威尼斯留白慢逛，罗马把斗兽场和梵蒂冈分成两个完整白天。";
}

function addGuideMessage(text, isUser = false) {
  const log = document.querySelector("#guideLog");
  const p = document.createElement("p");
  p.className = isUser ? "user" : "";
  p.innerHTML = sanitize(text);
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

async function shareTrip() {
  const shareData = {
    title: "意大利行程 | Florence Venice Rome",
    text: "4/29-5/8 意大利三城旅行行程板",
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  await navigator.clipboard.writeText(window.location.href);
  const button = document.querySelector("#shareBtn");
  button.textContent = "已复制";
  window.setTimeout(() => {
    button.textContent = "分享";
  }, 1600);
}

document.addEventListener("DOMContentLoaded", () => {
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  document.querySelectorAll("[data-flight]").forEach((button) => {
    button.addEventListener("click", () => switchFlight(button.dataset.flight));
  });

  document.querySelectorAll("[data-city]").forEach((button) => {
    button.addEventListener("click", () => renderTimeline(button.dataset.city));
  });

  document.querySelector("#weatherRefresh").addEventListener("click", fetchWeather);
  document.querySelector("#uploadTrigger").addEventListener("click", () => {
    document.querySelector("#photoInput").click();
  });
  document.querySelector("#photoInput").addEventListener("change", (event) => {
    handlePhotos(event.target.files);
  });

  document.querySelector("#guestForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = sanitize(document.querySelector("#guestName").value.trim() || "朋友");
    const text = sanitize(document.querySelector("#guestMessage").value.trim());
    if (!text) return;

    const messages = getMessages();
    messages.push({ name, text });
    saveMessages(messages);
    event.target.reset();
    renderMessages();
  });

  document.querySelector("#guideToggle").addEventListener("click", () => {
    document.querySelector("#guidePanel").classList.add("open");
    document.querySelector("#guideToggle").style.display = "none";
  });

  document.querySelector("#guideClose").addEventListener("click", () => {
    document.querySelector("#guidePanel").classList.remove("open");
    document.querySelector("#guideToggle").style.display = "block";
  });

  document.querySelector("#guideForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector("#guideInput");
    const question = input.value.trim();
    if (!question) return;
    addGuideMessage(question, true);
    addGuideMessage(guideAnswer(question));
    input.value = "";
  });

  document.querySelector("#shareBtn").addEventListener("click", shareTrip);

  switchFlight("outbound");
  renderTimeline("florence");
  renderMessages();
  fetchWeather();
});
