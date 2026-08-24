/**
 * Seed college/school names for the registration picker.
 * Live list also merges API customs + prior registration names.
 */
export const SEED_INSTITUTIONS = [
  "MACFAST",
  "Bishop Moore College",
  "Christian College, Chengannur",
  "MSM College, Kayamkulam",
  "N.S.S. College, Cherthala",
  "SN College, Cherthala",
  "SD College, Alappuzha",
  "St. Joseph's College for Women, Alappuzha",
  "St. Michael's College, Cherthala",
  "TKMM College, Nangiarkulangara",
  "SN College, Chengannur",
  "Sree Ayyappa College, Eramallikara",
  "Fatima Mata National College",
  "Sree Narayana College for Women, Kollam",
  "SN College, Kollam",
  "Government Arts & Science College, Thazhava",
  "Baby John Memorial Government College",
  "Kumpalathu Sanku Pillai Memorial Devaswom Board College",
  "TKM College of Arts & Science, Karicode",
  "St. Gregorios College, Kottarakkara",
  "St. Stephen's College, Pathanapuram",
  "NSS College Nilamel",
  "St. John's College, Anchal",
  "Sree Narayana College, Punalur",
  "MMNSS College Kottiyam",
  "SN College, Chathannur",
  "Ayyankali Memorial Arts and Science College",
  "St. Cyril's College, Adoor",
  "N.S.S. College, Pandalam",
  "Government College for Women, Thiruvananthapuram",
  "St. Xavier's College, Thumba",
  "University College, Thiruvananthapuram",
  "Government College, Kariavattom",
  "Government Sanskrit College, Thiruvananthapuram",
  "Government College, Attingal",
  "Government College, Nedumangad",
  "Kunjukrishnan Nadar Memorial Government Arts and Science College",
  "All Saints College, Thiruvananthapuram",
  "H.H. Maharani Sethu Parvathi Bai N.S.S. College for Women",
  "Mahatma Gandhi College",
  "Mar Ivanios College",
  "S.N. College, Sivagiri",
  "Sree Narayana College, Chempazhanthy",
  "VTM NSS College, Dhanuvachapuram",
  "Adi Shankara Institute of Engineering and Technology",
  "Al Azhar College of Engineering and Technology",
  "Albertian Institute of Science and Technology",
  "Amal Jyothi College of Engineering",
  "Baselios Poulose II Catholicos College",
  "Baselios Poulose Second College",
  "Baselius College",
  "Berchmans Institute of Management Studies",
  "Bharata Mata College",
  "Bishop Chulaparambil Memorial College for Women",
  "CMS College Kottayam",
  "Christ Knowledge City",
  "Cochin College",
  "College of Applied Science, Pathanamthitta",
  "College of Applied Science, Muvattupuzha",
  "College of Applied Science, Piravom",
  "College of Applied Science, Kothamangalam",
  "College of Applied Science, Kottayam",
  "College of Applied Science, Punnappra",
  "College of Applied Science, Kanjirappally",
];

export const OTHERS_VALUE = "__others__";
export const OTHERS_LABEL = "Others (not in list)";

export function mergeInstitutions(extra = []) {
  const set = new Map();
  [...SEED_INSTITUTIONS, ...extra].forEach((raw) => {
    const name = String(raw || "").trim().replace(/\s+/g, " ");
    if (name.length < 2) return;
    const key = name.toLowerCase();
    if (!set.has(key)) set.set(key, name);
  });
  return [...set.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

export function filterInstitutions(list, query, limit = 12) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return list.slice(0, limit);
  const starts = [];
  const contains = [];
  for (const name of list) {
    const lower = name.toLowerCase();
    if (lower.startsWith(q)) starts.push(name);
    else if (lower.includes(q)) contains.push(name);
    if (starts.length + contains.length >= limit * 2) break;
  }
  return [...starts, ...contains].slice(0, limit);
}
