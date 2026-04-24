const tripStart = new Date("2026-04-29T00:00:00-04:00");
const SUPABASE_URL = "https://wftyyloxcgzfrydfljrj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vh5sFH8OcLWyxh9VBjElRw_yUUEqhIp";
const MEMORY_BUCKET = "trip-photos";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1800;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const supabaseClient =
  window.supabase && typeof window.supabase.createClient === "function"
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

let memoryPhotos = [];
let activePhotoIndex = 0;
let activePhotoZoom = 1;

const weatherCities = [
  { name: "佛罗伦萨", lat: 43.7696, lon: 11.2558 },
  { name: "威尼斯", lat: 45.4408, lon: 12.3155 },
  { name: "罗马", lat: 41.9028, lon: 12.4964 }
];

const italyClockCities = [
  { name: "罗马", label: "Rome", stay: "May 5 - May 8", timeZone: "Europe/Rome" },
  { name: "佛罗伦萨", label: "Florence", stay: "Apr 30 - May 3", timeZone: "Europe/Rome" },
  { name: "威尼斯", label: "Venice", stay: "May 3 - May 5", timeZone: "Europe/Rome" }
];

const flightCheckpoints = [
  {
    label: "DL 5098",
    route: "YYZ → JFK",
    start: "2026-04-29T12:09:00-04:00",
    end: "2026-04-29T13:59:00-04:00",
    timeZone: "America/Toronto"
  },
  {
    label: "DL 182",
    route: "JFK → FCO",
    start: "2026-04-29T17:10:00-04:00",
    end: "2026-04-30T07:55:00+02:00",
    timeZone: "America/New_York"
  },
  {
    label: "DL 207",
    route: "FCO → DTW",
    start: "2026-05-08T09:00:00+02:00",
    end: "2026-05-08T13:16:00-04:00",
    timeZone: "Europe/Rome"
  },
  {
    label: "Delta Connection",
    route: "DTW → YYZ",
    start: "2026-05-08T15:50:00-04:00",
    end: "2026-05-08T17:21:00-04:00",
    timeZone: "America/Detroit"
  }
];

const weatherCodeMeta = {
  0: { text: "晴", icon: "☀️" },
  1: { text: "大致晴朗", icon: "🌤️" },
  2: { text: "局部多云", icon: "⛅" },
  3: { text: "多云", icon: "☁️" },
  45: { text: "有雾", icon: "🌫️" },
  48: { text: "雾凇", icon: "🌫️" },
  51: { text: "小毛毛雨", icon: "🌦️" },
  53: { text: "毛毛雨", icon: "🌦️" },
  55: { text: "较强毛毛雨", icon: "🌦️" },
  61: { text: "小雨", icon: "☔️" },
  63: { text: "中雨", icon: "☔️" },
  65: { text: "大雨", icon: "☔️" },
  71: { text: "小雪", icon: "❄️" },
  73: { text: "中雪", icon: "❄️" },
  75: { text: "大雪", icon: "❄️" },
  80: { text: "阵雨", icon: "🌦️" },
  81: { text: "阵雨", icon: "🌦️" },
  82: { text: "强阵雨", icon: "☔️" },
  95: { text: "雷暴", icon: "⛈️" }
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatInZone(date, timeZone, options) {
  return new Intl.DateTimeFormat("zh-CN", { timeZone, ...options }).format(date);
}

function timeZoneOffsetMinutes(timeZone, date) {
  const values = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  })
    .formatToParts(date)
    .reduce((acc, part) => {
      if (part.type !== "literal") acc[part.type] = Number(part.value);
      return acc;
    }, {});

  const utcTime = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second
  );

  return Math.round((utcTime - date.getTime()) / 60000);
}

function formatTorontoOffset(timeZone) {
  const now = new Date();
  const diff = timeZoneOffsetMinutes(timeZone, now) - timeZoneOffsetMinutes("America/Toronto", now);
  const sign = diff >= 0 ? "+" : "-";
  const hours = Math.floor(Math.abs(diff) / 60);
  const minutes = Math.abs(diff) % 60;
  return `比多伦多 ${sign}${hours}${minutes ? `h${pad(minutes)}` : "h"}`;
}

function formatFlightTime(date, timeZone) {
  return formatInZone(date, timeZone, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function formatRelative(ms) {
  if (ms <= 0) return "现在";
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms / 3600000) % 24);
  const minutes = Math.floor((ms / 60000) % 60);
  if (days > 0) return `${days}天 ${hours}小时`;
  if (hours > 0) return `${hours}小时 ${minutes}分钟`;
  return `${Math.max(minutes, 1)}分钟`;
}

function renderClockShell() {
  const grid = document.querySelector("#italyClockGrid");
  if (!grid || grid.children.length) return;
  grid.innerHTML = italyClockCities
    .map(
      (city) => `
        <article class="time-card" data-clock-city="${sanitize(city.name)}">
          <span>${sanitize(city.label)}</span>
          <strong data-clock-time>--:--:--</strong>
          <p data-clock-date>${sanitize(city.stay)}</p>
          <small data-clock-offset>${formatTorontoOffset(city.timeZone)}</small>
        </article>
      `
    )
    .join("");
}

function updateItalyClocks() {
  renderClockShell();
  const now = new Date();
  const cards = document.querySelectorAll("[data-clock-city]");
  cards.forEach((card, index) => {
    const city = italyClockCities[index];
    card.querySelector("[data-clock-time]").textContent = formatInZone(now, city.timeZone, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    card.querySelector("[data-clock-date]").textContent = `${formatInZone(now, city.timeZone, {
      month: "long",
      day: "numeric",
      weekday: "short"
    })} · ${city.stay}`;
    card.querySelector("[data-clock-offset]").textContent = formatTorontoOffset(city.timeZone);
  });

  const sync = document.querySelector("#clockSync");
  if (sync) {
    sync.textContent = `Europe/Rome · ${formatInZone(now, "Europe/Rome", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    })}`;
  }
}

function updateFlightStatusPanel() {
  const panel = document.querySelector("#flightStatusPanel");
  if (!panel) return;

  const now = new Date();
  const next =
    flightCheckpoints.find((checkpoint) => new Date(checkpoint.end).getTime() >= now.getTime()) ||
    flightCheckpoints[flightCheckpoints.length - 1];
  const start = new Date(next.start);
  const end = new Date(next.end);
  const isActive = now >= start && now <= end;
  const isComplete = now > end;
  const status = isActive ? "进行中" : isComplete ? "行程完成" : "下一段";
  const statusText = isActive
    ? `预计 ${formatFlightTime(end, next.timeZone)} 抵达`
    : isComplete
      ? "欢迎回到多伦多"
      : `${formatRelative(start.getTime() - now.getTime())} 后出发`;

  panel.innerHTML = `
    <article>
      <span>${status}</span>
      <strong>${sanitize(next.label)} · ${sanitize(next.route)}</strong>
      <p>${statusText}</p>
    </article>
    <article>
      <span>Official source</span>
      <strong>Delta / Expedia</strong>
      <p>登机口、延误和航站楼以官网为准。</p>
    </article>
    <article>
      <span>Toronto refresh</span>
      <strong>${formatInZone(now, "America/Toronto", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      })}</strong>
      <p>${formatInZone(now, "America/Toronto", {
        month: "long",
        day: "numeric",
        weekday: "short"
      })}</p>
    </article>
  `;

  const stamp = document.querySelector("#flightLiveStamp");
  if (stamp) {
    stamp.textContent = `Auto clock · ${formatInZone(now, "America/Toronto", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    })}`;
  }
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

async function fetchWeather() {
  const grid = document.querySelector("#weatherGrid");
  grid.innerHTML = weatherCities
    .map(
      (city) => `
        <article class="weather-card">
          <b class="weather-icon" aria-hidden="true">⏳</b>
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
        const weather = weatherCodeMeta[current.weather_code] || { text: "天气更新", icon: "🌡️" };
        cards[index].innerHTML = `
          <b class="weather-icon" aria-hidden="true">${weather.icon}</b>
          <span>${city.name}</span>
          <strong>${Math.round(current.temperature_2m)}°C</strong>
          <p>${weather.text} · 风速 ${Math.round(current.wind_speed_10m)} km/h</p>
        `;
      } catch (error) {
        cards[index].innerHTML = `
          <b class="weather-icon" aria-hidden="true">☁️</b>
          <span>${city.name}</span>
          <strong>--°</strong>
          <p>暂时无法获取天气，出门前再刷新一次。</p>
        `;
      }
    })
  );
}

function setStatus(selector, message, tone = "muted") {
  const element = document.querySelector(selector);
  if (!element) return;
  element.textContent = message;
  element.dataset.tone = tone;
}

function renderPhotoPlaceholder(title, text) {
  const wall = document.querySelector("#photoWall");
  wall.innerHTML = `
    <article class="placeholder-photo">
      <strong>${sanitize(title)}</strong>
      <span>${sanitize(text)}</span>
    </article>
  `;
}

function formatMemoryDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function safeTrim(value, fallback, maxLength) {
  const text = value.trim() || fallback;
  return text.slice(0, maxLength);
}

function getPhotoOwner() {
  const photoName = document.querySelector("#photoName").value;
  const guestName = document.querySelector("#guestName").value;
  return safeTrim(photoName || guestName, "朋友", 40);
}

function extensionForType(type) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function makeUploadPath(type) {
  const cryptoApi = window.crypto || null;
  const id =
    cryptoApi && typeof cryptoApi.randomUUID === "function"
      ? cryptoApi.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `uploads/${id}.${extensionForType(type)}`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = src;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

async function compressImage(file) {
  const dataUrl = await fileToDataUrl(file);
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let quality = 0.82;
  let blob = await canvasToBlob(canvas, "image/jpeg", quality);
  while (blob && blob.size > MAX_UPLOAD_BYTES && quality > 0.48) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
  }

  if (!blob || blob.size > MAX_UPLOAD_BYTES) {
    throw new Error("这张照片压缩后仍然超过 5MB，请换一张小一点的照片。");
  }

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "trip-photo"}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now()
  });
}

async function prepareImage(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("只能上传图片文件。");
  }

  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("目前支持 JPG、PNG、WebP。iPhone HEIC 请先转成 JPG 再上传。");
  }

  if (file.size <= MAX_UPLOAD_BYTES) return file;
  return compressImage(file);
}

async function loadPhotos() {
  if (!supabaseClient) {
    renderPhotoPlaceholder("云端相册暂时连接不上", "请稍后刷新页面，或检查网络后再上传。");
    setStatus("#photoStatus", "云端相册暂时连接不上。", "error");
    return;
  }

  setStatus("#photoStatus", "正在读取云端照片...", "muted");
  const { data, error } = await supabaseClient
    .from("trip_photos")
    .select("id,image_path,uploader,caption,created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    renderPhotoPlaceholder("照片暂时加载失败", "稍后刷新一下，云端相册会重新同步。");
    setStatus("#photoStatus", `照片加载失败：${error.message}`, "error");
    return;
  }

  const wall = document.querySelector("#photoWall");
  if (!data.length) {
    memoryPhotos = [];
    renderPhotoPlaceholder("云端照片墙", "第一张照片留给意大利的清晨。");
    setStatus("#photoStatus", "云端相册已连接，等待第一张照片。", "success");
    return;
  }

  memoryPhotos = data.map((photo) => ({
    ...photo,
    publicUrl: supabaseClient.storage.from(MEMORY_BUCKET).getPublicUrl(photo.image_path).data.publicUrl
  }));

  wall.innerHTML = memoryPhotos
    .map((photo, index) => {
      const caption = photo.caption ? `<p>${sanitize(photo.caption)}</p>` : "";
      return `
        <article class="photo-tile">
          <button class="photo-open" type="button" data-photo-index="${index}" aria-label="打开 ${sanitize(photo.caption || `${photo.uploader} 上传的旅途照片`)}">
            <img src="${photo.publicUrl}" alt="${sanitize(photo.caption || `${photo.uploader} 上传的旅途照片`)}" loading="lazy" />
          </button>
          <button class="photo-delete" type="button" data-delete-photo="${index}" aria-label="删除这张照片">删除</button>
          <div class="photo-meta">
            <strong>${sanitize(photo.uploader || "朋友")}</strong>
            <span>${formatMemoryDate(photo.created_at)}</span>
            ${caption}
          </div>
        </article>
      `;
    })
    .join("");
  setStatus("#photoStatus", `已同步 ${data.length} 张云端照片。`, "success");
}

async function deletePhoto(index, button) {
  const photo = memoryPhotos[index];
  if (!photo || !supabaseClient) return;

  const confirmed = window.confirm("确定删除这张照片吗？删除后，所有打开这个网站的人都看不到它。");
  if (!confirmed) return;

  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "删除中";
  setStatus("#photoStatus", "正在删除这张云端照片...", "muted");

  try {
    const { error: tableError } = await supabaseClient.from("trip_photos").delete().eq("id", photo.id);
    if (tableError) throw tableError;

    const { error: storageError } = await supabaseClient.storage.from(MEMORY_BUCKET).remove([photo.image_path]);
    if (storageError) {
      setStatus("#photoStatus", "照片已从墙上删除；原图文件清理稍后再试。", "success");
    } else {
      setStatus("#photoStatus", "照片已经从云端相册删除。", "success");
    }

    if (document.querySelector("#photoLightbox").classList.contains("open")) {
      closePhotoLightbox();
    }
    await loadPhotos();
  } catch (error) {
    setStatus("#photoStatus", `删除失败：${error.message}`, "error");
    button.disabled = false;
    button.textContent = originalText;
  }
}

function renderPhotoLightbox() {
  const photo = memoryPhotos[activePhotoIndex];
  if (!photo) return;

  const image = document.querySelector("#lightboxImage");
  const caption = document.querySelector("#lightboxCaption");
  const counter = document.querySelector("#lightboxCounter");
  const zoom = Math.round(activePhotoZoom * 100);

  image.src = photo.publicUrl;
  image.alt = photo.caption || `${photo.uploader || "朋友"} 上传的旅途照片`;
  image.style.transform = `scale(${activePhotoZoom})`;
  caption.innerHTML = `
    <strong>${sanitize(photo.uploader || "朋友")}</strong>
    <span>${formatMemoryDate(photo.created_at)} · ${zoom}%</span>
    ${photo.caption ? `<p>${sanitize(photo.caption)}</p>` : ""}
  `;
  counter.textContent = `${activePhotoIndex + 1} / ${memoryPhotos.length}`;
}

function openPhotoLightbox(index) {
  if (!memoryPhotos.length) return;
  activePhotoIndex = Math.max(0, Math.min(index, memoryPhotos.length - 1));
  activePhotoZoom = 1;
  const lightbox = document.querySelector("#photoLightbox");
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-active");
  renderPhotoLightbox();
}

function closePhotoLightbox() {
  const lightbox = document.querySelector("#photoLightbox");
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-active");
}

function movePhotoLightbox(step) {
  if (!memoryPhotos.length) return;
  activePhotoIndex = (activePhotoIndex + step + memoryPhotos.length) % memoryPhotos.length;
  activePhotoZoom = 1;
  renderPhotoLightbox();
}

function changePhotoZoom(action) {
  if (action === "in") activePhotoZoom = Math.min(3, activePhotoZoom + 0.25);
  if (action === "out") activePhotoZoom = Math.max(0.75, activePhotoZoom - 0.25);
  if (action === "reset") activePhotoZoom = 1;
  renderPhotoLightbox();
}

async function handlePhotos(files) {
  if (!supabaseClient) {
    setStatus("#photoStatus", "云端相册暂时连接不上，无法上传。", "error");
    return;
  }

  const selected = [...files].filter((file) => file.type.startsWith("image/")).slice(0, 12);
  if (!selected.length) return;

  const button = document.querySelector("#uploadTrigger");
  const input = document.querySelector("#photoInput");
  const caption = document.querySelector("#photoCaption").value.trim().slice(0, 220);
  const uploader = getPhotoOwner();
  button.disabled = true;

  try {
    let uploaded = 0;
    for (const file of selected) {
      setStatus("#photoStatus", `正在处理 ${file.name}...`, "muted");
      const readyFile = await prepareImage(file);
      const path = makeUploadPath(readyFile.type);
      const { error: uploadError } = await supabaseClient.storage.from(MEMORY_BUCKET).upload(path, readyFile, {
        cacheControl: "31536000",
        contentType: readyFile.type,
        upsert: false
      });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabaseClient.from("trip_photos").insert({
        image_path: path,
        uploader,
        caption
      });
      if (insertError) throw insertError;

      uploaded += 1;
      setStatus("#photoStatus", `已上传 ${uploaded} / ${selected.length} 张照片...`, "success");
    }

    document.querySelector("#photoCaption").value = "";
    await loadPhotos();
    setStatus("#photoStatus", `上传完成，${uploaded} 张照片已经进入云端相册。`, "success");
  } catch (error) {
    setStatus("#photoStatus", `上传失败：${error.message}`, "error");
  } finally {
    input.value = "";
    button.disabled = false;
  }
}

async function renderMessages() {
  const list = document.querySelector("#messageList");
  if (!supabaseClient) {
    list.innerHTML = '<article><strong>留言暂时连接不上</strong><p>稍后刷新页面再试一次。</p></article>';
    setStatus("#messageStatus", "留言暂时连接不上。", "error");
    return;
  }

  const { data, error } = await supabaseClient
    .from("trip_messages")
    .select("name,text,created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    list.innerHTML = '<article><strong>留言暂时加载失败</strong><p>稍后刷新页面再试一次。</p></article>';
    setStatus("#messageStatus", `留言加载失败：${error.message}`, "error");
    return;
  }

  if (!data.length) {
    list.innerHTML = '<article><strong>还没有留言</strong><p>第一句留给出发前的期待。</p></article>';
    setStatus("#messageStatus", "云端留言已连接，等待第一条留言。", "success");
    return;
  }

  list.innerHTML = data
    .map(
      (message) => `
        <article>
          <strong>${sanitize(message.name)}</strong>
          <span>${formatMemoryDate(message.created_at)}</span>
          <p>${sanitize(message.text)}</p>
        </article>
      `
    )
    .join("");
  setStatus("#messageStatus", `已同步 ${data.length} 条云端留言。`, "success");
}

async function saveCloudMessage(name, text) {
  if (!supabaseClient) throw new Error("留言暂时连接不上。");
  const { error } = await supabaseClient.from("trip_messages").insert({
    name: safeTrim(name, "朋友", 40),
    text: text.trim().slice(0, 220)
  });
  if (error) throw error;
}

function startMemoryRealtime() {
  if (!supabaseClient) return;
  supabaseClient
    .channel("italy-memory-wall")
    .on("postgres_changes", { event: "*", schema: "public", table: "trip_photos" }, loadPhotos)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "trip_messages" }, renderMessages)
    .subscribe();
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

  if (q.includes("航班") || q.includes("飞机") || q.includes("机场") || q.includes("terminal")) {
    return "去程：4 月 29 日 12:09 p.m. YYZ 出发，经 JFK，4 月 30 日 7:55 a.m. 到 FCO。返程：5 月 8 日 9:00 a.m. FCO 出发，经 DTW，5:21 p.m. 到 YYZ。航站楼和登机口看页面里的实时查询按钮。";
  }

  if (q.includes("酒店") || q.includes("住宿") || q.includes("地址") || q.includes("airbnb") || q.includes("expedia")) {
    return "住宿：佛罗伦萨 Via del Leone, 3；威尼斯 B&B HOTEL Venezia Laguna, Isola Nova del Tronchetto 16；罗马 Via Gaetano Casati, 26 interno 19。页面的住宿卡可以打开地图、平台搜索并复制地址。";
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

async function copyAddress(button) {
  const address = button.dataset.copyAddress;
  if (!address) return;

  try {
    await navigator.clipboard.writeText(address);
  } catch (error) {
    const textarea = document.createElement("textarea");
    textarea.value = address;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  const originalText = button.textContent;
  button.textContent = "Copied";
  window.setTimeout(() => {
    button.textContent = originalText;
  }, 1500);
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
  updateItalyClocks();
  window.setInterval(updateItalyClocks, 1000);
  updateFlightStatusPanel();
  window.setInterval(updateFlightStatusPanel, 60000);

  document.querySelectorAll("[data-copy-address]").forEach((button) => {
    button.addEventListener("click", () => copyAddress(button));
  });

  document.querySelector("#weatherRefresh").addEventListener("click", fetchWeather);
  document.querySelector("#uploadTrigger").addEventListener("click", () => {
    document.querySelector("#photoInput").click();
  });
  document.querySelector("#photoInput").addEventListener("change", async (event) => {
    await handlePhotos(event.target.files);
  });
  document.querySelector("#photoWall").addEventListener("click", async (event) => {
    const deleteButton = event.target.closest("[data-delete-photo]");
    if (deleteButton) {
      await deletePhoto(Number(deleteButton.dataset.deletePhoto), deleteButton);
      return;
    }

    const openButton = event.target.closest("[data-photo-index]");
    if (openButton) {
      openPhotoLightbox(Number(openButton.dataset.photoIndex));
    }
  });
  document.querySelector("#lightboxClose").addEventListener("click", closePhotoLightbox);
  document.querySelectorAll("[data-photo-step]").forEach((button) => {
    button.addEventListener("click", () => movePhotoLightbox(Number(button.dataset.photoStep)));
  });
  document.querySelectorAll("[data-photo-zoom]").forEach((button) => {
    button.addEventListener("click", () => changePhotoZoom(button.dataset.photoZoom));
  });
  document.querySelector("#lightboxImage").addEventListener("dblclick", () => {
    activePhotoZoom = activePhotoZoom > 1 ? 1 : 1.75;
    renderPhotoLightbox();
  });

  let touchStartX = 0;
  let touchStartY = 0;
  document.querySelector("#lightboxFrame").addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    },
    { passive: true }
  );
  document.querySelector("#lightboxFrame").addEventListener(
    "touchend",
    (event) => {
      const touch = event.changedTouches[0];
      const diffX = touch.clientX - touchStartX;
      const diffY = touch.clientY - touchStartY;
      if (Math.abs(diffX) > 48 && Math.abs(diffX) > Math.abs(diffY)) {
        movePhotoLightbox(diffX < 0 ? 1 : -1);
      }
    },
    { passive: true }
  );
  document.addEventListener("keydown", (event) => {
    const lightbox = document.querySelector("#photoLightbox");
    if (!lightbox.classList.contains("open")) return;
    if (event.key === "Escape") closePhotoLightbox();
    if (event.key === "ArrowLeft") movePhotoLightbox(-1);
    if (event.key === "ArrowRight") movePhotoLightbox(1);
    if (event.key === "+" || event.key === "=") changePhotoZoom("in");
    if (event.key === "-") changePhotoZoom("out");
    if (event.key === "0") changePhotoZoom("reset");
  });

  document.querySelector("#guestForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.querySelector("#guestName").value.trim() || "朋友";
    const text = document.querySelector("#guestMessage").value.trim();
    if (!text) return;

    const button = event.target.querySelector("button");
    button.disabled = true;
    setStatus("#messageStatus", "正在保存留言...", "muted");
    try {
      await saveCloudMessage(name, text);
      event.target.reset();
      await renderMessages();
      setStatus("#messageStatus", "留言已经保存到云端。", "success");
    } catch (error) {
      setStatus("#messageStatus", `留言保存失败：${error.message}`, "error");
    } finally {
      button.disabled = false;
    }
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

  renderMessages();
  loadPhotos();
  startMemoryRealtime();
  fetchWeather();
});
