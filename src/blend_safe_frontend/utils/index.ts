import dayjs from "dayjs";
import Web3 from "web3";

export const truncateMiddle = (str: string, start = 4, end = 4) => {
  if (str && str.length > 0) {
    if (str.length <= start + end) {
      return str;
    }
    return `${str.substring(0, start)}...${
      end > 0 ? str.substring(str.length - end) : ""
    }`;
  }
  return "";
};

export const formatDateTime = (date: string, includeTime = true) => {
  if (!date || date.length === 0) {
    return "N/A";
  }
  if (!includeTime) {
    return dayjs(date).format("MMM-DD-YYYY");
  }
  return dayjs(date).format("MMM-DD-YYYY HH:mm:ss");
};

export function isHexString(str) {
  const hexRegex = /^[0-9A-Fa-f]+$/g;
  return hexRegex.test(str);
}

export  const isValidAddress = (address: string) => {
  try {
    const web3 = new Web3()
    web3.utils.toChecksumAddress(address)
    return true;
  } catch (e) {
    return false;
  }
}
