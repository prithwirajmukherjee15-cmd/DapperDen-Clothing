// Major Indian cities and all states/UTs for checkout dropdowns
export const INDIAN_CITIES = [
  "Agra", "Ahmedabad", "Ajmer", "Aligarh", "Allahabad (Prayagraj)", "Amritsar",
  "Aurangabad", "Bengaluru", "Bhopal", "Bhubaneswar", "Chandigarh", "Chennai",
  "Coimbatore", "Dehradun", "Delhi", "Dhanbad", "Faridabad", "Ghaziabad", "Goa (Panaji)",
  "Gurugram", "Guwahati", "Gwalior", "Howrah", "Hyderabad", "Indore", "Jabalpur",
  "Jaipur", "Jalandhar", "Jammu", "Jamshedpur", "Jodhpur", "Kanpur", "Kochi", "Kolkata",
  "Kota", "Kozhikode", "Lucknow", "Ludhiana", "Madurai", "Mangaluru", "Meerut", "Mumbai",
  "Mysuru", "Nagpur", "Nashik", "Navi Mumbai", "Noida", "Patna", "Pune", "Raipur",
  "Rajkot", "Ranchi", "Salem", "Shimla", "Srinagar", "Surat", "Thane", "Thiruvananthapuram",
  "Tiruchirappalli", "Udaipur", "Vadodara", "Varanasi", "Vijayawada", "Visakhapatnam", "Warangal",
];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi (NCT)", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

export const INDIAN_BANKS = [
  "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank",
  "Punjab National Bank", "Bank of Baroda", "Yes Bank", "IndusInd Bank", "IDFC First Bank",
  "Union Bank of India", "Canara Bank", "Federal Bank", "RBL Bank", "Bank of India",
];

// First three digits of a PIN code -> [city, state] for the big metros, and first two digits -> state
// where the postal circle maps to one state. Used only to pre-fill empty fields; the shopper can change them.
const PIN3 = {
  110: ["Delhi", "Delhi (NCT)"], 400: ["Mumbai", "Maharashtra"], 411: ["Pune", "Maharashtra"], 560: ["Bengaluru", "Karnataka"],
  600: ["Chennai", "Tamil Nadu"], 700: ["Kolkata", "West Bengal"], 500: ["Hyderabad", "Telangana"], 380: ["Ahmedabad", "Gujarat"],
  302: ["Jaipur", "Rajasthan"], 226: ["Lucknow", "Uttar Pradesh"],
};
const PIN2 = {
  11: "Delhi (NCT)", 12: "Haryana", 13: "Haryana", 14: "Punjab", 15: "Punjab", 17: "Himachal Pradesh", 30: "Rajasthan", 31: "Rajasthan",
  32: "Rajasthan", 33: "Rajasthan", 34: "Rajasthan", 36: "Gujarat", 37: "Gujarat", 38: "Gujarat", 39: "Gujarat", 40: "Maharashtra",
  41: "Maharashtra", 42: "Maharashtra", 43: "Maharashtra", 44: "Maharashtra", 45: "Madhya Pradesh", 46: "Madhya Pradesh",
  47: "Madhya Pradesh", 48: "Madhya Pradesh", 49: "Chhattisgarh", 50: "Telangana", 52: "Andhra Pradesh", 53: "Andhra Pradesh",
  56: "Karnataka", 57: "Karnataka", 58: "Karnataka", 59: "Karnataka", 60: "Tamil Nadu", 61: "Tamil Nadu", 62: "Tamil Nadu",
  63: "Tamil Nadu", 64: "Tamil Nadu", 67: "Kerala", 68: "Kerala", 69: "Kerala", 70: "West Bengal", 71: "West Bengal",
  72: "West Bengal", 73: "West Bengal", 74: "West Bengal", 75: "Odisha", 76: "Odisha", 77: "Odisha", 78: "Assam",
  80: "Bihar", 81: "Bihar", 84: "Bihar", 85: "Bihar", 82: "Jharkhand", 83: "Jharkhand",
};
export function placeFromPincode(pin) {
  if (!/^\d{6}$/.test(pin || "")) return null;
  const [city, state] = PIN3[pin.slice(0, 3)] || [null, PIN2[pin.slice(0, 2)] || null];
  return {
    city: INDIAN_CITIES.includes(city) ? city : "",
    stateName: INDIAN_STATES.includes(state) ? state : "",
  };
}
