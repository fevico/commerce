
export const generateOrderNumber = (length: number): string => {
  const prefix = 'YOAMART';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = ''; // Holds the random alphanumeric part

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomPart += characters[randomIndex];
  }

  return `${prefix}-${randomPart}`; // Combine prefix and random part with a hyphen
};

  

  
export const generateToken = (length = 4) =>{
  // decallar variable 
  let otp = "";
  
  for(let i = 0; i < length; i++){
      const digit = Math.floor(Math.random() * 10)
      otp += digit
  }
  return otp;
}