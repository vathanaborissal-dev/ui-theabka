/** Name pools used to generate a realistic Cambodian guest list. */

export const surnames: Array<[string, string]> = [
  ["Sok", "សុខ"], ["Chea", "ជា"], ["Meas", "មាស"], ["Hun", "ហ៊ុន"], ["Kim", "គីម"],
  ["Ly", "លី"], ["Nou", "នូ"], ["Tep", "ទេព"], ["Ung", "អ៊ុង"], ["Pich", "ពេជ្រ"],
  ["Khiev", "ខៀវ"], ["Yem", "យ៉េម"], ["Chhun", "ឈុន"], ["Sam", "សំ"], ["Long", "ឡុង"],
  ["Neang", "នាង"], ["Say", "សាយ"], ["Em", "អែម"], ["Hor", "ហោ"], ["Va", "វ៉ា"],
  ["Ouk", "អ៊ុក"], ["Kong", "គង់"], ["Chan", "ចាន់"], ["Sin", "ស៊ិន"], ["Prum", "ព្រំ"],
  ["Nhem", "ញ៉ែម"], ["Try", "ទ្រី"], ["Kheng", "ខេង"], ["Sao", "សៅ"], ["Toch", "ទូច"],
  ["Bun", "ប៊ុន"], ["Mao", "ម៉ៅ"], ["Seng", "សេង"], ["Phan", "ផាន់"], ["Rin", "រិន"],
]

export const givenNamesMale: Array<[string, string]> = [
  ["Rithy", "រិទ្ធី"], ["Dara", "តារា"], ["Vannak", "វណ្ណៈ"], ["Piseth", "ពិសិដ្ឋ"],
  ["Sambath", "សម្បត្តិ"], ["Vichea", "វិជ្ជា"], ["Sokchea", "សុខជា"], ["Vibol", "វិបុល"],
  ["Bunthoeun", "ប៊ុនធឿន"], ["Sophal", "សុផល"], ["Rattana", "រតនា"], ["Chanthou", "ចន្ធូ"],
  ["Sovann", "សុវណ្ណ"], ["Makara", "មករា"], ["Sothea", "សុធា"], ["Kosal", "កុសល"],
  ["Visal", "វិសាល"], ["Narith", "នរិទ្ធ"], ["Panha", "បញ្ញា"], ["Samnang", "សំណាង"],
]

export const givenNamesFemale: Array<[string, string]> = [
  ["Sreyneang", "ស្រីនាង"], ["Bopha", "បុប្ផា"], ["Sreyleak", "ស្រីលក្ខណ៍"], ["Kanika", "កនិកា"],
  ["Sokunthea", "សុគន្ធា"], ["Chanmony", "ចន្ធម្មនី"], ["Sreypov", "ស្រីពៅ"], ["Molika", "មរលិកា"],
  ["Vannary", "វណ្ណារី"], ["Pisey", "ពិសី"], ["Sivmey", "ស៊ីវម៉ី"], ["Dalis", "ដាលីស"],
  ["Sopheak", "សុភ័ក្ត្រ"], ["Chanthy", "ចន្ធី"], ["Sreymom", "ស្រីមុំ"], ["Sothyda", "សុធីតា"],
  ["Nita", "នីតា"], ["Chariya", "ចរិយា"], ["Malis", "ម្លិះ"], ["Theary", "ធារី"],
]

/** Relationship labels, bilingual, weighted towards how Cambodian lists group. */
export const relationships: Array<{ en: string; km: string; weight: number }> = [
  { en: "Uncle / Aunt", km: "ពូ / មីង", weight: 14 },
  { en: "Cousin", km: "បងប្អូនជីដូនមួយ", weight: 14 },
  { en: "Family friend", km: "មិត្តគ្រួសារ", weight: 16 },
  { en: "Neighbour", km: "អ្នកជិតខាង", weight: 10 },
  { en: "Colleague", km: "សហការី", weight: 14 },
  { en: "School friend", km: "មិត្តរួមសាលា", weight: 12 },
  { en: "Grandparent", km: "លោកតា / លោកយាយ", weight: 4 },
  { en: "Sibling", km: "បងប្អូនបង្កើត", weight: 5 },
  { en: "Business associate", km: "ដៃគូអាជីវកម្ម", weight: 6 },
  { en: "Village elder", km: "ចាស់ព្រឹទ្ធាចារ្យ", weight: 5 },
]
